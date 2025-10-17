import { authOptions } from "@/lib/auth";
import { CreateCafeRequest } from "@/types";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
    }

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

    // Return the cafe the user is associated with
    const cafe = user.managedCafe || user.cafe;

    return NextResponse.json({ cafe }, { status: 200 });
  } catch (error) {
    console.error("Get cafe error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { name, address, phone }: CreateCafeRequest = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: "Kafe adı zorunludur" },
        { status: 400 }
      );
    }

    // Check if user is a manager
    if (session.user.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Sadece yöneticiler kafe oluşturabilir" },
        { status: 403 }
      );
    }

    // Check if user already has a cafe
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { managedCafe: true },
    });

    if (existingUser?.managedCafe) {
      return NextResponse.json(
        { message: "Zaten bir kafeniz var" },
        { status: 400 }
      );
    }

    // Create cafe
    const cafe = await prisma.cafe.create({
      data: {
        name,
        address,
        phone,
        managerId: session.user.id,
      },
      include: {
        manager: true,
      },
    });

    return NextResponse.json(
      {
        message: "Kafe başarıyla oluşturuldu",
        cafe,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create cafe error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
