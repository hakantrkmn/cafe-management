"use client";

import { useMenu } from "@/queries/menu";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSaveExtra } from "../queries/extra";

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

export function useExtraPage(cafeId: string) {
  // Local state
  const [localExtras, setLocalExtras] = useState<ExtraWithChanges[]>([]);

  // Dialog states
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

  // API hooks
  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
  } = useMenu(cafeId);
  const saveExtraMutation = useSaveExtra();

  // Initialize local state when data is fetched
  useEffect(() => {
    if (menuData) {
      // Only update if we don't have local changes
      const hasLocalChanges = localExtras.some((extra) => extra._status);

      if (!hasLocalChanges) {
        setLocalExtras(menuData.extras || []);
      }
    }
  }, [menuData, localExtras]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return localExtras.some((extra) => extra._status);
  }, [localExtras]);

  // Generate temp ID
  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Extra operations
  const onAddExtra = () => {
    setExtraDialogMode("add");
    setSelectedExtra(null);
    setExtraDialogOpen(true);
  };

  const onEditExtra = (extra: ExtraWithChanges) => {
    setExtraDialogMode("edit");
    setSelectedExtra(extra);
    setExtraDialogOpen(true);
  };

  const onDeleteExtra = (extraId: string) => {
    const extra = localExtras.find((e) => e.id === extraId);
    if (!extra) return;

    setDeleteDialogTitle("Ekstra Sil");
    setDeleteDialogDescription(
      `"${extra.name}" ekstrasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    setItemToDelete(extraId);
    setDeleteDialogOpen(true);
  };

  const onExtraSubmit = (data: {
    name: string;
    price: number;
    isAvailable: boolean;
  }) => {
    if (extraDialogMode === "add") {
      const newExtra: ExtraWithChanges = {
        id: generateTempId(),
        ...data,
        cafeId: cafeId,
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

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    setLocalExtras((prev) =>
      prev.map((extra) =>
        extra.id === itemToDelete
          ? { ...extra, _status: "deleted" as const }
          : extra
      )
    );

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      // Prepare data for API
      const extrasToSave = localExtras.filter((extra) => extra._status);

      await saveExtraMutation.mutateAsync({
        cafeId,
        extras: extrasToSave,
      });

      // Clear local changes after successful save
      setLocalExtras((prev) =>
        prev.map((extra) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _status, _tempId, ...cleanExtra } = extra;
          return cleanExtra as ExtraWithChanges;
        })
      );

      toast.success("Ekstralar başarıyla kaydedildi!");
    } catch (error) {
      console.error("Save extras error:", error);
      toast.error("Ekstralar kaydedilirken bir hata oluştu.");
    }
  };

  return {
    extras: localExtras,
    isLoading: menuLoading,
    hasChanges,
    isSaving: saveExtraMutation.isPending,
    onAddExtra,
    onEditExtra,
    onDeleteExtra,
    onExtraSubmit,
    handleSave,
    handleDeleteConfirm,
    // Dialog states
    extraDialogOpen,
    extraDialogMode,
    selectedExtra,
    setExtraDialogOpen,
    deleteDialogOpen,
    deleteDialogTitle,
    deleteDialogDescription,
    setDeleteDialogOpen,
  };
}
