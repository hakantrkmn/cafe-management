import { prisma } from "@/lib/prisma";
import { CreateCampaignRequest } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cafeId } = await params;

    const campaigns = await prisma.campaign.findMany({
      where: { cafeId },
      include: {
        campaignItems: {
          include: {
            menuItem: {
              include: {
                category: true,
                prices: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kampanyalar yüklenirken hata oluştu",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cafeId } = await params;
    const body: CreateCampaignRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.price || !body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Kampanya adı, fiyat ve en az bir ürün gereklidir",
        },
        { status: 400 }
      );
    }

    // Validate campaign items
    for (const item of body.items) {
      if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Geçersiz kampanya ürünü",
          },
          { status: 400 }
        );
      }
    }

    // Check if menu items exist and belong to the cafe
    const menuItemIds = body.items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        cafeId,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Bazı menü öğeleri bulunamadı veya bu kafeye ait değil",
        },
        { status: 400 }
      );
    }

    // Create campaign with items
    const campaign = await prisma.campaign.create({
      data: {
        cafeId,
        name: body.name,
        description: body.description,
        price: body.price,
        isActive: body.isActive ?? true,
        campaignItems: {
          create: body.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            size: item.size,
          })),
        },
      },
      include: {
        campaignItems: {
          include: {
            menuItem: {
              include: {
                category: true,
                prices: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: campaign,
      message: "Kampanya başarıyla oluşturuldu",
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kampanya oluşturulurken hata oluştu",
      },
      { status: 500 }
    );
  }
}
