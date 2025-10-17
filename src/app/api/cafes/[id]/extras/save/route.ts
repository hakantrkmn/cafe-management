import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface SaveExtrasRequest {
  extras: Array<{
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
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
    const body: SaveExtrasRequest = await request.json();

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
        const validDeleteIds = body.extras
          .filter((extra) => extra._status === "deleted")
          .map((extra) => extra.id)
          .filter((id) => !id.startsWith("temp_"));

        if (validDeleteIds.length > 0) {
          await tx.extra.deleteMany({
            where: {
              id: { in: validDeleteIds },
              cafeId: id,
            },
          });
        }

        // Create operations
        const createData = body.extras
          .filter((extra) => extra._status === "new")
          .map((extra) => ({
            name: extra.name,
            price: extra.price,
            isAvailable: extra.isAvailable,
            cafeId: id,
          }));

        const createdExtras =
          createData.length > 0
            ? await Promise.all(
                createData.map((data) => tx.extra.create({ data }))
              )
            : [];

        // Update operations
        const validUpdates = body.extras.filter(
          (extra) =>
            extra._status === "modified" && !extra.id.startsWith("temp_")
        );

        if (validUpdates.length > 0) {
          await Promise.all(
            validUpdates.map((extra) =>
              tx.extra.update({
                where: { id: extra.id },
                data: {
                  name: extra.name,
                  price: extra.price,
                  isAvailable: extra.isAvailable,
                },
              })
            )
          );
        }

        return {
          createdExtras,
        };
      }
    );

    return NextResponse.json({
      message: "Ekstralar başarıyla kaydedildi.",
      result,
    });
  } catch (error) {
    console.error("Error saving extras:", error);
    return NextResponse.json(
      { message: "Ekstralar kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
