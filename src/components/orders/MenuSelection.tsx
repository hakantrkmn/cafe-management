"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/formatters";
import { Category, Extra, MenuItem } from "@/types";
import { ChevronDown, Coffee, Plus, Search } from "lucide-react";
import { useState } from "react";

interface MenuSelectionProps {
  categories: Category[];
  menuItems: MenuItem[];
  extras: Extra[];
  onItemSelect: (menuItem: MenuItem) => void;
}

export function MenuSelection({
  categories,
  menuItems,
  extras,
  onItemSelect,
}: MenuSelectionProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]?.id || ""
  );

  const getCategoryMenuItems = (categoryId: string) => {
    return menuItems.filter(
      (item) => item.categoryId === categoryId && item.isAvailable
    );
  };

  const getMenuItemExtras = (): Extra[] => {
    return extras.filter((extra) => extra.isAvailable);
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );
  const [search, setSearch] = useState<string>("");
  const categoryItems = getCategoryMenuItems(selectedCategoryId).filter(
    (item) => item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                {selectedCategory?.name || "Kategori Seçin"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-72 overflow-auto"
            >
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 orders-grid-responsive">
          {categoryItems.map((item) => (
            <Card
              key={item.id}
              className="p-3 sm:p-4 hover:shadow-md transition-shadow border hover:border-primary/20 min-h-[140px] sm:min-h-[160px]"
            >
              <div className="space-y-2 sm:space-y-3 h-full flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm sm:text-base leading-tight flex-1">
                    {item.name}
                  </h4>
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium flex-shrink-0"
                  >
                    {formatPrice(item.price)}
                  </Badge>
                </div>

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xs text-muted-foreground">
                    {getMenuItemExtras().length > 0 && (
                      <span>{getMenuItemExtras().length} ekstra</span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onItemSelect(item)}
                    className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Ekle
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
