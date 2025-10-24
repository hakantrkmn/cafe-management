"use client";

import { OrderCalculator } from "@/lib/orderCalculator";
import { OrderProductUtils } from "@/lib/orderProductUtils";
import {
  useCreateOrder,
  useOrders,
  useTransferOrder,
  useUpdateOrder,
} from "@/queries/order";
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
  getTablePaidOrders: (
    tableId: string,
    dateFrom?: Date,
    dateTo?: Date
  ) => OrderWithRelations[];
  transferOrder: (
    sourceTableId: string,
    targetTableId: string
  ) => Promise<void>;
  refreshOrders: () => void;
  isSaving: boolean;
}

interface UseOrderOperationsProps {
  cafeId: string | null;
}

export function useOrderOperations({
  cafeId,
}: UseOrderOperationsProps): UseOrderOperationsReturn {
  // Data queries
  const { data: ordersData, refetch: refetchOrders } = useOrders(cafeId || "");

  // Mutations
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  const transferOrderMutation = useTransferOrder();

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

  // Save order using centralized calculator
  const saveOrder = useCallback(
    async (tableId: string, cartItems: OrderCartItem[]): Promise<void> => {
      if (!cafeId || cartItems.length === 0) return;

      // Validate cart items before saving
      const validation = cartItems.every((item) => {
        const itemValidation = OrderCalculator.validateCartItem(item);
        return itemValidation.isValid;
      });

      if (!validation) {
        throw new Error("Invalid cart items detected");
      }

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

  // Add items to existing order using centralized calculator
  const addToExistingOrder = useCallback(
    async (orderId: string, cartItems: OrderCartItem[]): Promise<void> => {
      if (!cafeId || cartItems.length === 0) return;

      // Validate cart items before adding
      const validation = cartItems.every((item) => {
        const itemValidation = OrderCalculator.validateCartItem(item);
        return itemValidation.isValid;
      });

      if (!validation) {
        throw new Error("Invalid cart items detected");
      }

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

  // Mark order as paid using centralized calculator
  const markOrderAsPaid = useCallback(
    async (orderId: string, products?: OrderProduct[]): Promise<void> => {
      if (!cafeId) return;

      try {
        const updateData: { isPaid: boolean; products?: OrderProduct[] } = {
          isPaid: true,
        };

        if (products) {
          // Validate products before updating
          const validation = products.every((product) => {
            const productValidation =
              OrderCalculator.validateOrderProduct(product);
            return productValidation.isValid;
          });

          if (!validation) {
            throw new Error("Invalid product data detected");
          }

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

  // Mark individual product as paid using centralized utils
  const markProductAsPaid = useCallback(
    async (orderId: string, productIndex: number): Promise<void> => {
      if (!cafeId) return;

      try {
        const order = orders.find((o: OrderWithRelations) => o.id === orderId);
        if (!order || !order.products) return;

        // Use centralized utils to mark product as paid
        const updatedProducts = OrderProductUtils.markProductAsPaid(
          order.products,
          productIndex
        );

        // Check if all products are paid using centralized utils
        const allProductsPaid =
          OrderProductUtils.areAllProductsPaid(updatedProducts);

        await updateOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: {
            products: updatedProducts,
            isPaid: allProductsPaid,
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

  // Delete individual product from order using centralized utils
  const deleteProduct = useCallback(
    async (orderId: string, productIndex: number): Promise<void> => {
      if (!cafeId) return;

      try {
        const order = orders.find((o: OrderWithRelations) => o.id === orderId);
        if (!order || !order.products) return;

        // Use centralized utils to remove product and get updated data
        const { updatedProducts, newTotalAmount } =
          OrderProductUtils.removeProductFromOrder(
            order.products,
            productIndex
          );

        // If no products left, mark order as empty
        if (updatedProducts.length === 0) {
          await updateOrderMutation.mutateAsync({
            cafeId,
            orderId,
            data: {
              products: [],
              totalAmount: 0,
              isPaid: false,
              paidAt: null,
            } as UpdateOrderRequest,
          });
        } else {
          // Calculate payment status using centralized utils
          const allProductsPaid =
            OrderProductUtils.areAllProductsPaid(updatedProducts);

          await updateOrderMutation.mutateAsync({
            cafeId,
            orderId,
            data: {
              products: updatedProducts,
              totalAmount: newTotalAmount,
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

  // Mark all orders as paid using centralized utils
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
            // Use centralized utils to mark all products as paid
            const updatedProducts = OrderProductUtils.markAllProductsAsPaid(
              order.products
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

  // Get all products consumed at a table using centralized utils
  const getTableProducts = useCallback(
    (tableId: string): string[] => {
      const tableOrders = orders.filter(
        (order: OrderWithRelations) => order.tableId === tableId && order.isPaid
      );

      // Use centralized utils to get paid products
      const allProducts = tableOrders.reduce(
        (acc: string[], order: OrderWithRelations) => {
          const paidProducts = OrderProductUtils.getProductsByPaymentStatus(
            order.products,
            true
          ).map((product: OrderProduct) => product.id);
          return [...acc, ...paidProducts];
        },
        []
      );

      // Remove duplicates
      return [...new Set(allProducts)] as string[];
    },
    [orders]
  );

  // Get paid orders for a specific table with optional date filtering
  const getTablePaidOrders = useCallback(
    (tableId: string, dateFrom?: Date, dateTo?: Date): OrderWithRelations[] => {
      let tablePaidOrders = orders.filter(
        (order: OrderWithRelations) => order.tableId === tableId && order.isPaid
      );

      // Apply date filtering if provided
      if (dateFrom || dateTo) {
        tablePaidOrders = tablePaidOrders.filter(
          (order: OrderWithRelations) => {
            if (!order.paidAt) return false;

            const orderDate = new Date(order.paidAt);
            if (dateFrom && orderDate < dateFrom) return false;
            if (dateTo && orderDate > dateTo) return false;

            return true;
          }
        );
      }

      // Sort by paidAt descending (most recent first)
      return tablePaidOrders.sort(
        (a: OrderWithRelations, b: OrderWithRelations) => {
          if (!a.paidAt || !b.paidAt) return 0;
          return new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime();
        }
      );
    },
    [orders]
  );

  // Transfer order to another table
  const transferOrder = useCallback(
    async (sourceTableId: string, targetTableId: string): Promise<void> => {
      if (!cafeId) return;

      try {
        await transferOrderMutation.mutateAsync({
          cafeId,
          data: {
            sourceTableId,
            targetTableId,
          },
        });
      } catch (error) {
        console.error("Error transferring order:", error);
        throw error;
      }
    },
    [cafeId, transferOrderMutation]
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
    getTablePaidOrders,
    transferOrder,
    refreshOrders: () => refetchOrders(),
    isSaving:
      createOrderMutation.isPending ||
      updateOrderMutation.isPending ||
      transferOrderMutation.isPending,
  };
}
