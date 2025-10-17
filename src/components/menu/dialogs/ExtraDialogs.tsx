"use client";

import { ExtraForm } from "@/components/forms/ExtraForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Extra {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
}

interface ExtraDialogsProps {
  // Extra Dialog
  extraDialogOpen: boolean;
  extraDialogMode: "add" | "edit" | null;
  selectedExtra: Extra | null;
  onExtraDialogClose: () => void;
  onExtraSubmit: (data: {
    name: string;
    price: number;
    isAvailable: boolean;
  }) => void;

  // Delete Dialog
  deleteDialogOpen: boolean;
  deleteDialogTitle: string;
  deleteDialogDescription: string;
  onDeleteDialogClose: () => void;
  onDeleteConfirm: () => void;
}

export function ExtraDialogs({
  extraDialogOpen,
  extraDialogMode,
  selectedExtra,
  onExtraDialogClose,
  onExtraSubmit,
  deleteDialogOpen,
  deleteDialogTitle,
  deleteDialogDescription,
  onDeleteDialogClose,
  onDeleteConfirm,
}: ExtraDialogsProps) {
  return (
    <>
      {/* Extra Dialog */}
      <Dialog open={extraDialogOpen} onOpenChange={onExtraDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {extraDialogMode === "add" ? "Yeni Ekstra" : "Ekstra Düzenle"}
            </DialogTitle>
            <DialogDescription>
              {extraDialogMode === "add"
                ? "Yeni bir ekstra oluşturun"
                : "Ekstra bilgilerini güncelleyin"}
            </DialogDescription>
          </DialogHeader>
          <ExtraForm
            initialData={
              selectedExtra
                ? {
                    name: selectedExtra.name,
                    price: selectedExtra.price,
                    isAvailable: selectedExtra.isAvailable,
                  }
                : undefined
            }
            onSubmit={onExtraSubmit}
            submitText={extraDialogMode === "add" ? "Ekstra Ekle" : "Güncelle"}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
