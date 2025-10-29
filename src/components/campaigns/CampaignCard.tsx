"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { useDeleteCampaign } from "@/queries/campaign";
import { CampaignWithRelations, MenuItemPrice, MenuItemSize } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface CampaignCardProps {
  campaign: CampaignWithRelations;
  onEdit: (campaign: CampaignWithRelations) => void;
}

export function CampaignCard({ campaign, onEdit }: CampaignCardProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const deleteCampaignMutation = useDeleteCampaign();

  const handleDelete = async () => {
    try {
      await deleteCampaignMutation.mutateAsync(campaign.id);
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const getSizeLabel = (size?: MenuItemSize | null) => {
    if (!size) return "";
    const sizeLabels = {
      SMALL: "Küçük",
      MEDIUM: "Orta",
      LARGE: "Büyük",
    };
    return sizeLabels[size];
  };

  const getItemPrice = (
    menuItem: {
      hasSizes: boolean;
      price: number;
      prices?: MenuItemPrice[] | null;
    },
    size?: MenuItemSize | null
  ): number => {
    if (!menuItem.hasSizes || !size) {
      return menuItem.price;
    }
    const priceEntry = (
      menuItem.prices as MenuItemPrice[] | undefined | null
    )?.find((p: MenuItemPrice) => p.size === size);
    return priceEntry?.price || menuItem.price;
  };

  return (
    <>
      <Card className="campaign-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {campaign.name}
              </CardTitle>
              {campaign.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {campaign.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge
                variant={campaign.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {campaign.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Campaign Items */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Kampanya İçeriği:
              </h4>
              <div className="space-y-1">
                {campaign.campaignItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{item.menuItem.name}</span>
                      {item.size && (
                        <Badge variant="outline" className="text-xs">
                          {getSizeLabel(item.size)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {formatPrice(
                        getItemPrice(item.menuItem, item.size) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Price */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Kampanya Fiyatı:</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(campaign.price)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(campaign)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={deleteCampaignMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Kampanyayı Sil</h3>
            <p className="text-muted-foreground mb-4">
              &quot;{campaign.name}&quot; kampanyasını silmek istediğinizden
              emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={deleteCampaignMutation.isPending}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteCampaignMutation.isPending}
              >
                {deleteCampaignMutation.isPending ? "Siliniyor..." : "Sil"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
