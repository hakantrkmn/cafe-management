"use client";

import { CategoryForm } from "@/components/forms/CategoryForm";
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

interface Category {
  id: string;
  name: string;
  order: number;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
}

interface CategoryDialogsProps {
  // Category Dialog
  categoryDialogOpen: boolean;
  categoryDialogMode: "add" | "edit" | null;
  selectedCategory: Category | null;
  onCategoryDialogClose: () => void;
  onCategorySubmit: (data: { name: string; order: number }) => void;

  // Delete Dialog
  deleteDialogOpen: boolean;
  deleteDialogTitle: string;
  deleteDialogDescription: string;
  onDeleteDialogClose: () => void;
  onDeleteConfirm: () => void;
}

export function CategoryDialogs({
  categoryDialogOpen,
  categoryDialogMode,
  selectedCategory,
  onCategoryDialogClose,
  onCategorySubmit,
  deleteDialogOpen,
  deleteDialogTitle,
  deleteDialogDescription,
  onDeleteDialogClose,
  onDeleteConfirm,
}: CategoryDialogsProps) {
  return (
    <>
      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={onCategoryDialogClose}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl">
              {categoryDialogMode === "add"
                ? "Yeni Kategori"
                : "Kategori Düzenle"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {categoryDialogMode === "add"
                ? "Yeni bir kategori oluşturun"
                : "Kategori bilgilerini güncelleyin"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <CategoryForm
              initialData={
                selectedCategory
                  ? {
                      name: selectedCategory.name,
                      order: selectedCategory.order,
                    }
                  : undefined
              }
              onSubmit={onCategorySubmit}
              submitText={
                categoryDialogMode === "add" ? "Kategori Ekle" : "Güncelle"
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
