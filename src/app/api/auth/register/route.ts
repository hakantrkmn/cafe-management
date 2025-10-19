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

    // Staff users can register without being in allowedStaff list
    const cafeId: string | undefined = undefined;

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

    // Staff users are created without cafeId initially
    // They can be assigned to cafes later by managers

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
