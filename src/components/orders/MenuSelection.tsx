"use client";

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
import { Category, MenuItem } from "@/types";
import { ChevronDown, Coffee, Search } from "lucide-react";
import { useState } from "react";

interface MenuSelectionProps {
  categories: Category[];
  menuItems: MenuItem[];
  onItemSelect: (menuItem: MenuItem) => void;
}

export function MenuSelection({
  categories,
  menuItems,
  onItemSelect,
}: MenuSelectionProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null // Başlangıçta "Tümü" seçili
  );

  const getCategoryMenuItems = (categoryId: string | null) => {
    if (categoryId === null) {
      // Tüm ürünleri göster
      return menuItems.filter((item) => item.isAvailable);
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
                {selectedCategoryId === null
                  ? "Tüm Kategoriler"
                  : selectedCategory?.name || "Kategori Seçin"}
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

      {/* Menu Items Grid */}
      {categoryItems.length === 0 ? (
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
