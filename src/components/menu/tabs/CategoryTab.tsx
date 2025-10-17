"use client";

import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { SaveButton } from "@/components/menu/SaveButton";
import { CategoryDialogs } from "@/components/menu/dialogs/CategoryDialogs";
import { useCategoryPage } from "@/hooks/useCategoryPage";
import { Loader2 } from "lucide-react";

interface CategoryTabProps {
  cafeId: string;
}

export function CategoryTab({ cafeId }: CategoryTabProps) {
  const {
    categories,
    isLoading,
    hasChanges,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    onCategorySelect,
    activeCategoryId,
    handleSave,
    isSaving,
    // Dialog states
    categoryDialogOpen,
    categoryDialogMode,
    selectedCategory,
    setCategoryDialogOpen,
    onCategorySubmit,
    deleteDialogOpen,
    deleteDialogTitle,
    deleteDialogDescription,
    setDeleteDialogOpen,
    handleDeleteConfirm,
  } = useCategoryPage(cafeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Kategori Yönetimi</h2>
        <SaveButton
          hasChanges={hasChanges}
          onSave={handleSave}
          isLoading={isSaving}
        />
      </div>

      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onCategorySelect={onCategorySelect}
        onAddCategory={onAddCategory}
        onEditCategory={onEditCategory}
        onDeleteCategory={onDeleteCategory}
      />

      <CategoryDialogs
        categoryDialogOpen={categoryDialogOpen}
        categoryDialogMode={categoryDialogMode}
        selectedCategory={selectedCategory}
        onCategoryDialogClose={() => setCategoryDialogOpen(false)}
        onCategorySubmit={onCategorySubmit}
        deleteDialogOpen={deleteDialogOpen}
        deleteDialogTitle={deleteDialogTitle}
        deleteDialogDescription={deleteDialogDescription}
        onDeleteDialogClose={() => setDeleteDialogOpen(false)}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
