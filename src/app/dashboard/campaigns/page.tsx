"use client";

import { CampaignDialog } from "@/components/campaigns/CampaignDialog";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePageLoading } from "@/hooks/usePageLoading";
import { useAuth } from "@/queries/auth";
import { useCampaigns } from "@/queries/campaign";
import { CampaignWithRelations } from "@/types";
import { useState } from "react";

export default function CampaignsPage() {
  const { user, isManager, isLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<
    CampaignWithRelations | undefined
  >();

  // Get cafeId early to avoid conditional hooks
  const cafeId = user?.cafeId || user?.managedCafe?.id;

  // Always call useCampaigns hook, but disable it when cafeId is not available
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    cafeId || ""
  );

  // Auto page loading
  usePageLoading(isLoading, {
    loadingText: "Kampanyalar yükleniyor...",
    delay: 200,
    minDuration: 800,
  });

  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Bu sayfaya erişim yetkiniz yok.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!cafeId) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Kafe bilgisi bulunamadı.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleCreate = () => {
    setEditingCampaign(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (campaign: CampaignWithRelations) => {
    setEditingCampaign(campaign);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    // The query will automatically refetch due to invalidation in the mutation
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Kampanya Yönetimi
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Özel kampanyalar oluşturun ve müşterilerinize fırsatlar sunun
              </p>
            </div>
          </div>

          <div className="campaigns-content-container">
            <CampaignList
              campaigns={campaigns}
              onEdit={handleEdit}
              onCreate={handleCreate}
              isLoading={campaignsLoading}
            />
          </div>
        </div>
      </div>

      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editingCampaign}
        onSuccess={handleDialogSuccess}
      />
    </DashboardLayout>
  );
}
