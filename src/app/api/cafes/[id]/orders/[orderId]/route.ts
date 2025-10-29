import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateOrderItemRequest, OrderProduct } from "@/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: cafeId, orderId } = await params;
    const body = await request.json();

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

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: { id: orderId, cafeId },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    let updatedOrder;

    if (body.products !== undefined) {
      // Products array güncelleniyorsa (deleteProduct, markProductAsPaid durumu)
      // Tüm ürünler ödendi mi kontrol et
      const allProductsPaid = body.products.every(
        (product: { isPaid: boolean }) => product.isPaid
      );

      // Eğer totalAmount gönderilmişse, bu deleteProduct işlemi
      // Eğer totalAmount gönderilmemişse, bu markProductAsPaid işlemi
      const updateData = {
        products: body.products, // Prisma JSON field
        isPaid: allProductsPaid,
        paidAt: allProductsPaid ? new Date() : null,
        ...(body.totalAmount !== undefined && {
          totalAmount: body.totalAmount,
        }),
      };

      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          table: true,
          staff: true,
          orderItems: {
            include: {
              orderItemExtras: true,
            },
          },
        },
      });
    } else if (body.isPaid !== undefined) {
      // Mark as paid/unpaid (sadece isPaid güncelleniyorsa)
      const updateData: {
        isPaid: boolean;
        paidAt: Date | null;
      } = {
        isPaid: body.isPaid,
        paidAt: body.isPaid ? new Date() : null,
      };

      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          table: true,
          staff: true,
          orderItems: {
            include: {
              orderItemExtras: true,
            },
          },
        },
      });

      // If paid, mark table as available
      if (body.isPaid) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { isOccupied: false },
        });
      }
    } else if (body.orderItems) {
      // Add items to existing order
      let additionalTotal = 0;

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

        additionalTotal += itemTotal;
      }

      // Update order in transaction
      updatedOrder = await prisma.$transaction(async (tx) => {
        // Create new products with individual payment tracking
        const newProductsPromises = body.orderItems.map(
          async (item: CreateOrderItemRequest) => {
            const menuItem = await tx.menuItem.findUniqueOrThrow({
              where: { id: item.menuItemId },
              include: { prices: true },
            });

            // Size fiyatını hesapla
            let itemPrice = menuItem.price;
            if (menuItem.hasSizes && item.size && menuItem.prices) {
              const sizePrice = menuItem.prices.find(
                (p) => p.size === item.size
              );
              if (sizePrice) {
                itemPrice = sizePrice.price;
              }
            }

            // Extras fiyatlarını hesapla (ayrı tutulacak)
            const extras: { id: string; name: string; price: number }[] = [];

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

            return Array(item.quantity)
              .fill(null)
              .map(() => ({
                id: item.menuItemId,
                isPaid: false,
                price: itemPrice, // Sadece ürün fiyatı (sabit)
                size: item.size,
                extras: extras.length > 0 ? extras : undefined, // Extras ayrı tutulur
              }));
          }
        );

        // Wait for all async operations to complete
        const resolvedNewProducts = await Promise.all(newProductsPromises);

        // Get existing products from this order only
        const currentOrder = await tx.order.findUnique({
          where: { id: orderId },
          select: { products: true },
        });

        let updatedProducts: OrderProduct[] = [];

        // Check if this is a campaign addition with campaign info
        if (body.campaignId && body.campaignName && body.campaignPrice) {
          // Create campaign product with internal products array
          const campaignProducts = [];

          for (const item of body.orderItems) {
            const menuItem = await tx.menuItem.findUniqueOrThrow({
              where: { id: item.menuItemId },
              include: { prices: true },
            });

            // Size fiyatını hesapla
            let itemPrice = menuItem.price;
            if (menuItem.hasSizes && item.size && menuItem.prices) {
              const sizePrice = menuItem.prices.find(
                (p) => p.size === item.size
              );
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

          // Create campaign product
          const existingProducts =
            (currentOrder?.products as unknown as OrderProduct[]) || [];
          updatedProducts = [
            ...existingProducts,
            {
              id: body.campaignId, // Use actual campaign ID from database
              isPaid: false,
              price: body.campaignPrice,
              size: undefined,
              extras: undefined,
              campaignId: body.campaignId,
              campaignName: body.campaignName,
              products: campaignProducts, // Campaign's internal products
            },
          ];

          // Update additionalTotal to use campaign price
          additionalTotal = body.campaignPrice;
        } else {
          // Regular order - combine with existing products (allow duplicates)
          const existingProducts =
            (currentOrder?.products as unknown as OrderProduct[]) || [];
          updatedProducts = [
            ...existingProducts,
            ...resolvedNewProducts.flat(),
          ];
        }

        // Create new order items
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
              orderId: orderId,
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

        // Update order total and products
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            totalAmount: {
              increment: additionalTotal,
            },
            // @ts-expect-error Prisma JSON field type compatibility
            products: updatedProducts,
          },
          include: {
            table: true,
            staff: true,
            orderItems: {
              include: {
                orderItemExtras: true,
              },
            },
          },
        });

        return updatedOrder;
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Sipariş başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Update order error:", error);

    // Prisma error handling
    if (error instanceof Error) {
      console.error("Error details:", error.message);

      // Check if it's a field validation error
      if (
        error.message.includes("Unknown field") ||
        error.message.includes("products")
      ) {
        return NextResponse.json(
          {
            message:
              "Database schema güncellenmemiş. Lütfen migration çalıştırın.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Sipariş güncellenemedi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: cafeId, orderId } = await params;

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

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: { id: orderId, cafeId },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Delete order and free table in transaction
    await prisma.$transaction(async (tx) => {
      // Delete order (cascade will delete order items and extras)
      await tx.order.delete({
        where: { id: orderId },
      });

      // Mark table as available
      await tx.table.update({
        where: { id: order.tableId },
        data: { isOccupied: false },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Sipariş başarıyla iptal edildi",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { message: "Sipariş iptal edilemedi" },
      { status: 500 }
    );
  }
}
