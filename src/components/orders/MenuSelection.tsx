"use client";

import { CampaignSelectionCard } from "@/components/orders/CampaignSelectionCard";
import { MenuItemSelectionCard } from "@/components/orders/MenuItemSelectionCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/queries/auth";
import { useCampaigns } from "@/queries/campaign";
import { usePopularProductsStore } from "@/store/popularProductsStore";
import {
  CampaignWithRelations,
  Category,
  MenuItemSize,
  MenuItemWithRelations,
} from "@/types";
import { ChevronDown, Coffee, Search, Star, Tag } from "lucide-react";
import { useState } from "react";

interface MenuSelectionProps {
  categories: Category[];
  menuItems: MenuItemWithRelations[];
  onItemSelect: (menuItem: MenuItemWithRelations, size?: MenuItemSize) => void;
  onCampaignSelect: (campaign: CampaignWithRelations) => void;
}

export function MenuSelection({
  categories,
  menuItems,
  onItemSelect,
  onCampaignSelect,
}: MenuSelectionProps) {
  const { popularProducts } = usePopularProductsStore();
  const { user } = useAuth();

  // Get cafeId early to avoid conditional hooks
  const cafeId = user?.cafeId || user?.managedCafe?.id;
  const { data: campaigns = [] } = useCampaigns(cafeId || "");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null // Başlangıçta "Tümü" seçili
  );

  const getCategoryMenuItems = (categoryId: string | null) => {
    if (categoryId === null) {
      // Tüm ürünleri göster
      return menuItems.filter((item) => item.isAvailable);
    }
    if (categoryId === "popular") {
      // Popüler ürünleri göster
      const popularIds = popularProducts.map((p) => p.id);
      return menuItems.filter(
        (item) => popularIds.includes(item.id) && item.isAvailable
      );
    }
    if (categoryId === "campaigns") {
      // Kampanyaları göster
      return [];
    }
    return menuItems.filter(
      (item) => item.categoryId === categoryId && item.isAvailable
    );
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );
  const [search, setSearch] = useState<string>("");
  const categoryItems = getCategoryMenuItems(selectedCategoryId).filter(
    (item) => item.name.toLowerCase().includes(search.toLowerCase())
  );

  const getSelectedCategoryName = () => {
    if (selectedCategoryId === null) return "Tüm Kategoriler";
    if (selectedCategoryId === "popular") return "Popüler Ürünler";
    if (selectedCategoryId === "campaigns") return "Kampanyalar";
    return selectedCategory?.name || "Kategori Seçin";
  };

  return (
    <div className="menu-selection-container">
      {/* Header */}
      <div className="menu-selection-header">
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Menü Seçimi</h3>
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
              >
                {selectedCategoryId === "popular" && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {getSelectedCategoryName()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-72 overflow-auto"
            >
              <DropdownMenuItem
                onClick={() => setSelectedCategoryId(null)}
                className="cursor-pointer"
              >
                Tüm Kategoriler
              </DropdownMenuItem>
              {campaigns.length > 0 && (
                <DropdownMenuItem
                  onClick={() => setSelectedCategoryId("campaigns")}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Tag className="h-4 w-4 text-primary" />
                  Kampanyalar ({campaigns.length})
                </DropdownMenuItem>
              )}
              {popularProducts.length > 0 && (
                <DropdownMenuItem
                  onClick={() => setSelectedCategoryId("popular")}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  Popüler Ürünler ({popularProducts.length})
                </DropdownMenuItem>
              )}
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className="cursor-pointer"
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün ara..."
              className="pl-8 w-full sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {selectedCategoryId === "campaigns" ? (
        // Show Campaigns
        campaigns.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aktif kampanya bulunmuyor</p>
          </Card>
        ) : (
          <div className="menu-selection-grid">
            {campaigns
              .filter((campaign) => campaign.isActive)
              .map((campaign) => (
                <CampaignSelectionCard
                  key={campaign.id}
                  campaign={campaign}
                  onSelect={onCampaignSelect}
                />
              ))}
          </div>
        )
      ) : categoryItems.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Bu kategoride ürün bulunmuyor</p>
        </Card>
      ) : (
        <div className="menu-selection-grid">
          {categoryItems.map((item) => (
            <MenuItemSelectionCard
              key={item.id}
              item={item}
              onItemSelect={onItemSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
