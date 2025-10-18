"use client";

import { TableForm } from "@/components/forms/TableForm";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TableDialogsProps {
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  editingTable: { id: string; name: string } | null;
  tableToDelete: { id: string; name: string; isOccupied: boolean } | null;
  setTableToDelete: (
    table: { id: string; name: string; isOccupied: boolean } | null
  ) => void;
  onSubmitCreate: (data: { name: string }) => Promise<void>;
  onSubmitEdit: (data: { name: string }) => Promise<void>;
  onDeleteTable: () => Promise<void>;
  isLoading: boolean;
}

export function TableDialogs({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingTable,
  tableToDelete,
  setTableToDelete,
  onSubmitCreate,
  onSubmitEdit,
  onDeleteTable,
  isLoading,
}: TableDialogsProps) {
  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl">Yeni Masa</DialogTitle>
            <DialogDescription className="text-sm">
              Yeni bir masa ekleyin
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <TableForm
              onSubmit={onSubmitCreate}
              isLoading={isLoading}
              submitText="Oluştur"
            />
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isLoading}
              className="w-full sm:w-auto mt-0 sm:mt-0"
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl">
              Masa Düzenle
            </DialogTitle>
            <DialogDescription className="text-sm">
              Masa bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <TableForm
              initialData={editingTable || undefined}
              onSubmit={onSubmitEdit}
              isLoading={isLoading}
              submitText="Güncelle"
            />
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
              className="w-full sm:w-auto mt-0 sm:mt-0"
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!tableToDelete}
        onOpenChange={() => setTableToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px] w-[95vw]">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-lg sm:text-xl">
              Masayı Sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {tableToDelete?.name} masasını silmek istediğinizden emin misiniz?
              {tableToDelete?.isOccupied && (
                <span className="block mt-2 text-destructive text-sm">
                  Bu masada ödenmemiş siparişler var. Önce siparişleri
                  tamamlayın.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isLoading}
              className="w-full sm:w-auto mt-0 sm:mt-0"
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteTable}
              disabled={isLoading || tableToDelete?.isOccupied}
              className="table-dialog-delete-button"
            >
              {isLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
