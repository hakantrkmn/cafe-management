import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTakeawayOrderRequest } from "@/types";
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
    const body: CreateTakeawayOrderRequest = await request.json();

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

    // Check if this is a campaign order by looking for campaign price pattern
    const isCampaignOrder = body.orderItems.length > 1;
    let campaignId: string | undefined;
    let campaignName: string | undefined;
    let campaignPrice: number | undefined;

    if (isCampaignOrder) {
      // Try to find matching campaign
      const campaigns = await prisma.campaign.findMany({
        where: { cafeId, isActive: true },
        include: { campaignItems: true },
      });

      for (const campaign of campaigns) {
        const campaignItemIds = campaign.campaignItems.map(
          (item) => item.menuItemId
        );
        const orderItemIds = body.orderItems.map((item) => item.menuItemId);

        // Check if all campaign items match order items
        const matches =
          campaignItemIds.every((id) => orderItemIds.includes(id)) &&
          orderItemIds.every((id) => campaignItemIds.includes(id));

        if (matches) {
          campaignId = campaign.id;
          campaignName = campaign.name;
          campaignPrice = campaign.price;
          break;
        }
      }
    }

    // Calculate total amount
    let totalAmount = 0;

    // If campaign found, use campaign price as total
    if (campaignPrice) {
      totalAmount = campaignPrice;
    } else {
      // If not a campaign order, calculate individual item prices
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

        // Size fiyatını hesapla
        let itemPrice = menuItem.price;
        if (menuItem.hasSizes && orderItem.size && menuItem.prices) {
          const sizePrice = menuItem.prices.find(
            (p) => p.size === orderItem.size
          );
          if (sizePrice) {
            itemPrice = sizePrice.price;
          }
        }

        // Extras fiyatlarını hesapla
        let extrasTotal = 0;
        if (orderItem.extras && orderItem.extras.length > 0) {
          for (const extra of orderItem.extras) {
            const extraItem = await prisma.extra.findUnique({
              where: { id: extra.extraId },
            });
            if (extraItem) {
              extrasTotal += extraItem.price * extra.quantity;
            }
          }
        }

        // Toplam fiyat = (ürün fiyatı + extras) * quantity
        const itemTotal = (itemPrice + extrasTotal) * orderItem.quantity;
        totalAmount += itemTotal;
      }
    }

    // Create takeaway order with items in transaction
    const takeawayOrder = await prisma.$transaction(async (tx) => {
      // Basit products array oluştur
      const orderProducts = [];

      // If this is a campaign order, add campaign as single product with internal products array
      if (campaignId && campaignName && campaignPrice) {
        // Create products array for campaign
        const campaignProducts = [];

        for (const item of body.orderItems) {
          const menuItem = await tx.menuItem.findUniqueOrThrow({
            where: { id: item.menuItemId },
            include: { prices: true },
          });

          // Size fiyatını hesapla
          let itemPrice = menuItem.price;
          if (menuItem.hasSizes && item.size && menuItem.prices) {
            const sizePrice = menuItem.prices.find((p) => p.size === item.size);
            if (sizePrice) {
              itemPrice = sizePrice.price;
            }
          }

          // Add to campaign products array
          campaignProducts.push({
            id: item.menuItemId,
            price: itemPrice,
            quantity: item.quantity,
            size: item.size,
          });
        }

        // Add campaign as single product
        orderProducts.push({
          id: campaignId, // Use actual campaign ID from database
          isPaid: false,
          price: campaignPrice,
          size: undefined,
          extras: undefined,
          campaignId: campaignId,
          campaignName: campaignName,
          products: campaignProducts, // Campaign's internal products
        });
      } else {
        // Regular order - add individual products
        for (const item of body.orderItems) {
          const menuItem = await tx.menuItem.findUniqueOrThrow({
            where: { id: item.menuItemId },
            include: { prices: true },
          });

          // Size fiyatını hesapla
          let itemPrice = menuItem.price;
          if (menuItem.hasSizes && item.size && menuItem.prices) {
            const sizePrice = menuItem.prices.find((p) => p.size === item.size);
            if (sizePrice) {
              itemPrice = sizePrice.price;
            }
          }

          // Extras fiyatlarını hesapla (ayrı tutulacak)
          const extras = [];

          if (item.extras && item.extras.length > 0) {
            for (const extra of item.extras) {
              const extraItem = await tx.extra.findUnique({
                where: { id: extra.extraId },
              });
              if (extraItem) {
                const extraPrice = extraItem.price * extra.quantity;
                extras.push({
                  id: extra.extraId,
                  name: extraItem.name,
                  price: extraPrice,
                });
              }
            }
          }

          // Her ürün için ayrı entry oluştur (ürün fiyatı sabit, extras ayrı)
          for (let i = 0; i < item.quantity; i++) {
            orderProducts.push({
              id: item.menuItemId,
              isPaid: false,
              price: itemPrice, // Sadece ürün fiyatı (sabit)
              size: item.size,
              extras: extras.length > 0 ? extras : undefined, // Extras ayrı tutulur
            });
          }
        }
      }

      // Create takeaway order with individual product payment tracking
      const newTakeawayOrder = await tx.takeawayOrder.create({
        data: {
          cafeId,
          staffId: session.user.id,
          totalAmount,
          products: orderProducts,
          campaignId,
          campaignName,
          campaignPrice,
        },
      });

      // Create takeaway order items
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

        const takeawayOrderItemRecord = await tx.takeawayOrderItem.create({
          data: {
            takeawayOrderId: newTakeawayOrder.id,
            menuItemId: orderItem.menuItemId,
            menuItemName: menuItemName,
            menuItemPrice: itemPrice,
            quantity: orderItem.quantity,
            subtotal: itemPrice * orderItem.quantity,
            size: orderItem.size,
          },
        });

        // Create takeaway order item extras
        if (orderItem.extras) {
          for (const extra of orderItem.extras) {
            const extraItem = await tx.extra.findUnique({
              where: { id: extra.extraId },
            });

            if (extraItem) {
              await tx.takeawayOrderItemExtra.create({
                data: {
                  takeawayOrderItemId: takeawayOrderItemRecord.id,
                  extraId: extra.extraId,
                  extraName: extraItem.name,
                  extraPrice: extraItem.price,
                  quantity: extra.quantity,
                },
              });

              // Update takeaway order item subtotal
              await tx.takeawayOrderItem.update({
                where: { id: takeawayOrderItemRecord.id },
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

      return newTakeawayOrder;
    });

    return NextResponse.json({
      success: true,
      data: takeawayOrder,
      message: "Paket servis siparişi başarıyla oluşturuldu",
    });
  } catch (error) {
    console.error("Create takeaway order error:", error);
    return NextResponse.json(
      { message: "Paket servis siparişi oluşturulamadı" },
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

    // Get takeaway orders with relations
    const takeawayOrders = await prisma.takeawayOrder.findMany({
      where: { cafeId },
      include: {
        staff: true,
        takeawayOrderItems: {
          include: {
            menuItem: true,
            takeawayOrderItemExtras: {
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
      data: takeawayOrders,
    });
  } catch (error) {
    console.error("Get takeaway orders error:", error);
    return NextResponse.json(
      { message: "Paket servis siparişleri alınamadı" },
      { status: 500 }
    );
  }
}

