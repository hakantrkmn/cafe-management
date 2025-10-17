"use client";

import { useAuth } from "@/queries/auth";
import { useCafe } from "@/queries/cafe";
import {
  useCreateTable,
  useDeleteTable,
  useTables,
  useUpdateTable,
} from "@/queries/tables";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useTablesPage() {
  const { isAuthenticated, isLoading: authLoading, isManager } = useAuth();
  const { data: cafeData, isLoading: cafeLoading } = useCafe();
  const router = useRouter();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [tableToDelete, setTableToDelete] = useState<{
    id: string;
    name: string;
    isOccupied: boolean;
  } | null>(null);

  const { data: tablesData, isLoading: tablesLoading } = useTables(
    cafeData?.cafe?.id || ""
  );

  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmitCreate = async (data: { name: string }) => {
    if (!cafeData?.cafe) return;

    try {
      await createTableMutation.mutateAsync({
        cafeId: cafeData.cafe.id,
        data,
      });
      setIsCreateDialogOpen(false);
      toast.success("Masa başarıyla oluşturuldu");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  const onSubmitEdit = async (data: { name: string }) => {
    if (!editingTable || !cafeData?.cafe) return;

    try {
      await updateTableMutation.mutateAsync({
        cafeId: cafeData.cafe.id,
        tableId: editingTable.id,
        data,
      });
      setIsEditDialogOpen(false);
      setEditingTable(null);
      toast.success("Masa başarıyla güncellendi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete || !cafeData?.cafe) return;

    try {
      await deleteTableMutation.mutateAsync({
        cafeId: cafeData.cafe.id,
        tableId: tableToDelete.id,
      });
      setTableToDelete(null);
      toast.success("Masa başarıyla silindi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  const openEditDialog = (table: { id: string; name: string }) => {
    setEditingTable(table);
    setIsEditDialogOpen(true);
  };

  const isLoading =
    authLoading ||
    cafeLoading ||
    tablesLoading ||
    createTableMutation.isPending ||
    updateTableMutation.isPending ||
    deleteTableMutation.isPending;

  return {
    tables: tablesData?.tables || [],
    isLoading,
    isAuthenticated,
    isManager,
    hasCafe: !!cafeData?.cafe,
    cafe: cafeData?.cafe,
    dialogStates: {
      isCreateDialogOpen,
      setIsCreateDialogOpen,
      isEditDialogOpen,
      setIsEditDialogOpen,
      editingTable,
      setEditingTable,
      tableToDelete,
      setTableToDelete,
    },
    handlers: {
      onSubmitCreate,
      onSubmitEdit,
      handleDeleteTable,
      openEditDialog,
    },
  };
}
