import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const { name, address, phone } = await request.json();

    // Check if user is a manager
    if (session.user.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Sadece yöneticiler kafe bilgilerini güncelleyebilir" },
        { status: 403 }
      );
    }

    // Check if user owns this cafe
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

    // Update cafe
    const updatedCafe = await prisma.cafe.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
      },
      include: {
        manager: true,
      },
    });

    return NextResponse.json(
      {
        message: "Kafe bilgileri başarıyla güncellendi",
        cafe: updatedCafe,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update cafe error:", error);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
