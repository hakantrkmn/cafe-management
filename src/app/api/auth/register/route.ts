import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Tüm alanlar zorunludur" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["MANAGER", "STAFF"].includes(role)) {
      return NextResponse.json({ message: "Geçersiz rol" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // If user is STAFF, check if they are in allowedStaff list
    let cafeId: string | undefined = undefined;
    if (role === "STAFF") {
      const allowedStaff = await prisma.allowedStaff.findFirst({
        where: { email },
        include: { cafe: true },
      });

      if (!allowedStaff) {
        return NextResponse.json(
          { message: "Bu email adresi çalışan olarak davet edilmemiş" },
          { status: 400 }
        );
      }

      cafeId = allowedStaff.cafeId;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as "MANAGER" | "STAFF",
        cafeId,
      },
    });

    // If user is STAFF, update the allowedStaff record with userId
    if (role === "STAFF" && cafeId) {
      await prisma.allowedStaff.updateMany({
        where: {
          email,
          cafeId,
        },
        data: {
          userId: user.id,
        },
      });
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Kullanıcı başarıyla oluşturuldu",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
