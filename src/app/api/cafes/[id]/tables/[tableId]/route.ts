import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tableId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id, tableId } = await params;
    const { name } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: "Masa adı zorunludur" },
        { status: 400 }
      );
    }

    // Check if user is a manager and owns this cafe
    const cafe = await prisma.cafe.findFirst({
      where: {
        id: id,
        managerId: session.user.id,
      },
    });

    if (!cafe) {
      return NextResponse.json(
        { message: "Kafe bulunamadı veya yetkiniz yok" },
        { status: 404 }
      );
    }

    // Check if table exists and belongs to this cafe
    const existingTable = await prisma.table.findFirst({
      where: {
        id: tableId,
        cafeId: id,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ message: "Masa bulunamadı" }, { status: 404 });
    }

    // Check if new name already exists in this cafe
    const duplicateTable = await prisma.table.findFirst({
      where: {
        cafeId: id,
        name: name,
        id: { not: tableId },
      },
    });

    if (duplicateTable) {
      return NextResponse.json(
        { message: "Bu isimde bir masa zaten mevcut" },
        { status: 400 }
      );
    }

    // Update table
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { name },
    });

    return NextResponse.json(
      {
        message: "Masa başarıyla güncellendi",
        table: updatedTable,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update table error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tableId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id, tableId } = await params;

    // Check if user is a manager and owns this cafe
    const cafe = await prisma.cafe.findFirst({
      where: {
        id: id,
        managerId: session.user.id,
      },
    });

    if (!cafe) {
      return NextResponse.json(
        { message: "Kafe bulunamadı veya yetkiniz yok" },
        { status: 404 }
      );
    }

    // Check if table exists and belongs to this cafe
    const existingTable = await prisma.table.findFirst({
      where: {
        id: tableId,
        cafeId: id,
      },
      include: {
        orders: {
          where: {
            isPaid: false, // Check for unpaid orders
          },
        },
      },
    });

    if (!existingTable) {
      return NextResponse.json({ message: "Masa bulunamadı" }, { status: 404 });
    }

    // Check if table has unpaid orders
    if (existingTable.orders.length > 0) {
      return NextResponse.json(
        {
          message:
            "Bu masada ödenmemiş siparişler var. Önce siparişleri tamamlayın.",
        },
        { status: 400 }
      );
    }

    // Delete table
    await prisma.table.delete({
      where: { id: tableId },
    });

    return NextResponse.json(
      { message: "Masa başarıyla silindi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete table error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
