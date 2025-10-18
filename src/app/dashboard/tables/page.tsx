"use client";

import { TableForm } from "@/components/forms/TableForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TableDialogs } from "@/components/tables/TableDialogs";
import { TableList } from "@/components/tables/TableList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTablesPage } from "@/hooks/useTablesPage";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TablesPage() {
  const {
    tables,
    isLoading,
    isAuthenticated,
    isManager,
    hasCafe,
    dialogStates,
    handlers,
  } = useTablesPage();
  const router = useRouter();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Bu sayfaya erişim yetkiniz yok.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasCafe) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Önce bir kafe oluşturmanız gerekiyor.</p>
            <Button
              onClick={() => router.push("/dashboard/settings")}
              className="mt-4"
            >
              Kafe Oluştur
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Masa Yönetimi
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Masaları ekleyin, düzenleyin ve yönetin
            </p>
          </div>

          <Dialog
            open={dialogStates.isCreateDialogOpen}
            onOpenChange={dialogStates.setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Masa Ekle</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-2 sm:space-y-3">
                <DialogTitle className="text-lg sm:text-xl">
                  Yeni Masa
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Yeni bir masa ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <TableForm
                  onSubmit={handlers.onSubmitCreate}
                  isLoading={isLoading}
                  submitText="Oluştur"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Masalar</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Kafenizdeki masaların listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableList
              tables={tables}
              onEdit={handlers.openEditDialog}
              onDelete={dialogStates.setTableToDelete}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <TableDialogs
          isCreateDialogOpen={dialogStates.isCreateDialogOpen}
          setIsCreateDialogOpen={dialogStates.setIsCreateDialogOpen}
          isEditDialogOpen={dialogStates.isEditDialogOpen}
          setIsEditDialogOpen={dialogStates.setIsEditDialogOpen}
          editingTable={dialogStates.editingTable}
          tableToDelete={dialogStates.tableToDelete}
          setTableToDelete={dialogStates.setTableToDelete}
          onSubmitCreate={handlers.onSubmitCreate}
          onSubmitEdit={handlers.onSubmitEdit}
          onDeleteTable={handlers.handleDeleteTable}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
