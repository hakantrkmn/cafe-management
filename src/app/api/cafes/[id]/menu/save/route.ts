import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface SaveMenuRequest {
  categories: {
    create: Array<{
      name: string;
      order: number;
    }>;
    update: Array<{
      id: string;
      data: {
        name?: string;
        order?: number;
      };
    }>;
    delete: string[];
  };
  menuItems: {
    create: Array<{
      categoryId: string;
      name: string;
      price: number;
      description?: string;
      isAvailable?: boolean;
    }>;
    update: Array<{
      id: string;
      data: {
        categoryId?: string;
        name?: string;
        price?: number;
        description?: string;
        isAvailable?: boolean;
      };
    }>;
    delete: string[];
  };
  extras: {
    create: Array<{
      name: string;
      price: number;
      isAvailable?: boolean;
    }>;
    update: Array<{
      id: string;
      data: {
        name?: string;
        price?: number;
        isAvailable?: boolean;
      };
    }>;
    delete: string[];
  };
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
    const body: SaveMenuRequest = await request.json();

    // Verify user has access to this cafe and is manager
    const cafe = await prisma.cafe.findFirst({
      where: {
        id,
        managerId: session.user.id,
      },
    });

    if (!cafe) {
      return NextResponse.json({ message: "Cafe not found" }, { status: 404 });
    }

    // Execute all operations in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Delete operations first (to avoid foreign key constraints)
        // Filter out temp IDs (they don't exist in DB)
        const validMenuItemIds = body.menuItems.delete.filter(
          (id) => !id.startsWith("temp_")
        );
        const validExtraIds = body.extras.delete.filter(
          (id) => !id.startsWith("temp_")
        );
        const validCategoryIds = body.categories.delete.filter(
          (id) => !id.startsWith("temp_")
        );

        await Promise.all([
          // Delete menu items first (they reference categories)
          validMenuItemIds.length > 0
            ? tx.menuItem.deleteMany({
                where: {
                  id: { in: validMenuItemIds },
                  cafeId: id,
                },
              })
            : Promise.resolve(),
          // Delete extras
          validExtraIds.length > 0
            ? tx.extra.deleteMany({
                where: {
                  id: { in: validExtraIds },
                  cafeId: id,
                },
              })
            : Promise.resolve(),
          // Delete categories
          validCategoryIds.length > 0
            ? tx.category.deleteMany({
                where: {
                  id: { in: validCategoryIds },
                  cafeId: id,
                },
              })
            : Promise.resolve(),
        ]);

        // Create operations
        const [createdCategories, createdMenuItems, createdExtras] =
          await Promise.all([
            // Create categories
            Promise.all(
              body.categories.create.map((category) =>
                tx.category.create({
                  data: {
                    ...category,
                    cafeId: id,
                  },
                })
              )
            ),
            // Create menu items
            Promise.all(
              body.menuItems.create.map((item) =>
                tx.menuItem.create({
                  data: {
                    ...item,
                    cafeId: id,
                  },
                })
              )
            ),
            // Create extras
            Promise.all(
              body.extras.create.map((extra) =>
                tx.extra.create({
                  data: {
                    ...extra,
                    cafeId: id,
                  },
                })
              )
            ),
          ]);

        // Update operations
        // Filter out temp IDs for updates
        const validCategoryUpdates = body.categories.update.filter(
          ({ id }) => !id.startsWith("temp_")
        );
        const validMenuItemUpdates = body.menuItems.update.filter(
          ({ id }) => !id.startsWith("temp_")
        );
        const validExtraUpdates = body.extras.update.filter(
          ({ id }) => !id.startsWith("temp_")
        );

        await Promise.all([
          // Update categories
          validCategoryUpdates.length > 0
            ? Promise.all(
                validCategoryUpdates.map(({ id: categoryId, data }) =>
                  tx.category.update({
                    where: { id: categoryId },
                    data,
                  })
                )
              )
            : Promise.resolve(),
          // Update menu items
          validMenuItemUpdates.length > 0
            ? Promise.all(
                validMenuItemUpdates.map(({ id: itemId, data }) =>
                  tx.menuItem.update({
                    where: { id: itemId },
                    data,
                  })
                )
              )
            : Promise.resolve(),
          // Update extras
          validExtraUpdates.length > 0
            ? Promise.all(
                validExtraUpdates.map(({ id: extraId, data }) =>
                  tx.extra.update({
                    where: { id: extraId },
                    data,
                  })
                )
              )
            : Promise.resolve(),
        ]);

        return {
          createdCategories,
          createdMenuItems,
          createdExtras,
        };
      }
    );

    return NextResponse.json({
      message: "Menu saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Save menu error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
