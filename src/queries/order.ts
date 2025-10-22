import { CreateOrderRequest, QueryKeys, UpdateOrderRequest } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API functions
const ordersApi = {
  getOrders: async (cafeId: string) => {
    const response = await fetch(`/api/cafes/${cafeId}/orders`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Siparişler alınamadı");
    }
    return response.json();
  },

  getTableOrders: async (cafeId: string, tableId: string) => {
    const response = await fetch(
      `/api/cafes/${cafeId}/orders?tableId=${tableId}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Masa siparişleri alınamadı");
    }
    return response.json();
  },

  createOrder: async ({
    cafeId,
    data,
  }: {
    cafeId: string;
    data: CreateOrderRequest;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Sipariş oluşturulamadı");
    }

    return response.json();
  },

  updateOrder: async ({
    cafeId,
    orderId,
    data,
  }: {
    cafeId: string;
    orderId: string;
    data: UpdateOrderRequest;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Sipariş güncellenemedi");
    }

    return response.json();
  },

  deleteOrder: async ({
    cafeId,
    orderId,
  }: {
    cafeId: string;
    orderId: string;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/orders/${orderId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Sipariş iptal edilemedi");
    }

    return response.json();
  },
};

// Hooks
export function useOrders(cafeId: string) {
  return useQuery({
    queryKey: QueryKeys.orders(cafeId),
    queryFn: () => ordersApi.getOrders(cafeId),
    enabled: !!cafeId,
    retry: 1,
  });
}

export function useTableOrders(cafeId: string, tableId: string) {
  return useQuery({
    queryKey: [...QueryKeys.orders(cafeId), "table", tableId],
    queryFn: () => ordersApi.getTableOrders(cafeId, tableId),
    enabled: !!cafeId && !!tableId,
    retry: 1,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: (_, variables) => {
      // Invalidate orders and tables queries
      queryClient.invalidateQueries({
        queryKey: QueryKeys.orders(variables.cafeId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tables(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Create order error:", error);
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.updateOrder,
    onSuccess: (_, variables) => {
      // Invalidate orders and tables queries
      queryClient.invalidateQueries({
        queryKey: QueryKeys.orders(variables.cafeId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tables(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Update order error:", error);
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.deleteOrder,
    onSuccess: (_, variables) => {
      // Invalidate orders and tables queries
      queryClient.invalidateQueries({
        queryKey: QueryKeys.orders(variables.cafeId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tables(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Delete order error:", error);
    },
  });
}
