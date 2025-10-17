import { authOptions } from "@/lib/auth";
import { InviteStaffRequest } from "@/types";
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

    // Get allowed staff list
    const allowedStaff = await prisma.allowedStaff.findMany({
      where: { cafeId: id },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ allowedStaff }, { status: 200 });
  } catch (error) {
    console.error("Get allowed staff error:", error);
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
    const { email }: InviteStaffRequest = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: "Email adresi zorunludur" },
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

    // Check if email is already invited
    const existingInvite = await prisma.allowedStaff.findUnique({
      where: {
        cafeId_email: {
          cafeId: id,
          email: email,
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { message: "Bu email adresi zaten davet edilmiş" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists and is staff
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.role !== "STAFF") {
      return NextResponse.json(
        { message: "Bu email adresi zaten farklı bir rol ile kayıtlı" },
        { status: 400 }
      );
    }

    // Create allowed staff entry
    const allowedStaff = await prisma.allowedStaff.create({
      data: {
        cafeId: id,
        email: email,
        userId: existingUser?.id || null,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      {
        message: "Çalışan başarıyla davet edildi",
        allowedStaff,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Invite staff error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email adresi gerekli" },
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

    // Find and delete the allowed staff entry
    const allowedStaff = await prisma.allowedStaff.findUnique({
      where: {
        cafeId_email: {
          cafeId: id,
          email: email,
        },
      },
    });

    if (!allowedStaff) {
      return NextResponse.json(
        { message: "Davet bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.allowedStaff.delete({
      where: { id: allowedStaff.id },
    });

    return NextResponse.json(
      { message: "Davet başarıyla iptal edildi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove staff invite error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
