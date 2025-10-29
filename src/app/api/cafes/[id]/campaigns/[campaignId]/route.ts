import { prisma } from "@/lib/prisma";
import { UpdateCampaignRequest } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  try {
    const { id: cafeId, campaignId } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        cafeId,
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

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Kampanya bulunamadı",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kampanya yüklenirken hata oluştu",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  try {
    const { id: cafeId, campaignId } = await params;
    const body: UpdateCampaignRequest = await request.json();

    // Check if campaign exists and belongs to the cafe
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        cafeId,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Kampanya bulunamadı",
        },
        { status: 404 }
      );
    }

    // If updating items, validate them
    if (body.items && body.items.length > 0) {
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
    }

    // Update campaign
    const updateData: Partial<{
      name: string;
      description: string | null;
      price: number;
      isActive: boolean;
    }> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...updateData,
        ...(body.items && {
          campaignItems: {
            deleteMany: {},
            create: body.items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              size: item.size,
            })),
          },
        }),
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
      message: "Kampanya başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kampanya güncellenirken hata oluştu",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  try {
    const { id: cafeId, campaignId } = await params;

    // Check if campaign exists and belongs to the cafe
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        cafeId,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Kampanya bulunamadı",
        },
        { status: 404 }
      );
    }

    // Delete campaign (campaignItems will be deleted automatically due to onDelete: Cascade)
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({
      success: true,
      message: "Kampanya başarıyla silindi",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kampanya silinirken hata oluştu",
      },
      { status: 500 }
    );
  }
}
