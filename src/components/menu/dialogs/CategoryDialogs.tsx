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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryDialogMode === "add"
                ? "Yeni Kategori"
                : "Kategori Düzenle"}
            </DialogTitle>
            <DialogDescription>
              {categoryDialogMode === "add"
                ? "Yeni bir kategori oluşturun"
                : "Kategori bilgilerini güncelleyin"}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialData={
              selectedCategory
                ? { name: selectedCategory.name, order: selectedCategory.order }
                : undefined
            }
            onSubmit={onCategorySubmit}
            submitText={
              categoryDialogMode === "add" ? "Kategori Ekle" : "Güncelle"
            }
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
