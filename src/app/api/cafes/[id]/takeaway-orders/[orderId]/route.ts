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

    // Verify takeaway order exists
    const takeawayOrder = await prisma.takeawayOrder.findFirst({
      where: { id: orderId, cafeId },
      include: { takeawayOrderItems: true },
    });

    if (!takeawayOrder) {
      return NextResponse.json(
        { message: "Takeaway order not found" },
        { status: 404 }
      );
    }

    let updatedTakeawayOrder;

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

      updatedTakeawayOrder = await prisma.takeawayOrder.update({
        where: { id: orderId },
        data: updateData,
        include: {
          staff: true,
          takeawayOrderItems: {
            include: {
              takeawayOrderItemExtras: true,
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

      updatedTakeawayOrder = await prisma.takeawayOrder.update({
        where: { id: orderId },
        data: updateData,
        include: {
          staff: true,
          takeawayOrderItems: {
            include: {
              takeawayOrderItemExtras: true,
            },
          },
        },
      });
    } else if (body.orderItems) {
      // Add items to existing takeaway order
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

      // Update takeaway order in transaction
      updatedTakeawayOrder = await prisma.$transaction(async (tx) => {
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

        // Get existing products from this takeaway order only
        const currentTakeawayOrder = await tx.takeawayOrder.findUnique({
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
            (currentTakeawayOrder?.products as unknown as OrderProduct[]) || [];
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
            (currentTakeawayOrder?.products as unknown as OrderProduct[]) || [];
          updatedProducts = [
            ...existingProducts,
            ...resolvedNewProducts.flat(),
          ];
        }

        // Create new takeaway order items
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
              takeawayOrderId: orderId,
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

        // Update takeaway order total and products
        const updatedTakeawayOrder = await tx.takeawayOrder.update({
          where: { id: orderId },
          data: {
            totalAmount: {
              increment: additionalTotal,
            },
            // @ts-expect-error Prisma JSON field type compatibility
            products: updatedProducts,
          },
          include: {
            staff: true,
            takeawayOrderItems: {
              include: {
                takeawayOrderItemExtras: true,
              },
            },
          },
        });

        return updatedTakeawayOrder;
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedTakeawayOrder,
      message: "Paket servis siparişi başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Update takeaway order error:", error);

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
      { message: "Paket servis siparişi güncellenemedi" },
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

    // Verify takeaway order exists
    const takeawayOrder = await prisma.takeawayOrder.findFirst({
      where: { id: orderId, cafeId },
    });

    if (!takeawayOrder) {
      return NextResponse.json(
        { message: "Takeaway order not found" },
        { status: 404 }
      );
    }

    // Delete takeaway order (cascade will delete takeaway order items and extras)
    await prisma.takeawayOrder.delete({
      where: { id: orderId },
    });

    return NextResponse.json({
      success: true,
      message: "Paket servis siparişi başarıyla iptal edildi",
    });
  } catch (error) {
    console.error("Delete takeaway order error:", error);
    return NextResponse.json(
      { message: "Paket servis siparişi iptal edilemedi" },
      { status: 500 }
    );
  }
}
