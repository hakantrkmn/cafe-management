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

    // Execute all operations in a transaction
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

        // Create operations
        const createData = body.menuItems
          .filter((item) => item._status === "new")
          .map((item) => ({
            name: item.name,
            price: item.price,
            description: item.description,
            isAvailable: item.isAvailable,
            categoryId: item.categoryId,
            cafeId: id,
          }));

        const createdMenuItems =
          createData.length > 0
            ? await Promise.all(
                createData.map((data) => tx.menuItem.create({ data }))
              )
            : [];

        // Update operations
        const validUpdates = body.menuItems.filter(
          (item) => item._status === "modified" && !item.id.startsWith("temp_")
        );

        if (validUpdates.length > 0) {
          await Promise.all(
            validUpdates.map((item) =>
              tx.menuItem.update({
                where: { id: item.id },
                data: {
                  name: item.name,
                  price: item.price,
                  description: item.description,
                  isAvailable: item.isAvailable,
                  categoryId: item.categoryId,
                },
              })
            )
          );
        }

        return {
          createdMenuItems,
        };
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
