"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  order: number;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onCategorySelect,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryTabsProps) {
  // Filter out deleted categories and sort by order
  const visibleCategories = categories
    .filter((cat) => cat._status !== "deleted")
    .sort((a, b) => a.order - b.order);

  const getStatusBadge = (category: Category) => {
    if (category._status === "new") {
      return (
        <Badge variant="default" className="bg-green-500 text-xs">
          Yeni
        </Badge>
      );
    }
    if (category._status === "modified") {
      return (
        <Badge variant="default" className="bg-blue-500 text-xs">
          Değiştirildi
        </Badge>
      );
    }
    return null;
  };

  if (visibleCategories.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Kategoriler</h3>
          <Button onClick={onAddCategory} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kategori
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>Henüz kategori yok.</p>
          <p className="text-sm">
            İlk kategorinizi eklemek için yukarıdaki butonu kullanın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kategoriler</h3>
        <Button onClick={onAddCategory} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      <Tabs value={activeCategoryId || ""} onValueChange={onCategorySelect}>
        <TabsList className="category-tabs-list">
          <div className="category-tabs-wrapper">
            {visibleCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="category-tab-trigger"
              >
                <span className="truncate text-sm font-medium">
                  {category.name}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getStatusBadge(category)}
                  <div className="flex gap-1">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory(category);
                      }}
                      className="menu-action-button"
                    >
                      <Edit className="h-3 w-3" />
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(category.id);
                      }}
                      className="menu-action-button menu-action-button-danger"
                    >
                      <Trash2 className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </TabsTrigger>
            ))}
          </div>
        </TabsList>
      </Tabs>
    </div>
  );
}
