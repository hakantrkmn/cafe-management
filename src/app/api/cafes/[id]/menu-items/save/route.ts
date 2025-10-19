import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface SaveMenuItemsRequest {
  menuItems: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
    isAvailable: boolean;
    hasSizes: boolean;
    sizes?: {
      SMALL: number;
      MEDIUM: number;
      LARGE: number;
    };
    categoryId: string;
    cafeId: string;
    createdAt: Date;
    updatedAt: Date;
    _status: "new" | "modified" | "deleted";
    _tempId?: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: SaveMenuItemsRequest = await request.json();

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

    // Execute all operations in a transaction with increased timeout
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Delete operations first
        const validDeleteIds = body.menuItems
          .filter((item) => item._status === "deleted")
          .map((item) => item.id)
          .filter((id) => !id.startsWith("temp_"));

        if (validDeleteIds.length > 0) {
          await tx.menuItem.deleteMany({
            where: {
              id: { in: validDeleteIds },
              cafeId: id,
            },
          });
        }

        // Create operations - Batch create all menu items at once
        const createData = body.menuItems
          .filter((item) => item._status === "new")
          .map((item) => ({
            name: item.name,
            price: item.price,
            description: item.description,
            isAvailable: item.isAvailable,
            hasSizes: item.hasSizes,
            categoryId: item.categoryId,
            cafeId: id,
          }));

        const createdMenuItems =
          createData.length > 0
            ? await tx.menuItem.createMany({
                data: createData,
              })
            : { count: 0 };

        // Get created menu items to create prices
        const newMenuItems = body.menuItems.filter(
          (item) => item._status === "new"
        );
        if (newMenuItems.length > 0) {
          const createdItems = await tx.menuItem.findMany({
            where: {
              cafeId: id,
              name: { in: newMenuItems.map((item) => item.name) },
            },
          });

          // Batch create all prices at once
          const allPrices = [];
          for (const item of newMenuItems) {
            if (item.hasSizes && item.sizes) {
              const menuItem = createdItems.find((ci) => ci.name === item.name);
              if (menuItem) {
                allPrices.push(
                  {
                    menuItemId: menuItem.id,
                    size: "SMALL" as const,
                    price: item.sizes.SMALL,
                  },
                  {
                    menuItemId: menuItem.id,
                    size: "MEDIUM" as const,
                    price: item.sizes.MEDIUM,
                  },
                  {
                    menuItemId: menuItem.id,
                    size: "LARGE" as const,
                    price: item.sizes.LARGE,
                  }
                );
              }
            }
          }

          if (allPrices.length > 0) {
            await tx.menuItemPrice.createMany({
              data: allPrices,
            });
          }
        }

        // Update operations - Batch update
        const validUpdates = body.menuItems.filter(
          (item) => item._status === "modified" && !item.id.startsWith("temp_")
        );

        if (validUpdates.length > 0) {
          // First, delete all existing prices for items being updated
          const updateIds = validUpdates.map((item) => item.id);
          await tx.menuItemPrice.deleteMany({
            where: {
              menuItemId: { in: updateIds },
            },
          });

          // Batch update all menu items
          await Promise.all(
            validUpdates.map((item) =>
              tx.menuItem.update({
                where: { id: item.id },
                data: {
                  name: item.name,
                  price: item.price,
                  description: item.description,
                  isAvailable: item.isAvailable,
                  hasSizes: item.hasSizes,
                  categoryId: item.categoryId,
                },
              })
            )
          );

          // Batch create all new prices for updated items
          const allUpdatePrices = [];
          for (const item of validUpdates) {
            if (item.hasSizes && item.sizes) {
              allUpdatePrices.push(
                {
                  menuItemId: item.id,
                  size: "SMALL" as const,
                  price: item.sizes.SMALL,
                },
                {
                  menuItemId: item.id,
                  size: "MEDIUM" as const,
                  price: item.sizes.MEDIUM,
                },
                {
                  menuItemId: item.id,
                  size: "LARGE" as const,
                  price: item.sizes.LARGE,
                }
              );
            }
          }

          if (allUpdatePrices.length > 0) {
            await tx.menuItemPrice.createMany({
              data: allUpdatePrices,
            });
          }
        }

        return {
          createdMenuItems,
        };
      },
      {
        timeout: 30000, // 30 seconds timeout
      }
    );

    return NextResponse.json({
      message: "Menü öğeleri başarıyla kaydedildi.",
      result,
    });
  } catch (error) {
    console.error("Error saving menu items:", error);
    return NextResponse.json(
      { message: "Menü öğeleri kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
