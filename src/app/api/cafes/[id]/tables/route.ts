import { authOptions } from "@/lib/auth";
import { CreateTableRequest } from "@/types";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user has access to this cafe (manager or staff)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        cafe: true,
        managedCafe: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const userCafe = user.managedCafe || user.cafe;
    if (!userCafe || userCafe.id !== id) {
      return NextResponse.json(
        { message: "Bu kafeye erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    // Get tables for this cafe
    const tables = await prisma.table.findMany({
      where: { cafeId: id },
      include: {
        orders: {
          where: {
            isPaid: false, // Only count unpaid orders
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Add isOccupied status based on unpaid orders
    const tablesWithStatus = tables.map((table) => ({
      ...table,
      isOccupied: table.orders.length > 0,
    }));

    return NextResponse.json({ data: tablesWithStatus }, { status: 200 });
  } catch (error) {
    console.error("Get tables error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const { name }: CreateTableRequest = await request.json();

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

    // Check if table name already exists in this cafe
    const existingTable = await prisma.table.findFirst({
      where: {
        cafeId: id,
        name: name,
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { message: "Bu isimde bir masa zaten mevcut" },
        { status: 400 }
      );
    }

    // Create table
    const table = await prisma.table.create({
      data: {
        cafeId: id,
        name: name,
      },
    });

    return NextResponse.json(
      {
        message: "Masa başarıyla oluşturuldu",
        table,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create table error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
