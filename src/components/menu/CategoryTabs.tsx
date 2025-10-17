"use client";

import { CategoryCard } from "@/components/menu/CategoryCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

  if (visibleCategories.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold">Kategoriler</h3>
          <Button
            onClick={onAddCategory}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-sm">Yeni Kategori</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-semibold">Kategoriler</h3>
        <Button onClick={onAddCategory} size="sm" className="w-full sm:w-auto">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="text-sm">Yeni Kategori</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isActive={activeCategoryId === category.id}
            onSelect={() => onCategorySelect(category.id)}
            onEdit={onEditCategory}
            onDelete={onDeleteCategory}
          />
        ))}
      </div>
    </div>
  );
}
