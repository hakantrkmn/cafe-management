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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Masa Yönetimi</h2>
            <p className="text-muted-foreground">
              Masaları ekleyin, düzenleyin ve yönetin
            </p>
          </div>

          <Dialog
            open={dialogStates.isCreateDialogOpen}
            onOpenChange={dialogStates.setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Masa Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Masa</DialogTitle>
                <DialogDescription>Yeni bir masa ekleyin</DialogDescription>
              </DialogHeader>
              <TableForm
                onSubmit={handlers.onSubmitCreate}
                isLoading={isLoading}
                submitText="Oluştur"
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Masalar</CardTitle>
            <CardDescription>Kafenizdeki masaların listesi</CardDescription>
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
          setEditingTable={dialogStates.setEditingTable}
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
