"use client";

import { useMenu, useSaveMenu } from "@/queries/menu";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

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

interface ExtraWithChanges {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
  _tempId?: string;
}

export function useMenuPage() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    isManager,
    user,
  } = useAuth();
  const [localCategories, setLocalCategories] = useState<CategoryWithChanges[]>(
    []
  );
  const [localMenuItems, setLocalMenuItems] = useState<MenuItemWithChanges[]>(
    []
  );
  const [localExtras, setLocalExtras] = useState<ExtraWithChanges[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogMode, setCategoryDialogMode] = useState<
    "add" | "edit" | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithChanges | null>(null);

  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [menuItemDialogMode, setMenuItemDialogMode] = useState<
    "add" | "edit" | null
  >(null);
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItemWithChanges | null>(null);

  const [extraDialogOpen, setExtraDialogOpen] = useState(false);
  const [extraDialogMode, setExtraDialogMode] = useState<"add" | "edit" | null>(
    null
  );
  const [selectedExtra, setSelectedExtra] = useState<ExtraWithChanges | null>(
    null
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogTitle, setDeleteDialogTitle] = useState("");
  const [deleteDialogDescription, setDeleteDialogDescription] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteDialogType, setDeleteDialogType] = useState<
    "category" | "menuItem" | "extra" | null
  >(null);

  const cafeId = user?.cafeId || user?.managedCafe?.id;

  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
  } = useMenu(cafeId || "");
  const saveMenuMutation = useSaveMenu();

  // Initialize local state when data is fetched (only if local state is empty)
  useEffect(() => {
    if (
      menuData &&
      localCategories.length === 0 &&
      localMenuItems.length === 0 &&
      localExtras.length === 0
    ) {
      console.log("Initializing local state with fetched data");
      setLocalCategories(menuData.categories || []);
      setLocalMenuItems(menuData.menuItems || []);
      setLocalExtras(menuData.extras || []);

      // Set first category as active if none is selected
      if (!activeCategoryId && menuData.categories?.length > 0) {
        const firstCategory = menuData.categories
          .filter((cat: CategoryWithChanges) => cat._status !== "deleted")
          .sort(
            (a: CategoryWithChanges, b: CategoryWithChanges) =>
              a.order - b.order
          )[0];
        if (firstCategory) {
          setActiveCategoryId(firstCategory.id);
        }
      }
    }
  }, [
    menuData,
    activeCategoryId,
    localCategories.length,
    localMenuItems.length,
    localExtras.length,
  ]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return (
      localCategories.some((cat) => cat._status) ||
      localMenuItems.some((item) => item._status) ||
      localExtras.some((extra) => extra._status)
    );
  }, [localCategories, localMenuItems, localExtras]);

  // Get current category's menu items
  const currentCategoryItems = useMemo(() => {
    if (!activeCategoryId) return [];
    return localMenuItems.filter(
      (item) =>
        item.categoryId === activeCategoryId && item._status !== "deleted"
    );
  }, [localMenuItems, activeCategoryId]);

  // Generate temporary ID
  const generateTempId = () =>
    `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Category operations
  const handleAddCategory = () => {
    setCategoryDialogMode("add");
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: CategoryWithChanges) => {
    setCategoryDialogMode("edit");
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = localCategories.find((cat) => cat.id === categoryId);
    if (!category) return;

    // Check if category has menu items
    const hasMenuItems = localMenuItems.some(
      (item) => item.categoryId === categoryId && item._status !== "deleted"
    );

    if (hasMenuItems) {
      toast.error(
        "Bu kategoride menü öğeleri bulunuyor. Önce menü öğelerini silin."
      );
      return;
    }

    setDeleteDialogType("category");
    setDeleteDialogTitle("Kategoriyi Sil");
    setDeleteDialogDescription(
      `"${category.name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    setItemToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleCategorySubmit = (data: { name: string; order: number }) => {
    if (categoryDialogMode === "add") {
      const newCategory: CategoryWithChanges = {
        id: generateTempId(),
        name: data.name,
        order: data.order,
        cafeId: cafeId || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        _status: "new",
        _tempId: generateTempId(),
      };
      setLocalCategories((prev) => [...prev, newCategory]);
      setActiveCategoryId(newCategory.id);
    } else if (categoryDialogMode === "edit" && selectedCategory) {
      setLocalCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategory.id
            ? { ...cat, ...data, _status: "modified" as const }
            : cat
        )
      );
    }
    setCategoryDialogOpen(false);
  };

  // Menu item operations
  const handleAddMenuItem = () => {
    if (!activeCategoryId) {
      toast.error("Önce bir kategori seçin");
      return;
    }
    setMenuItemDialogMode("add");
    setSelectedMenuItem(null);
    setMenuItemDialogOpen(true);
  };

  const handleEditMenuItem = (item: MenuItemWithChanges) => {
    setMenuItemDialogMode("edit");
    setSelectedMenuItem(item);
    setMenuItemDialogOpen(true);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    const item = localMenuItems.find((i) => i.id === itemId);
    if (!item) return;

    setDeleteDialogType("menuItem");
    setDeleteDialogTitle("Menü Öğesini Sil");
    setDeleteDialogDescription(
      `"${item.name}" menü öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const handleMenuItemSubmit = (data: {
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
        cafeId: cafeId || "",
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

  // Extra operations
  const handleAddExtra = () => {
    setExtraDialogMode("add");
    setSelectedExtra(null);
    setExtraDialogOpen(true);
  };

  const handleEditExtra = (extra: ExtraWithChanges) => {
    setExtraDialogMode("edit");
    setSelectedExtra(extra);
    setExtraDialogOpen(true);
  };

  const handleDeleteExtra = (extraId: string) => {
    const extra = localExtras.find((e) => e.id === extraId);
    if (!extra) return;

    setDeleteDialogType("extra");
    setDeleteDialogTitle("Ekstrayı Sil");
    setDeleteDialogDescription(
      `"${extra.name}" ekstrasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    setItemToDelete(extraId);
    setDeleteDialogOpen(true);
  };

  const handleExtraSubmit = (data: {
    name: string;
    price: number;
    isAvailable: boolean;
  }) => {
    if (extraDialogMode === "add") {
      const newExtra: ExtraWithChanges = {
        id: generateTempId(),
        ...data,
        cafeId: cafeId || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        _status: "new",
        _tempId: generateTempId(),
      };
      setLocalExtras((prev) => [...prev, newExtra]);
    } else if (extraDialogMode === "edit" && selectedExtra) {
      setLocalExtras((prev) =>
        prev.map((extra) =>
          extra.id === selectedExtra.id
            ? { ...extra, ...data, _status: "modified" as const }
            : extra
        )
      );
    }
    setExtraDialogOpen(false);
  };

  // Delete confirmation
  const handleDeleteConfirm = () => {
    if (!itemToDelete || !deleteDialogType) return;

    if (deleteDialogType === "category") {
      setLocalCategories((prev) =>
        prev.map((cat) =>
          cat.id === itemToDelete
            ? { ...cat, _status: "deleted" as const }
            : cat
        )
      );
    } else if (deleteDialogType === "menuItem") {
      setLocalMenuItems((prev) =>
        prev.map((item) =>
          item.id === itemToDelete
            ? { ...item, _status: "deleted" as const }
            : item
        )
      );
    } else if (deleteDialogType === "extra") {
      setLocalExtras((prev) =>
        prev.map((extra) =>
          extra.id === itemToDelete
            ? { ...extra, _status: "deleted" as const }
            : extra
        )
      );
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Save all changes
  const handleSave = async () => {
    if (!cafeId) return;

    try {
      const saveData = {
        categories: {
          create: localCategories
            .filter((cat) => cat._status === "new")
            .map((cat) => ({ name: cat.name, order: cat.order })),
          update: localCategories
            .filter((cat) => cat._status === "modified")
            .map((cat) => ({
              id: cat.id,
              data: { name: cat.name, order: cat.order },
            })),
          delete: localCategories
            .filter((cat) => cat._status === "deleted")
            .map((cat) => cat.id),
        },
        menuItems: {
          create: localMenuItems
            .filter((item) => item._status === "new")
            .map((item) => ({
              categoryId: item.categoryId,
              name: item.name,
              price: item.price,
              description: item.description,
              isAvailable: item.isAvailable,
            })),
          update: localMenuItems
            .filter((item) => item._status === "modified")
            .map((item) => ({
              id: item.id,
              data: {
                categoryId: item.categoryId,
                name: item.name,
                price: item.price,
                description: item.description,
                isAvailable: item.isAvailable,
              },
            })),
          delete: localMenuItems
            .filter((item) => item._status === "deleted")
            .map((item) => item.id),
        },
        extras: {
          create: localExtras
            .filter((extra) => extra._status === "new")
            .map((extra) => ({
              name: extra.name,
              price: extra.price,
              isAvailable: extra.isAvailable,
            })),
          update: localExtras
            .filter((extra) => extra._status === "modified")
            .map((extra) => ({
              id: extra.id,
              data: {
                name: extra.name,
                price: extra.price,
                isAvailable: extra.isAvailable,
              },
            })),
          delete: localExtras
            .filter((extra) => extra._status === "deleted")
            .map((extra) => extra.id),
        },
      };

      await saveMenuMutation.mutateAsync({ cafeId, data: saveData });
      toast.success("Menü başarıyla kaydedildi");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Menü kaydedilemedi"
      );
    }
  };

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue =
          "Kaydedilmemiş değişiklikleriniz var. Sayfadan çıkmak istediğinizden emin misiniz?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  return {
    // Auth
    isAuthenticated,
    isLoading: authLoading || menuLoading,
    isManager,
    error: menuError,

    // Data
    categories: localCategories,
    menuItems: localMenuItems,
    extras: localExtras,
    currentCategoryItems,
    activeCategoryId,

    // State
    hasChanges,
    isSaving: saveMenuMutation.isPending,

    // Category operations
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleCategorySubmit,
    setActiveCategoryId,

    // Menu item operations
    handleAddMenuItem,
    handleEditMenuItem,
    handleDeleteMenuItem,
    handleMenuItemSubmit,

    // Extra operations
    handleAddExtra,
    handleEditExtra,
    handleDeleteExtra,
    handleExtraSubmit,

    // Save
    handleSave,

    // Dialog states
    categoryDialogOpen,
    categoryDialogMode,
    selectedCategory,
    setCategoryDialogOpen,

    menuItemDialogOpen,
    menuItemDialogMode,
    selectedMenuItem,
    setMenuItemDialogOpen,

    extraDialogOpen,
    extraDialogMode,
    selectedExtra,
    setExtraDialogOpen,

    deleteDialogOpen,
    deleteDialogTitle,
    deleteDialogDescription,
    setDeleteDialogOpen,
    handleDeleteConfirm,
  };
}
