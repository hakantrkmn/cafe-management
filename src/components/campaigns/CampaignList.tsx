"use client";

import { CampaignWithRelations } from "@/types";
import { Plus } from "lucide-react";
import { CampaignCard } from "./CampaignCard";

interface CampaignListProps {
  campaigns: CampaignWithRelations[];
  onEdit: (campaign: CampaignWithRelations) => void;
  onCreate: () => void;
  isLoading?: boolean;
}

export function CampaignList({
  campaigns,
  onEdit,
  onCreate,
  isLoading = false,
}: CampaignListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Henüz kampanya yok</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          İlk kampanyanızı oluşturarak müşterilerinize özel fırsatlar sunmaya
          başlayın.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Kampanya Oluştur
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kampanyalar</h2>
          <p className="text-muted-foreground text-sm">
            {campaigns.length} kampanya bulundu
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Kampanya
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}
