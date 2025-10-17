"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MenuItemCard } from "./MenuItemCard";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isAvailable: boolean;
  categoryId: string;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
}

interface MenuItemListProps {
  items: MenuItem[];
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function MenuItemList({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: MenuItemListProps) {
  // Filter out deleted items
  const visibleItems = items.filter((item) => item._status !== "deleted");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Menü Öğeleri</h3>
        <Button onClick={onAddItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Öğe
        </Button>
      </div>

      {visibleItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Bu kategoride henüz menü öğesi yok.</p>
          <p className="text-sm">
            Yeni öğe eklemek için yukarıdaki butonu kullanın.
          </p>
        </div>
      ) : (
        <div className="menu-grid">
          {visibleItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
