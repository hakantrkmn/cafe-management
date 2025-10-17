import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    // Build date filter
    const dateFilter: {
      cafeId: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      cafeId,
    };

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = endDateTime;
      }
    }

    // Build time filter (if provided)
    if (startTime || endTime) {
      // Time filtering would require more complex logic with createdAt
      // For now, we'll use date filtering only
    }

    // Get orders with detailed information
    const orders = await prisma.order.findMany({
      where: dateFilter,
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

    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Get unique tables count
    const uniqueTableIds = [...new Set(orders.map((order) => order.tableId))];
    const totalTables = uniqueTableIds.length;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Process orders for detailed view
    const processedOrders = orders.map((order) => {
      // Group products by menu item
      const productMap = new Map();

      order.orderItems.forEach((item) => {
        const key = item.menuItemId;
        if (!productMap.has(key)) {
          productMap.set(key, {
            id: item.menuItemId,
            name: item.menuItem.name,
            price: item.menuItemPrice,
            quantity: 0,
            total: 0,
          });
        }
        const product = productMap.get(key);
        product.quantity += 1;
        product.total += item.menuItemPrice;
      });

      // Add extras to products
      order.orderItems.forEach((item) => {
        item.orderItemExtras.forEach((extraItem) => {
          const key = `extra-${extraItem.extraId}`;
          if (!productMap.has(key)) {
            productMap.set(key, {
              id: extraItem.extraId,
              name: extraItem.extra.name,
              price: extraItem.extraPrice,
              quantity: 0,
              total: 0,
            });
          }
          const product = productMap.get(key);
          product.quantity += 1;
          product.total += extraItem.extraPrice;
        });
      });

      return {
        id: order.id,
        tableName: order.table?.name || "Masa Silinmiş",
        createdAt: order.createdAt,
        totalAmount: order.totalAmount || 0,
        isPaid: order.isPaid,
        products: Array.from(productMap.values()),
      };
    });

    // Calculate top products
    const productStats = new Map();

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const key = item.menuItemId;
        if (!productStats.has(key)) {
          productStats.set(key, {
            id: item.menuItemId,
            name: item.menuItem.name,
            totalSold: 0,
            totalRevenue: 0,
          });
        }
        const stats = productStats.get(key);
        stats.totalSold += 1;
        stats.totalRevenue += item.menuItemPrice;
      });

      // Add extras to product stats
      order.orderItems.forEach((item) => {
        item.orderItemExtras.forEach((extraItem) => {
          const key = `extra-${extraItem.extraId}`;
          if (!productStats.has(key)) {
            productStats.set(key, {
              id: extraItem.extraId,
              name: extraItem.extra.name,
              totalSold: 0,
              totalRevenue: 0,
            });
          }
          const stats = productStats.get(key);
          stats.totalSold += 1;
          stats.totalRevenue += extraItem.extraPrice;
        });
      });
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Calculate table statistics
    const tableStatsMap = new Map();

    orders.forEach((order) => {
      const tableId = order.tableId;
      const tableName = order.table?.name || "Masa Silinmiş";

      if (!tableStatsMap.has(tableId)) {
        tableStatsMap.set(tableId, {
          tableId,
          tableName,
          orderCount: 0,
          totalRevenue: 0,
        });
      }

      const stats = tableStatsMap.get(tableId);
      stats.orderCount += 1;
      stats.totalRevenue += order.totalAmount || 0;
    });

    const tableStats = Array.from(tableStatsMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    const reportsData = {
      summary: {
        totalOrders,
        totalRevenue,
        totalTables,
        averageOrderValue,
      },
      orders: processedOrders,
      topProducts,
      tableStats,
    };

    return NextResponse.json({
      success: true,
      data: reportsData,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { message: "Rapor verileri alınamadı" },
      { status: 500 }
    );
  }
}
