"use client";

import { useCreateOrder, useOrders, useUpdateOrder } from "@/queries/order";
import {
  CreateOrderRequest,
  OrderCartItem,
  OrderProduct,
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
  markOrderAsPaid: (
    orderId: string,
    products?: OrderProduct[]
  ) => Promise<void>;
  markProductAsPaid: (orderId: string, productIndex: number) => Promise<void>;
  deleteProduct: (orderId: string, productIndex: number) => Promise<void>;
  markAllAsPaid: (tableId: string) => Promise<void>;
  updateOrderProducts: (
    orderId: string,
    products: OrderProduct[]
  ) => Promise<void>;
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
          size: item.size,
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
          size: item.size,
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
    async (orderId: string, products?: OrderProduct[]): Promise<void> => {
      if (!cafeId) return;

      try {
        const updateData: { isPaid: boolean; products?: OrderProduct[] } = {
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

  // Mark individual product as paid
  const markProductAsPaid = useCallback(
    async (orderId: string, productIndex: number): Promise<void> => {
      if (!cafeId) return;

      try {
        // Mevcut siparişi bul
        const order = orders.find((o: OrderWithRelations) => o.id === orderId);
        if (!order || !order.products) return;

        // Products array'ini kopyala ve belirtilen index'teki ürünü ödendi olarak işaretle
        const updatedProducts = [...order.products];
        if (updatedProducts[productIndex]) {
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            isPaid: true,
          };
        }

        // Tüm ürünler ödendi mi kontrol et
        const allProductsPaid = updatedProducts.every(
          (product: OrderProduct) => product.isPaid
        );

        await updateOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: {
            products: updatedProducts,
            isPaid: allProductsPaid, // Tüm ürünler ödendiyse siparişi de ödendi olarak işaretle
            paidAt: allProductsPaid ? new Date() : null,
          } as UpdateOrderRequest,
        });
      } catch (error) {
        console.error("Error marking product as paid:", error);
        throw error;
      }
    },
    [cafeId, orders, updateOrderMutation]
  );

  // Delete individual product from order
  const deleteProduct = useCallback(
    async (orderId: string, productIndex: number): Promise<void> => {
      if (!cafeId) return;

      try {
        // Mevcut siparişi bul
        const order = orders.find((o: OrderWithRelations) => o.id === orderId);
        if (!order || !order.products) return;

        // Products array'inden belirtilen index'teki ürünü sil
        const updatedProducts = [...order.products];
        updatedProducts.splice(productIndex, 1);

        // Eğer hiç ürün kalmadıysa siparişi sil
        if (updatedProducts.length === 0) {
          // Siparişi tamamen sil - bu durumda API'de ayrı bir endpoint gerekebilir
          // Şimdilik products array'ini boş bırakıyoruz
          await updateOrderMutation.mutateAsync({
            cafeId,
            orderId,
            data: {
              products: [],
              isPaid: false,
              paidAt: null,
            } as UpdateOrderRequest,
          });
        } else {
          // Kalan ürünlerin toplam fiyatını hesapla
          const remainingTotal = updatedProducts.reduce(
            (sum, product) => sum + product.price,
            0
          );

          // Tüm ürünler ödendi mi kontrol et
          const allProductsPaid = updatedProducts.every(
            (product: OrderProduct) => product.isPaid
          );

          await updateOrderMutation.mutateAsync({
            cafeId,
            orderId,
            data: {
              products: updatedProducts,
              totalAmount: remainingTotal,
              isPaid: allProductsPaid,
              paidAt: allProductsPaid ? new Date() : null,
            } as UpdateOrderRequest,
          });
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
      }
    },
    [cafeId, orders, updateOrderMutation]
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
            // Mevcut products array'ini kopyala ve tüm ürünleri ödendi olarak işaretle
            const updatedProducts = order.products.map(
              (product: OrderProduct) => ({
                ...product,
                isPaid: true,
              })
            );

            await updateOrderMutation.mutateAsync({
              cafeId,
              orderId: order.id,
              data: {
                isPaid: true,
                products: updatedProducts,
                paidAt: new Date(),
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
    async (orderId: string, products: OrderProduct[]): Promise<void> => {
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
          const paidProducts =
            order.products
              ?.filter((product: OrderProduct) => product.isPaid)
              ?.map((product: OrderProduct) => product.id) || [];
          return [...acc, ...paidProducts];
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
    markProductAsPaid,
    deleteProduct,
    markAllAsPaid,
    updateOrderProducts,
    getTableProducts,
    isSaving: createOrderMutation.isPending || updateOrderMutation.isPending,
  };
}
