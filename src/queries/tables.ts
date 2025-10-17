import { CreateTableRequest, QueryKeys } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API functions
const tablesApi = {
  getTables: async (cafeId: string) => {
    const response = await fetch(`/api/cafes/${cafeId}/tables`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Masa listesi alınamadı");
    }
    const result = await response.json();
    return result.data;
  },

  createTable: async ({
    cafeId,
    data,
  }: {
    cafeId: string;
    data: CreateTableRequest;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/tables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Masa oluşturulamadı");
    }

    return response.json();
  },

  updateTable: async ({
    cafeId,
    tableId,
    data,
  }: {
    cafeId: string;
    tableId: string;
    data: Partial<CreateTableRequest>;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/tables/${tableId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Masa güncellenemedi");
    }

    return response.json();
  },

  deleteTable: async ({
    cafeId,
    tableId,
  }: {
    cafeId: string;
    tableId: string;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/tables/${tableId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Masa silinemedi");
    }

    return response.json();
  },
};

// Hooks
export function useTables(cafeId: string) {
  return useQuery({
    queryKey: QueryKeys.tables(cafeId),
    queryFn: () => tablesApi.getTables(cafeId),
    enabled: !!cafeId,
    retry: 1,
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tablesApi.createTable,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tables(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Create table error:", error);
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tablesApi.updateTable,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tables(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Update table error:", error);
    },
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tablesApi.deleteTable,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tables(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Delete table error:", error);
    },
  });
}
