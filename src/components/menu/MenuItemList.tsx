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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-semibold">Menü Öğeleri</h3>
        <Button onClick={onAddItem} size="sm" className="w-full sm:w-auto">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="text-sm">Yeni Öğe</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
