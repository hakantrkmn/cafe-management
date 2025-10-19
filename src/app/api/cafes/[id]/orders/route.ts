import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateOrderRequest } from "@/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: cafeId } = await params;
    const body: CreateOrderRequest = await request.json();

    // Verify user has access to this cafe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { cafe: true, managedCafe: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const hasAccess = user.cafeId === cafeId || user.managedCafe?.id === cafeId;

    if (!hasAccess) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Verify table exists and is available
    const table = await prisma.table.findFirst({
      where: { id: body.tableId, cafeId },
    });

    if (!table) {
      return NextResponse.json({ message: "Table not found" }, { status: 404 });
    }

    // Check if there are any unpaid orders at this table
    const existingUnpaidOrders = await prisma.order.findMany({
      where: {
        tableId: body.tableId,
        cafeId,
        isPaid: false,
      },
    });

    if (existingUnpaidOrders.length > 0) {
      return NextResponse.json(
        {
          message:
            "Bu masada ödenmemiş sipariş var. Lütfen mevcut siparişe ekleme yapın.",
          existingOrderId: existingUnpaidOrders[0].id,
        },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const orderItem of body.orderItems) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: orderItem.menuItemId },
        include: { prices: true },
      });

      if (!menuItem) {
        return NextResponse.json(
          { message: `Menu item not found: ${orderItem.menuItemId}` },
          { status: 404 }
        );
      }

      // Get the correct price based on size
      let itemPrice = menuItem.price;
      if (menuItem.hasSizes && orderItem.size && menuItem.prices) {
        const sizePrice = menuItem.prices.find(
          (p) => p.size === orderItem.size
        );
        if (sizePrice) {
          itemPrice = sizePrice.price;
        } else {
          return NextResponse.json(
            { message: `Invalid size for menu item: ${orderItem.menuItemId}` },
            { status: 400 }
          );
        }
      } else if (menuItem.hasSizes && !orderItem.size) {
        return NextResponse.json(
          { message: `Size is required for menu item: ${menuItem.name}` },
          { status: 400 }
        );
      }

      let itemTotal = itemPrice * orderItem.quantity;

      // Add extras
      if (orderItem.extras) {
        for (const extra of orderItem.extras) {
          const extraItem = await prisma.extra.findUnique({
            where: { id: extra.extraId },
          });

          if (extraItem) {
            itemTotal += extraItem.price * extra.quantity;
          }
        }
      }

      totalAmount += itemTotal;
    }

    // Create order with items in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create products array with individual payment tracking
      const orderProductsPromises = body.orderItems.map(async (item) => {
        const menuItem = await tx.menuItem.findUniqueOrThrow({
          where: { id: item.menuItemId },
          include: { prices: true },
        });

        // Get the correct price based on size
        let itemPrice = menuItem.price;
        if (menuItem.hasSizes && item.size && menuItem.prices) {
          const sizePrice = menuItem.prices.find((p) => p.size === item.size);
          if (sizePrice) {
            itemPrice = sizePrice.price;
          }
        }

        // Ekstra fiyatlarını hesapla
        const extras: { id: string; price: number }[] = [];

        if (item.extras && item.extras.length > 0) {
          for (const extra of item.extras) {
            const extraItem = await tx.extra.findUnique({
              where: { id: extra.extraId },
            });

            if (extraItem) {
              const extraTotalPrice = extraItem.price * extra.quantity;

              extras.push({
                id: extra.extraId,
                price: extraTotalPrice,
              });
            }
          }
        }

        // Her ürün için ayrı entry oluştur
        return Array(item.quantity)
          .fill(null)
          .map(() => ({
            id: item.menuItemId,
            isPaid: false,
            price: itemPrice, // Sadece ana ürün fiyatı
            size: item.size, // Include size in products array
            extras: extras.length > 0 ? extras : undefined, // Optional extras
          }));
      });

      const orderProductsArrays = await Promise.all(orderProductsPromises);
      const orderProducts = orderProductsArrays.flat();

      // Create order with individual product payment tracking
      const newOrder = await tx.order.create({
        data: {
          cafeId,
          tableId: body.tableId,
          staffId: session.user.id,
          totalAmount,
          products: orderProducts,
        },
      });

      // Create order items
      for (const orderItem of body.orderItems) {
        const menuItem = await tx.menuItem.findUniqueOrThrow({
          where: { id: orderItem.menuItemId },
          include: { prices: true },
        });

        // Get the correct price based on size
        let itemPrice = menuItem.price;
        if (menuItem.hasSizes && orderItem.size && menuItem.prices) {
          const sizePrice = menuItem.prices.find(
            (p) => p.size === orderItem.size
          );
          if (sizePrice) {
            itemPrice = sizePrice.price;
          }
        }

        // Create menu item name with size if applicable
        let menuItemName = menuItem.name;
        if (orderItem.size) {
          const sizeLabel =
            orderItem.size === "SMALL"
              ? "Küçük"
              : orderItem.size === "MEDIUM"
              ? "Orta"
              : "Büyük";
          menuItemName = `${menuItem.name} (${sizeLabel})`;
        }

        const orderItemRecord = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: orderItem.menuItemId,
            menuItemName: menuItemName,
            menuItemPrice: itemPrice,
            quantity: orderItem.quantity,
            subtotal: itemPrice * orderItem.quantity,
            size: orderItem.size,
          },
        });

        // Create order item extras
        if (orderItem.extras) {
          for (const extra of orderItem.extras) {
            const extraItem = await tx.extra.findUnique({
              where: { id: extra.extraId },
            });

            if (extraItem) {
              await tx.orderItemExtra.create({
                data: {
                  orderItemId: orderItemRecord.id,
                  extraId: extra.extraId,
                  extraName: extraItem.name,
                  extraPrice: extraItem.price,
                  quantity: extra.quantity,
                },
              });

              // Update order item subtotal
              await tx.orderItem.update({
                where: { id: orderItemRecord.id },
                data: {
                  subtotal: {
                    increment: extraItem.price * extra.quantity,
                  },
                },
              });
            }
          }
        }
      }

      // No need to update other orders - each order has its own products

      // Update table as occupied
      await tx.table.update({
        where: { id: body.tableId },
        data: { isOccupied: true },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: "Sipariş başarıyla oluşturuldu",
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { message: "Sipariş oluşturulamadı" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: cafeId } = await params;

    // Verify user has access to this cafe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { cafe: true, managedCafe: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const hasAccess = user.cafeId === cafeId || user.managedCafe?.id === cafeId;

    if (!hasAccess) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Get orders with relations
    const orders = await prisma.order.findMany({
      where: { cafeId },
      include: {
        table: true,
        staff: true,
        orderItems: {
          include: {
            menuItem: true,
            orderItemExtras: {
              include: {
                extra: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { message: "Siparişler alınamadı" },
      { status: 500 }
    );
  }
}
