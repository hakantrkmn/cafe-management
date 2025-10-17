import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface SaveCategoriesRequest {
  categories: Array<{
    id: string;
    name: string;
    order: number;
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
    const body: SaveCategoriesRequest = await request.json();

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
        const validDeleteIds = body.categories
          .filter((cat) => cat._status === "deleted")
          .map((cat) => cat.id)
          .filter((id) => !id.startsWith("temp_"));

        if (validDeleteIds.length > 0) {
          await tx.category.deleteMany({
            where: {
              id: { in: validDeleteIds },
              cafeId: id,
            },
          });
        }

        // Create operations
        const createData = body.categories
          .filter((cat) => cat._status === "new")
          .map((cat) => ({
            name: cat.name,
            order: cat.order,
            cafeId: id,
          }));

        const createdCategories =
          createData.length > 0
            ? await Promise.all(
                createData.map((data) => tx.category.create({ data }))
              )
            : [];

        // Update operations
        const validUpdates = body.categories.filter(
          (cat) => cat._status === "modified" && !cat.id.startsWith("temp_")
        );

        if (validUpdates.length > 0) {
          await Promise.all(
            validUpdates.map((cat) =>
              tx.category.update({
                where: { id: cat.id },
                data: {
                  name: cat.name,
                  order: cat.order,
                },
              })
            )
          );
        }

        return {
          createdCategories,
        };
      }
    );

    return NextResponse.json({
      message: "Kategoriler başarıyla kaydedildi.",
      result,
    });
  } catch (error) {
    console.error("Error saving categories:", error);
    return NextResponse.json(
      { message: "Kategoriler kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
