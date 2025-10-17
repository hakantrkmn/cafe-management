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
  setEditingTable: (table: { id: string; name: string } | null) => void;
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
  setEditingTable,
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Masa</DialogTitle>
            <DialogDescription>Yeni bir masa ekleyin</DialogDescription>
          </DialogHeader>
          <TableForm
            onSubmit={onSubmitCreate}
            isLoading={isLoading}
            submitText="Oluştur"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masa Düzenle</DialogTitle>
            <DialogDescription>Masa bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <TableForm
            initialData={editingTable}
            onSubmit={onSubmitEdit}
            isLoading={isLoading}
            submitText="Güncelle"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Masayı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {tableToDelete?.name} masasını silmek istediğinizden emin misiniz?
              {tableToDelete?.isOccupied && (
                <span className="block mt-2 text-destructive">
                  Bu masada ödenmemiş siparişler var. Önce siparişleri
                  tamamlayın.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteTable}
              disabled={isLoading || tableToDelete?.isOccupied}
            >
              {isLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
