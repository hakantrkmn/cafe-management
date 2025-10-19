"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";
import { usePopularProductsStore } from "@/store/popularProductsStore";
import { MenuItemSize, MenuItemWithRelations } from "@/types";
import { Plus, Star } from "lucide-react";
import { useState } from "react";

interface MenuItemSelectionCardProps {
  item: MenuItemWithRelations;
  onItemSelect: (menuItem: MenuItemWithRelations, size?: MenuItemSize) => void;
}

export function MenuItemSelectionCard({
  item,
  onItemSelect,
}: MenuItemSelectionCardProps) {
  const { isPopular, addPopularProduct, removePopularProduct } =
    usePopularProductsStore();
  const [selectedSize, setSelectedSize] = useState<MenuItemSize | null>(null);

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

  const handleCardClick = () => {
    if (item.hasSizes && !selectedSize) {
      // Don't proceed if item has sizes but no size is selected
      return;
    }
    onItemSelect(item, selectedSize || undefined);
  };

  const handleSizeSelect = (size: MenuItemSize) => {
    setSelectedSize(size);
  };

  const isItemPopular = isPopular(item.id);

  // Get price display
  const getPriceDisplay = () => {
    if (item.hasSizes && item.prices) {
      const prices = item.prices.map((p) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      }
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    return formatPrice(item.price);
  };

  return (
    <div className="menu-item-card" onClick={handleCardClick}>
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
        <div className="menu-item-price">{getPriceDisplay()}</div>
      </div>

      {item.description && (
        <p className="menu-item-description">{item.description}</p>
      )}

      {item.hasSizes && item.prices && (
        <div className="size-selection mb-3">
          <p className="text-sm font-medium mb-2">Boy Seçin:</p>
          <div className="size-selection-buttons">
            {item.prices.map((price) => (
              <button
                key={price.size}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSizeSelect(price.size);
                }}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedSize === price.size
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted"
                }`}
              >
                {price.size === "SMALL" && "Küçük"}
                {price.size === "MEDIUM" && "Orta"}
                {price.size === "LARGE" && "Büyük"}
                <br />
                <span className="text-xs opacity-75">
                  {formatPrice(price.price)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="menu-item-footer">
        <Button
          className="menu-item-add-button"
          disabled={item.hasSizes && !selectedSize}
        >
          <Plus className="h-4 w-4 mr-2" />
          {item.hasSizes && !selectedSize ? "Boy Seçin" : "Ekle"}
        </Button>
      </div>
    </div>
  );
}
