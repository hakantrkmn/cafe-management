"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";
import { usePopularProductsStore } from "@/store/popularProductsStore";
import { MenuItem } from "@/types";
import { Plus, Star } from "lucide-react";

interface MenuItemSelectionCardProps {
  item: MenuItem;
  onItemSelect: (menuItem: MenuItem) => void;
}

export function MenuItemSelectionCard({
  item,
  onItemSelect,
}: MenuItemSelectionCardProps) {
  const { isPopular, addPopularProduct, removePopularProduct } =
    usePopularProductsStore();

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Kart tıklamasını engelle

    if (isPopular(item.id)) {
      removePopularProduct(item.id);
    } else {
      addPopularProduct({
        id: item.id,
        name: item.name,
        price: item.price,
        categoryId: item.categoryId,
      });
    }
  };

  const isItemPopular = isPopular(item.id);

  return (
    <div className="menu-item-card" onClick={() => onItemSelect(item)}>
      <div className="menu-item-header">
        <div className="flex items-start justify-between w-full">
          <h4 className="menu-item-name flex-1">{item.name}</h4>
          <button
            onClick={handleStarClick}
            className={`p-1 rounded-full hover:bg-muted/50 transition-colors ${
              isItemPopular
                ? "text-yellow-500"
                : "text-muted-foreground hover:text-yellow-400"
            }`}
            aria-label={
              isItemPopular ? "Popüler ürünlerden kaldır" : "Popüler ürüne ekle"
            }
          >
            <Star
              className={`h-4 w-4 ${isItemPopular ? "fill-current" : ""}`}
            />
          </button>
        </div>
        <div className="menu-item-price">{formatPrice(item.price)}</div>
      </div>

      {item.description && (
        <p className="menu-item-description">{item.description}</p>
      )}

      <div className="menu-item-footer">
        <Button className="menu-item-add-button">
          <Plus className="h-4 w-4 mr-2" />
          Ekle
        </Button>
      </div>
    </div>
  );
}
