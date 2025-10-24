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

    // Time filtering will be applied after fetching orders

    // Get orders with detailed information
    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        table: true,
        staff: true,
        orderItems: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
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

    // Apply time filtering if provided
    let filteredOrders = orders;
    if (startTime || endTime) {
      filteredOrders = orders.filter((order) => {
        const orderTime = order.createdAt.toTimeString().slice(0, 5); // HH:mm format
        if (startTime && orderTime < startTime) return false;
        if (endTime && orderTime > endTime) return false;
        return true;
      });
    }

    // Calculate summary statistics
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Get unique tables count
    const uniqueTableIds = [
      ...new Set(filteredOrders.map((order) => order.tableId)),
    ];
    const totalTables = uniqueTableIds.length;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Process orders for detailed view
    const processedOrders = filteredOrders.map((order) => {
      // Group products by menu item
      const productMap = new Map();

      // Check if we have products array (new data structure) or orderItems (legacy)
      const hasProductsArray =
        order.products &&
        Array.isArray(order.products) &&
        order.products.length > 0;

      if (hasProductsArray) {
        // Process products array (new data structure) - prioritize this
        order.products.forEach((productJson) => {
          // Type cast the JSON product to our expected structure
          const product = productJson as {
            id: string;
            isPaid: boolean;
            price: number;
            size?: string;
            extras?: Array<{
              id: string;
              name: string;
              price: number;
            }>;
          };

          // Get menu item details for display name
          const menuItem = order.orderItems.find(
            (item) => item.menuItemId === product.id
          )?.menuItem;
          if (!menuItem) return;

          // Create unique key including size for size-based products
          const sizeKey = product.size ? `-${product.size}` : "";
          const key = `${product.id}${sizeKey}`;

          // Size label mapping
          const sizeLabels = {
            SMALL: "Küçük",
            MEDIUM: "Orta",
            LARGE: "Büyük",
          };

          const sizeLabel = product.size
            ? sizeLabels[product.size as keyof typeof sizeLabels] ||
              product.size
            : undefined;
          const displayName =
            menuItem.name + (sizeLabel ? ` - ${sizeLabel}` : "");

          if (!productMap.has(key)) {
            productMap.set(key, {
              id: key,
              name: displayName,
              size: sizeLabel,
              price: product.price,
              quantity: 0,
              total: 0,
            });
          }
          const productEntry = productMap.get(key);
          productEntry.quantity += 1;
          productEntry.total += product.price;
        });
      } else {
        // Process orderItems (legacy data) - fallback for old orders
        order.orderItems.forEach((item) => {
          // Create unique key including size for size-based products
          const sizeKey = item.size ? `-${item.size}` : "";
          const key = `${item.menuItemId}${sizeKey}`;

          // Size label mapping
          const sizeLabels = {
            SMALL: "Küçük",
            MEDIUM: "Orta",
            LARGE: "Büyük",
          };

          const sizeLabel = item.size
            ? sizeLabels[item.size as keyof typeof sizeLabels] || item.size
            : undefined;
          const displayName =
            item.menuItem.name + (sizeLabel ? ` - ${sizeLabel}` : "");

          if (!productMap.has(key)) {
            productMap.set(key, {
              id: key, // Use the unique key (menuItemId + size) as the ID
              name: displayName,
              size: sizeLabel,
              price: item.menuItemPrice,
              quantity: 0,
              total: 0,
            });
          }
          const product = productMap.get(key);
          product.quantity += 1;
          product.total += item.menuItemPrice;
        });

        // Add extras to products (only for legacy data)
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
      }

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
    const sizeLabels = {
      SMALL: "Küçük",
      MEDIUM: "Orta",
      LARGE: "Büyük",
    };

    filteredOrders.forEach((order) => {
      // Check if we have products array (new data structure) or orderItems (legacy)
      const hasProductsArray =
        order.products &&
        Array.isArray(order.products) &&
        order.products.length > 0;

      if (hasProductsArray) {
        // Process products array (new data structure) - prioritize this
        order.products.forEach((productJson) => {
          // Type cast the JSON product to our expected structure
          const product = productJson as {
            id: string;
            isPaid: boolean;
            price: number;
            size?: string;
            extras?: Array<{
              id: string;
              name: string;
              price: number;
            }>;
          };

          // Get menu item details for display name
          const menuItem = order.orderItems.find(
            (item) => item.menuItemId === product.id
          )?.menuItem;
          if (!menuItem) return;

          // Create unique key including size for size-based products
          const sizeKey = product.size ? `-${product.size}` : "";
          const key = `${product.id}${sizeKey}`;

          const sizeLabel = product.size
            ? sizeLabels[product.size as keyof typeof sizeLabels] ||
              product.size
            : undefined;
          const displayName =
            menuItem.name + (sizeLabel ? ` - ${sizeLabel}` : "");

          if (!productStats.has(key)) {
            productStats.set(key, {
              id: key,
              name: displayName,
              size: sizeLabel,
              category: menuItem.category?.name || "Kategori Yok",
              totalSold: 0,
              totalRevenue: 0,
              averagePrice: 0,
              peakHour: undefined,
              peakDay: undefined,
            });
          }
          const stats = productStats.get(key);
          stats.totalSold += 1;
          stats.totalRevenue += product.price;
        });
      } else {
        // Process orderItems (legacy data) - fallback for old orders
        order.orderItems.forEach((item) => {
          // Create unique key including size for size-based products
          const sizeKey = item.size ? `-${item.size}` : "";
          const key = `${item.menuItemId}${sizeKey}`;

          const sizeLabel = item.size
            ? sizeLabels[item.size as keyof typeof sizeLabels] || item.size
            : undefined;
          const displayName =
            item.menuItem.name + (sizeLabel ? ` - ${sizeLabel}` : "");

          if (!productStats.has(key)) {
            productStats.set(key, {
              id: key, // Use the unique key (menuItemId + size) as the ID
              name: displayName,
              size: sizeLabel,
              category: item.menuItem.category?.name || "Kategori Yok",
              totalSold: 0,
              totalRevenue: 0,
              averagePrice: 0,
              peakHour: undefined,
              peakDay: undefined,
            });
          }
          const stats = productStats.get(key);
          stats.totalSold += 1;
          stats.totalRevenue += item.menuItemPrice;
        });
      }

      // Add extras to product stats
      order.orderItems.forEach((item) => {
        item.orderItemExtras.forEach((extraItem) => {
          const key = `extra-${extraItem.extraId}`;
          if (!productStats.has(key)) {
            productStats.set(key, {
              id: key, // Use the unique key as the ID
              name: extraItem.extra.name,
              size: undefined,
              category: "Ekstralar",
              totalSold: 0,
              totalRevenue: 0,
              averagePrice: 0,
              peakHour: undefined,
              peakDay: undefined,
            });
          }
          const stats = productStats.get(key);
          stats.totalSold += 1;
          stats.totalRevenue += extraItem.extraPrice;
        });
      });
    });

    // Calculate average price and peak times for each product
    productStats.forEach((stats) => {
      stats.averagePrice =
        stats.totalSold > 0 ? stats.totalRevenue / stats.totalSold : 0;

      // Calculate peak hour and day for this product
      const productOrders = filteredOrders.filter((order) =>
        order.orderItems.some((item) => {
          const sizeKey = item.size ? `-${item.size}` : "";
          const key = `${item.menuItemId}${sizeKey}`;
          return key === stats.id; // stats.id is now the unique key
        })
      );

      if (productOrders.length > 0) {
        // Calculate peak hour
        const hourCounts = new Map();
        productOrders.forEach((order) => {
          const hour = order.createdAt.getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });
        const peakHour = Array.from(hourCounts.entries()).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];
        stats.peakHour = peakHour;

        // Calculate peak day
        const dayCounts = new Map();
        productOrders.forEach((order) => {
          const day = order.createdAt.toLocaleDateString("tr-TR", {
            weekday: "long",
          });
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        });
        const peakDay = Array.from(dayCounts.entries()).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];
        stats.peakDay = peakDay;
      }
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Calculate table statistics
    const tableStatsMap = new Map();

    filteredOrders.forEach((order) => {
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

    // Calculate chart data
    const hourlyRevenue: {
      hour: number;
      revenue: number;
      orderCount: number;
    }[] = [];
    const dailyRevenue: {
      date: string;
      revenue: number;
      orderCount: number;
    }[] = [];
    const categoryDistribution = new Map();
    const paymentStatus = { paid: 0, unpaid: 0 };

    // Initialize hourly revenue array (0-23 hours)
    for (let i = 0; i < 24; i++) {
      hourlyRevenue.push({ hour: i, revenue: 0, orderCount: 0 });
    }

    // Process orders for chart data
    filteredOrders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const date = order.createdAt.toISOString().split("T")[0];

      // Hourly revenue
      hourlyRevenue[hour].revenue += order.totalAmount || 0;
      hourlyRevenue[hour].orderCount += 1;

      // Daily revenue
      const existingDay = dailyRevenue.find((d) => d.date === date);
      if (existingDay) {
        existingDay.revenue += order.totalAmount || 0;
        existingDay.orderCount += 1;
      } else {
        dailyRevenue.push({
          date,
          revenue: order.totalAmount || 0,
          orderCount: 1,
        });
      }

      // Payment status
      if (order.isPaid) {
        paymentStatus.paid += 1;
      } else {
        paymentStatus.unpaid += 1;
      }

      // Category distribution
      order.orderItems.forEach((item) => {
        const categoryName = item.menuItem.category?.name || "Kategori Yok";
        if (!categoryDistribution.has(categoryName)) {
          categoryDistribution.set(categoryName, {
            category: categoryName,
            revenue: 0,
            percentage: 0,
          });
        }
        const category = categoryDistribution.get(categoryName);
        category.revenue += item.menuItemPrice;
      });
    });

    // Calculate category percentages
    const totalCategoryRevenue = Array.from(
      categoryDistribution.values()
    ).reduce((sum, cat) => sum + cat.revenue, 0);
    categoryDistribution.forEach((category) => {
      category.percentage =
        totalCategoryRevenue > 0
          ? (category.revenue / totalCategoryRevenue) * 100
          : 0;
    });

    // Calculate payment status percentages
    const totalOrdersForPayment = paymentStatus.paid + paymentStatus.unpaid;
    const paymentStatusData = [
      {
        status: "Ödenmiş",
        count: paymentStatus.paid,
        percentage:
          totalOrdersForPayment > 0
            ? (paymentStatus.paid / totalOrdersForPayment) * 100
            : 0,
      },
      {
        status: "Ödenmemiş",
        count: paymentStatus.unpaid,
        percentage:
          totalOrdersForPayment > 0
            ? (paymentStatus.unpaid / totalOrdersForPayment) * 100
            : 0,
      },
    ];

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
      chartData: {
        hourlyRevenue,
        dailyRevenue: dailyRevenue.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
        categoryDistribution: Array.from(categoryDistribution.values()).sort(
          (a, b) => b.revenue - a.revenue
        ),
        paymentStatus: paymentStatusData,
      },
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
