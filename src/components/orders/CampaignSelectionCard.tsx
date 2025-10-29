"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { CampaignWithRelations, MenuItemSize } from "@/types";
import { Tag } from "lucide-react";

interface CampaignSelectionCardProps {
  campaign: CampaignWithRelations;
  onSelect: (campaign: CampaignWithRelations) => void;
}

export function CampaignSelectionCard({
  campaign,
  onSelect,
}: CampaignSelectionCardProps) {
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
      prices?: Array<{ size: MenuItemSize; price: number }>;
    },
    size?: MenuItemSize | null
  ) => {
    if (!menuItem.hasSizes || !size) {
      return menuItem.price;
    }
    const priceEntry = menuItem.prices?.find((p) => p.size === size);
    return priceEntry?.price || menuItem.price;
  };

  const calculateNormalPrice = () => {
    return campaign.campaignItems.reduce((total, item) => {
      const itemPrice = getItemPrice(item.menuItem, item.size);
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const normalPrice = calculateNormalPrice();
  const savings = normalPrice - campaign.price;

  return (
    <Card
      className="campaign-selection-card"
      onClick={() => onSelect(campaign)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold line-clamp-1">
              {campaign.name}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            Kampanya
          </Badge>
        </div>
        {campaign.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {campaign.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Campaign Items */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              İçerik:
            </h4>
            <div className="space-y-1">
              {campaign.campaignItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{item.quantity}x</span>
                    <span className="line-clamp-1">{item.menuItem.name}</span>
                    {item.size && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {getSizeLabel(item.size)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Comparison */}
          <div className="campaign-price-comparison">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Normal fiyat:</span>
              <span className="campaign-price-normal">
                {formatPrice(normalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Kampanya fiyatı:</span>
              <span className="campaign-price-campaign">
                {formatPrice(campaign.price)}
              </span>
            </div>
            {savings > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tasarruf:</span>
                <span className="campaign-savings">{formatPrice(savings)}</span>
              </div>
            )}
          </div>

          {/* Select Button */}
          <Button
            className="w-full"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(campaign);
            }}
          >
            Kampanyayı Seç
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
