import {
  CreateTakeawayOrderRequest,
  QueryKeys,
  UpdateTakeawayOrderRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API functions
const takeawayOrdersApi = {
  getTakeawayOrders: async (cafeId: string) => {
    const response = await fetch(`/api/cafes/${cafeId}/takeaway-orders`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Paket servis siparişleri alınamadı");
    }
    return response.json();
  },

  createTakeawayOrder: async ({
    cafeId,
    data,
  }: {
    cafeId: string;
    data: CreateTakeawayOrderRequest;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/takeaway-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Paket servis siparişi oluşturulamadı");
    }

    return response.json();
  },

  updateTakeawayOrder: async ({
    cafeId,
    orderId,
    data,
  }: {
    cafeId: string;
    orderId: string;
    data: UpdateTakeawayOrderRequest;
  }) => {
    const response = await fetch(
      `/api/cafes/${cafeId}/takeaway-orders/${orderId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Paket servis siparişi güncellenemedi");
    }

    return response.json();
  },

  deleteTakeawayOrder: async ({
    cafeId,
    orderId,
  }: {
    cafeId: string;
    orderId: string;
  }) => {
    const response = await fetch(
      `/api/cafes/${cafeId}/takeaway-orders/${orderId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Paket servis siparişi iptal edilemedi"
      );
    }

    return response.json();
  },
};

// Hooks
export function useTakeawayOrders(cafeId: string) {
  return useQuery({
    queryKey: QueryKeys.takeawayOrders(cafeId),
    queryFn: () => takeawayOrdersApi.getTakeawayOrders(cafeId),
    enabled: !!cafeId,
    retry: 1,
  });
}

export function useCreateTakeawayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: takeawayOrdersApi.createTakeawayOrder,
    onSuccess: (_, variables) => {
      // Invalidate takeaway orders queries
      queryClient.invalidateQueries({
        queryKey: QueryKeys.takeawayOrders(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Create takeaway order error:", error);
    },
  });
}

export function useUpdateTakeawayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: takeawayOrdersApi.updateTakeawayOrder,
    onSuccess: (_, variables) => {
      // Invalidate takeaway orders queries
      queryClient.invalidateQueries({
        queryKey: QueryKeys.takeawayOrders(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Update takeaway order error:", error);
    },
  });
}

export function useDeleteTakeawayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: takeawayOrdersApi.deleteTakeawayOrder,
    onSuccess: (_, variables) => {
      // Invalidate takeaway orders queries
      queryClient.invalidateQueries({
        queryKey: QueryKeys.takeawayOrders(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Delete takeaway order error:", error);
    },
  });
}

