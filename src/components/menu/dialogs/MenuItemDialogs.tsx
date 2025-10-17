"use client";

import { MenuItemForm } from "@/components/forms/MenuItemForm";
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

interface MenuItem {
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
}

interface MenuItemDialogsProps {
  // Menu Item Dialog
  menuItemDialogOpen: boolean;
  menuItemDialogMode: "add" | "edit" | null;
  selectedMenuItem: MenuItem | null;
  categories: Category[];
  onMenuItemDialogClose: () => void;
  onMenuItemSubmit: (data: {
    categoryId: string;
    name: string;
    price: number;
    description?: string;
    isAvailable: boolean;
  }) => void;

  // Delete Dialog
  deleteDialogOpen: boolean;
  deleteDialogTitle: string;
  deleteDialogDescription: string;
  onDeleteDialogClose: () => void;
  onDeleteConfirm: () => void;
}

export function MenuItemDialogs({
  menuItemDialogOpen,
  menuItemDialogMode,
  selectedMenuItem,
  categories,
  onMenuItemDialogClose,
  onMenuItemSubmit,
  deleteDialogOpen,
  deleteDialogTitle,
  deleteDialogDescription,
  onDeleteDialogClose,
  onDeleteConfirm,
}: MenuItemDialogsProps) {
  return (
    <>
      {/* Menu Item Dialog */}
      <Dialog open={menuItemDialogOpen} onOpenChange={onMenuItemDialogClose}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl">
              {menuItemDialogMode === "add"
                ? "Yeni Menü Öğesi"
                : "Menü Öğesi Düzenle"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {menuItemDialogMode === "add"
                ? "Yeni bir menü öğesi oluşturun"
                : "Menü öğesi bilgilerini güncelleyin"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <MenuItemForm
              initialData={
                selectedMenuItem
                  ? {
                      categoryId: selectedMenuItem.categoryId,
                      name: selectedMenuItem.name,
                      price: selectedMenuItem.price,
                      description: selectedMenuItem.description,
                      isAvailable: selectedMenuItem.isAvailable,
                    }
                  : undefined
              }
              categories={categories.filter((cat) => cat._status !== "deleted")}
              onSubmit={onMenuItemSubmit}
              submitText={
                menuItemDialogMode === "add" ? "Menü Öğesi Ekle" : "Güncelle"
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
