"use client";

import { useCreateOrder, useOrders, useUpdateOrder } from "@/queries/order";
import {
  CreateOrderRequest,
  OrderCartItem,
  OrderWithRelations,
  UpdateOrderRequest,
} from "@/types";
import { useCallback, useMemo } from "react";

interface UseOrderOperationsReturn {
  orders: OrderWithRelations[];
  getTableOrders: (tableId: string) => OrderWithRelations[];
  saveOrder: (tableId: string, cartItems: OrderCartItem[]) => Promise<void>;
  addToExistingOrder: (
    orderId: string,
    cartItems: OrderCartItem[]
  ) => Promise<void>;
  markOrderAsPaid: (orderId: string, products?: string[]) => Promise<void>;
  markAllAsPaid: (tableId: string) => Promise<void>;
  updateOrderProducts: (orderId: string, products: string[]) => Promise<void>;
  getTableProducts: (tableId: string) => string[];
  isSaving: boolean;
}

interface UseOrderOperationsProps {
  cafeId: string | null;
}

export function useOrderOperations({
  cafeId,
}: UseOrderOperationsProps): UseOrderOperationsReturn {
  // Data queries
  const { data: ordersData } = useOrders(cafeId || "");

  // Mutations
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const orders = useMemo(() => ordersData?.data || [], [ordersData?.data]);

  // Get existing orders for selected table
  const getTableOrders = useCallback(
    (tableId: string): OrderWithRelations[] => {
      return orders.filter(
        (order: OrderWithRelations) =>
          order.tableId === tableId && !order.isPaid
      );
    },
    [orders]
  );

  // Save order
  const saveOrder = useCallback(
    async (tableId: string, cartItems: OrderCartItem[]): Promise<void> => {
      if (!cafeId || cartItems.length === 0) return;

      const orderData: CreateOrderRequest = {
        tableId,
        orderItems: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          extras: item.extras.map((extra) => ({
            extraId: extra.extraId,
            quantity: extra.quantity,
          })),
        })),
      };

      try {
        await createOrderMutation.mutateAsync({
          cafeId,
          data: orderData,
        });
      } catch (error) {
        console.error("Error saving order:", error);
        throw error;
      }
    },
    [cafeId, createOrderMutation]
  );

  // Add items to existing order
  const addToExistingOrder = useCallback(
    async (orderId: string, cartItems: OrderCartItem[]): Promise<void> => {
      if (!cafeId || cartItems.length === 0) return;

      const orderData: CreateOrderRequest = {
        tableId: "", // Not needed for existing order
        orderItems: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          extras: item.extras.map((extra) => ({
            extraId: extra.extraId,
            quantity: extra.quantity,
          })),
        })),
      };

      try {
        await updateOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: { orderItems: orderData.orderItems },
        });
      } catch (error) {
        console.error("Error adding to existing order:", error);
        throw error;
      }
    },
    [cafeId, updateOrderMutation]
  );

  // Mark order as paid
  const markOrderAsPaid = useCallback(
    async (orderId: string, products?: string[]): Promise<void> => {
      if (!cafeId) return;

      try {
        const updateData: { isPaid: boolean; products?: string[] } = {
          isPaid: true,
        };
        if (products) {
          updateData.products = products;
        }

        await updateOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: updateData,
        });
      } catch (error) {
        console.error("Error marking order as paid:", error);
        throw error;
      }
    },
    [cafeId, updateOrderMutation]
  );

  // Mark all orders as paid
  const markAllAsPaid = useCallback(
    async (tableId: string): Promise<void> => {
      if (!cafeId) return;

      const tableOrders = orders.filter(
        (order: OrderWithRelations) =>
          order.tableId === tableId && !order.isPaid
      );

      try {
        await Promise.all(
          tableOrders.map(async (order: OrderWithRelations) => {
            const orderProducts = order.orderItems.map(
              (item) => item.menuItemId
            );
            await updateOrderMutation.mutateAsync({
              cafeId,
              orderId: order.id,
              data: {
                isPaid: true,
                products: orderProducts,
              } as UpdateOrderRequest,
            });
          })
        );
      } catch (error) {
        console.error("Error marking all orders as paid:", error);
        throw error;
      }
    },
    [cafeId, orders, updateOrderMutation]
  );

  // Update order products array
  const updateOrderProducts = useCallback(
    async (orderId: string, products: string[]): Promise<void> => {
      if (!cafeId) return;

      try {
        await updateOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: { products } as UpdateOrderRequest,
        });
      } catch (error) {
        console.error("Error updating order products:", error);
        throw error;
      }
    },
    [cafeId, updateOrderMutation]
  );

  // Get all products consumed at a table (from paid orders only)
  const getTableProducts = useCallback(
    (tableId: string): string[] => {
      const tableOrders = orders.filter(
        (order: OrderWithRelations) => order.tableId === tableId && order.isPaid
      );

      // Sadece ödenmiş siparişlerin products array'ini birleştir
      const allProducts = tableOrders.reduce(
        (acc: string[], order: OrderWithRelations) => {
          return [...acc, ...(order.products || [])];
        },
        []
      );

      // Duplicate'leri kaldır
      return [...new Set(allProducts)] as string[];
    },
    [orders]
  );

  return {
    orders,
    getTableOrders,
    saveOrder,
    addToExistingOrder,
    markOrderAsPaid,
    markAllAsPaid,
    updateOrderProducts,
    getTableProducts,
    isSaving: createOrderMutation.isPending || updateOrderMutation.isPending,
  };
}
