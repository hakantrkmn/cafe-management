"use client";

import { MenuItemList } from "@/components/menu/MenuItemList";
import { SaveButton } from "@/components/menu/SaveButton";
import { MenuItemDialogs } from "@/components/menu/dialogs/MenuItemDialogs";
import { useMenuItemPage } from "@/hooks/useMenuItemPage";
import { Loader2 } from "lucide-react";

interface MenuItemTabProps {
  cafeId: string;
}

export function MenuItemTab({ cafeId }: MenuItemTabProps) {
  const {
    categories,
    menuItems,
    isLoading,
    hasChanges,
    onAddMenuItem,
    onEditMenuItem,
    onDeleteMenuItem,
    handleSave,
    isSaving,
    // Dialog states
    menuItemDialogOpen,
    menuItemDialogMode,
    selectedMenuItem,
    setMenuItemDialogOpen,
    onMenuItemSubmit,
    deleteDialogOpen,
    deleteDialogTitle,
    deleteDialogDescription,
    setDeleteDialogOpen,
    handleDeleteConfirm,
  } = useMenuItemPage(cafeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Menü Öğeleri Yönetimi
        </h2>
        <SaveButton
          hasChanges={hasChanges}
          onSave={handleSave}
          isLoading={isSaving}
        />
      </div>

      <MenuItemList
        items={menuItems}
        onAddItem={onAddMenuItem}
        onEditItem={onEditMenuItem}
        onDeleteItem={onDeleteMenuItem}
      />

      <MenuItemDialogs
        menuItemDialogOpen={menuItemDialogOpen}
        menuItemDialogMode={menuItemDialogMode}
        selectedMenuItem={selectedMenuItem}
        categories={categories}
        onMenuItemDialogClose={() => setMenuItemDialogOpen(false)}
        onMenuItemSubmit={onMenuItemSubmit}
        deleteDialogOpen={deleteDialogOpen}
        deleteDialogTitle={deleteDialogTitle}
        deleteDialogDescription={deleteDialogDescription}
        onDeleteDialogClose={() => setDeleteDialogOpen(false)}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
