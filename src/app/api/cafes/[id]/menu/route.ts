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

    const { id } = await params;

    // Verify user has access to this cafe
    const cafe = await prisma.cafe.findFirst({
      where: {
        id,
        OR: [
          { managerId: session.user.id },
          { staff: { some: { id: session.user.id } } },
        ],
      },
    });

    if (!cafe) {
      return NextResponse.json({ message: "Cafe not found" }, { status: 404 });
    }

    // Fetch all menu data
    const [categories, menuItems, extras] = await Promise.all([
      prisma.category.findMany({
        where: { cafeId: id },
        orderBy: { order: "asc" },
      }),
      prisma.menuItem.findMany({
        where: { cafeId: id },
        include: {
          category: true,
          prices: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.extra.findMany({
        where: { cafeId: id },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Transform menuItems to include sizes object from prices array
    const transformedMenuItems = menuItems.map((item) => {
      if (item.hasSizes && item.prices && item.prices.length > 0) {
        const sizes = {
          SMALL: 0,
          MEDIUM: 0,
          LARGE: 0,
        };

        item.prices.forEach((price) => {
          sizes[price.size] = price.price;
        });

        return {
          ...item,
          sizes,
        };
      }

      return item;
    });

    return NextResponse.json({
      data: {
        categories,
        menuItems: transformedMenuItems,
        extras,
      },
    });
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
