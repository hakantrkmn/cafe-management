"use client";

import { useMenu } from "@/queries/menu";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSaveMenuItem } from "../queries/menuItem";

interface CategoryWithChanges {
  id: string;
  name: string;
  order: number;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
  _tempId?: string;
}

interface MenuItemWithChanges {
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
  _tempId?: string;
}

export function useMenuItemPage(cafeId: string) {
  // Local state
  const [localMenuItems, setLocalMenuItems] = useState<MenuItemWithChanges[]>(
    []
  );
  const [localCategories, setLocalCategories] = useState<CategoryWithChanges[]>(
    []
  );

  // Dialog states
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [menuItemDialogMode, setMenuItemDialogMode] = useState<
    "add" | "edit" | null
  >(null);
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItemWithChanges | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogTitle, setDeleteDialogTitle] = useState("");
  const [deleteDialogDescription, setDeleteDialogDescription] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // API hooks
  const { data: menuData, isLoading: menuLoading } = useMenu(cafeId);
  const saveMenuItemMutation = useSaveMenuItem();

  // Initialize local state when data is fetched
  useEffect(() => {
    if (menuData) {
      // Only update if we don't have local changes
      const hasLocalChanges = localMenuItems.some((item) => item._status);

      if (!hasLocalChanges) {
        setLocalMenuItems(menuData.menuItems || []);
        setLocalCategories(menuData.categories || []);
      }
    }
  }, [menuData, localMenuItems]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return localMenuItems.some((item) => item._status);
  }, [localMenuItems]);

  // Generate temp ID
  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Menu item operations
  const onAddMenuItem = () => {
    if (localCategories.length === 0) {
      toast.error("Önce bir kategori ekleyin");
      return;
    }
    setMenuItemDialogMode("add");
    setSelectedMenuItem(null);
    setMenuItemDialogOpen(true);
  };

  const onEditMenuItem = (item: MenuItemWithChanges) => {
    setMenuItemDialogMode("edit");
    setSelectedMenuItem(item);
    setMenuItemDialogOpen(true);
  };

  const onDeleteMenuItem = (itemId: string) => {
    const item = localMenuItems.find((i) => i.id === itemId);
    if (!item) return;

    setDeleteDialogTitle("Menü Öğesini Sil");
    setDeleteDialogDescription(
      `"${item.name}" menü öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const onMenuItemSubmit = (data: {
    categoryId: string;
    name: string;
    price: number;
    description?: string;
    isAvailable: boolean;
  }) => {
    if (menuItemDialogMode === "add") {
      const newItem: MenuItemWithChanges = {
        id: generateTempId(),
        ...data,
        cafeId: cafeId,
        createdAt: new Date(),
        updatedAt: new Date(),
        _status: "new",
        _tempId: generateTempId(),
      };
      setLocalMenuItems((prev) => [...prev, newItem]);
    } else if (menuItemDialogMode === "edit" && selectedMenuItem) {
      setLocalMenuItems((prev) =>
        prev.map((item) =>
          item.id === selectedMenuItem.id
            ? { ...item, ...data, _status: "modified" as const }
            : item
        )
      );
    }
    setMenuItemDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    setLocalMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemToDelete
          ? { ...item, _status: "deleted" as const }
          : item
      )
    );

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      // Prepare data for API
      const menuItemsToSave = localMenuItems.filter((item) => item._status);

      await saveMenuItemMutation.mutateAsync({
        cafeId,
        menuItems: menuItemsToSave,
      });

      // Clear local changes after successful save
      setLocalMenuItems((prev) =>
        prev.map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _status, _tempId, ...cleanItem } = item;
          return cleanItem as MenuItemWithChanges;
        })
      );

      toast.success("Menü öğeleri başarıyla kaydedildi!");
    } catch (error) {
      console.error("Save menu items error:", error);
      toast.error("Menü öğeleri kaydedilirken bir hata oluştu.");
    }
  };

  return {
    categories: localCategories,
    menuItems: localMenuItems,
    isLoading: menuLoading,
    hasChanges,
    isSaving: saveMenuItemMutation.isPending,
    onAddMenuItem,
    onEditMenuItem,
    onDeleteMenuItem,
    onMenuItemSubmit,
    handleSave,
    handleDeleteConfirm,
    // Dialog states
    menuItemDialogOpen,
    menuItemDialogMode,
    selectedMenuItem,
    setMenuItemDialogOpen,
    deleteDialogOpen,
    deleteDialogTitle,
    deleteDialogDescription,
    setDeleteDialogOpen,
  };
}
