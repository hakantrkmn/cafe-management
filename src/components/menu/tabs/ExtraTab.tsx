"use client";

import { ExtrasList } from "@/components/menu/ExtrasList";
import { SaveButton } from "@/components/menu/SaveButton";
import { ExtraDialogs } from "@/components/menu/dialogs/ExtraDialogs";
import { useExtraPage } from "@/hooks/useExtraPage";
import { Loader2 } from "lucide-react";

interface ExtraTabProps {
  cafeId: string;
}

export function ExtraTab({ cafeId }: ExtraTabProps) {
  const {
    extras,
    isLoading,
    hasChanges,
    onAddExtra,
    onEditExtra,
    onDeleteExtra,
    handleSave,
    isSaving,
    // Dialog states
    extraDialogOpen,
    extraDialogMode,
    selectedExtra,
    setExtraDialogOpen,
    onExtraSubmit,
    deleteDialogOpen,
    deleteDialogTitle,
    deleteDialogDescription,
    setDeleteDialogOpen,
    handleDeleteConfirm,
  } = useExtraPage(cafeId);

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
        <h2 className="text-2xl font-semibold">Ekstra Yönetimi</h2>
        <SaveButton
          hasChanges={hasChanges}
          onSave={handleSave}
          isLoading={isSaving}
        />
      </div>

      <ExtrasList
        extras={extras}
        onAddExtra={onAddExtra}
        onEditExtra={onEditExtra}
        onDeleteExtra={onDeleteExtra}
      />

      <ExtraDialogs
        extraDialogOpen={extraDialogOpen}
        extraDialogMode={extraDialogMode}
        selectedExtra={selectedExtra}
        onExtraDialogClose={() => setExtraDialogOpen(false)}
        onExtraSubmit={onExtraSubmit}
        deleteDialogOpen={deleteDialogOpen}
        deleteDialogTitle={deleteDialogTitle}
        deleteDialogDescription={deleteDialogDescription}
        onDeleteDialogClose={() => setDeleteDialogOpen(false)}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
