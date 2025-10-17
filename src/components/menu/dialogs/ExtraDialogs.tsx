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
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl">
              {extraDialogMode === "add" ? "Yeni Ekstra" : "Ekstra Düzenle"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {extraDialogMode === "add"
                ? "Yeni bir ekstra oluşturun"
                : "Ekstra bilgilerini güncelleyin"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
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
              submitText={
                extraDialogMode === "add" ? "Ekstra Ekle" : "Güncelle"
              }
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogClose}>
        <AlertDialogContent className="sm:max-w-[425px] w-[95vw]">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-lg sm:text-xl">
              {deleteDialogTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {deleteDialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-0 sm:mt-0">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
