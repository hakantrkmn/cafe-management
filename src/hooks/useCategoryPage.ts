"use client";

import { useMenu } from "@/queries/menu";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSaveCategory } from "../queries/category";

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

export function useCategoryPage(cafeId: string) {
  // Local state
  const [localCategories, setLocalCategories] = useState<CategoryWithChanges[]>(
    []
  );
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Track initialization to prevent infinite loops
  const initializedRef = useRef(false);

  // Reset initialization when cafeId changes
  useEffect(() => {
    initializedRef.current = false;
    setLocalCategories([]);
    setActiveCategoryId(null);
  }, [cafeId]);

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogMode, setCategoryDialogMode] = useState<
    "add" | "edit" | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithChanges | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogTitle, setDeleteDialogTitle] = useState("");
  const [deleteDialogDescription, setDeleteDialogDescription] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // API hooks
  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
  } = useMenu(cafeId);
  const saveCategoryMutation = useSaveCategory();

  // Initialize local state when data is fetched
  useEffect(() => {
    if (menuData && !initializedRef.current) {
      setLocalCategories(menuData.categories || []);
      initializedRef.current = true;

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
  }, [menuData, activeCategoryId]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return localCategories.some((cat) => cat._status);
  }, [localCategories]);

  // Generate temp ID
  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Category operations
  const onAddCategory = () => {
    setCategoryDialogMode("add");
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const onEditCategory = (category: CategoryWithChanges) => {
    setCategoryDialogMode("edit");
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const onDeleteCategory = (categoryId: string) => {
    const category = localCategories.find((cat) => cat.id === categoryId);
    if (!category) return;

    setDeleteDialogTitle("Kategoriyi Sil");
    setDeleteDialogDescription(
      `"${category.name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    setItemToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const onCategorySelect = (categoryId: string) => {
    setActiveCategoryId(categoryId);
  };

  const onCategorySubmit = (data: { name: string; order: number }) => {
    if (categoryDialogMode === "add") {
      const newCategory: CategoryWithChanges = {
        id: generateTempId(),
        name: data.name,
        order: data.order,
        cafeId: cafeId,
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

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    setLocalCategories((prev) =>
      prev.map((cat) =>
        cat.id === itemToDelete ? { ...cat, _status: "deleted" as const } : cat
      )
    );

    // If deleted category was active, select another one
    if (activeCategoryId === itemToDelete) {
      const remainingCategories = localCategories
        .filter((cat) => cat.id !== itemToDelete && cat._status !== "deleted")
        .sort((a, b) => a.order - b.order);

      if (remainingCategories.length > 0) {
        setActiveCategoryId(remainingCategories[0].id);
      } else {
        setActiveCategoryId(null);
      }
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      // Prepare data for API
      const categoriesToSave = localCategories.filter((cat) => cat._status);

      await saveCategoryMutation.mutateAsync({
        cafeId,
        categories: categoriesToSave,
      });

      // Clear local changes after successful save
      setLocalCategories((prev) =>
        prev.map((cat) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _status, _tempId, ...cleanCat } = cat;
          return cleanCat as CategoryWithChanges;
        })
      );

      toast.success("Kategoriler başarıyla kaydedildi!");
    } catch (error) {
      console.error("Save categories error:", error);
      toast.error("Kategoriler kaydedilirken bir hata oluştu.");
    }
  };

  return {
    categories: localCategories,
    activeCategoryId,
    isLoading: menuLoading,
    hasChanges,
    isSaving: saveCategoryMutation.isPending,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    onCategorySelect,
    onCategorySubmit,
    handleSave,
    handleDeleteConfirm,
    // Dialog states
    categoryDialogOpen,
    categoryDialogMode,
    selectedCategory,
    setCategoryDialogOpen,
    deleteDialogOpen,
    deleteDialogTitle,
    deleteDialogDescription,
    setDeleteDialogOpen,
  };
}
