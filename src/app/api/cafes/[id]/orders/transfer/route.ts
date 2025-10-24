import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const body = await request.json();
    const { sourceTableId, targetTableId } = body;

    // Validate input
    if (!sourceTableId || !targetTableId) {
      return NextResponse.json(
        { message: "Source and target table IDs are required" },
        { status: 400 }
      );
    }

    if (sourceTableId === targetTableId) {
      return NextResponse.json(
        { message: "Source and target tables cannot be the same" },
        { status: 400 }
      );
    }

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

    // Verify both tables exist and belong to this cafe
    const [sourceTable, targetTable] = await Promise.all([
      prisma.table.findFirst({
        where: { id: sourceTableId, cafeId },
      }),
      prisma.table.findFirst({
        where: { id: targetTableId, cafeId },
      }),
    ]);

    if (!sourceTable) {
      return NextResponse.json(
        { message: "Source table not found" },
        { status: 404 }
      );
    }

    if (!targetTable) {
      return NextResponse.json(
        { message: "Target table not found" },
        { status: 404 }
      );
    }

    // Check if target table has any unpaid orders
    const targetTableOrders = await prisma.order.findMany({
      where: {
        tableId: targetTableId,
        cafeId,
        isPaid: false,
      },
    });

    if (targetTableOrders.length > 0) {
      return NextResponse.json(
        { message: "Target table has unpaid orders. Cannot transfer." },
        { status: 400 }
      );
    }

    // Get all unpaid orders from source table
    const sourceOrders = await prisma.order.findMany({
      where: {
        tableId: sourceTableId,
        cafeId,
        isPaid: false,
      },
      include: {
        orderItems: {
          include: {
            orderItemExtras: true,
          },
        },
      },
    });

    if (sourceOrders.length === 0) {
      return NextResponse.json(
        { message: "No unpaid orders found at source table" },
        { status: 400 }
      );
    }

    // Transfer orders in transaction
    await prisma.$transaction(async (tx) => {
      // Create new orders for target table
      for (const sourceOrder of sourceOrders) {
        // Create new order with same data but new table
        const newOrder = await tx.order.create({
          data: {
            cafeId: sourceOrder.cafeId,
            tableId: targetTableId,
            staffId: sourceOrder.staffId,
            totalAmount: sourceOrder.totalAmount,
            isPaid: sourceOrder.isPaid,
            products: sourceOrder.products as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            createdAt: sourceOrder.createdAt, // Keep original creation time
            paidAt: sourceOrder.paidAt,
          },
        });

        // Copy order items
        for (const orderItem of sourceOrder.orderItems) {
          const newOrderItem = await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              menuItemId: orderItem.menuItemId,
              menuItemName: orderItem.menuItemName,
              menuItemPrice: orderItem.menuItemPrice,
              quantity: orderItem.quantity,
              subtotal: orderItem.subtotal,
              size: orderItem.size,
              createdAt: orderItem.createdAt, // Keep original creation time
            },
          });

          // Copy order item extras
          for (const orderItemExtra of orderItem.orderItemExtras) {
            await tx.orderItemExtra.create({
              data: {
                orderItemId: newOrderItem.id,
                extraId: orderItemExtra.extraId,
                extraName: orderItemExtra.extraName,
                extraPrice: orderItemExtra.extraPrice,
                quantity: orderItemExtra.quantity,
              },
            });
          }
        }

        // Delete order items and extras first, then the order
        await tx.orderItemExtra.deleteMany({
          where: {
            orderItem: {
              orderId: sourceOrder.id,
            },
          },
        });

        await tx.orderItem.deleteMany({
          where: {
            orderId: sourceOrder.id,
          },
        });

        await tx.order.delete({
          where: { id: sourceOrder.id },
        });
      }

      // Update table statuses
      await tx.table.update({
        where: { id: sourceTableId },
        data: { isOccupied: false },
      });

      await tx.table.update({
        where: { id: targetTableId },
        data: { isOccupied: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${sourceOrders.length} order(s) from ${sourceTable.name} to ${targetTable.name}`,
    });
  } catch (error) {
    console.error("Transfer order error:", error);
    return NextResponse.json(
      { message: "Failed to transfer orders" },
      { status: 500 }
    );
  }
}
