"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";
import { MenuItem } from "@/types";
import { Plus } from "lucide-react";

interface MenuItemSelectionCardProps {
  item: MenuItem;
  onItemSelect: (menuItem: MenuItem) => void;
}

export function MenuItemSelectionCard({
  item,
  onItemSelect,
}: MenuItemSelectionCardProps) {
  return (
    <div className="menu-item-card" onClick={() => onItemSelect(item)}>
      <div className="menu-item-header">
        <h4 className="menu-item-name">{item.name}</h4>
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
