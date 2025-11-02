"use client";

import { OrderCalculator } from "@/lib/orderCalculator";
import { OrderProductUtils } from "@/lib/orderProductUtils";
import {
  useCreateTakeawayOrder,
  useTakeawayOrders,
  useUpdateTakeawayOrder,
} from "@/queries/takeawayOrder";
import {
  CreateTakeawayOrderRequest,
  OrderCartItem,
  OrderProduct,
  TakeawayOrderWithRelations,
  UpdateTakeawayOrderRequest,
} from "@/types";
import { useCallback, useMemo } from "react";

interface UseTakeawayOrderOperationsReturn {
  takeawayOrders: TakeawayOrderWithRelations[];
  getUnpaidTakeawayOrders: () => TakeawayOrderWithRelations[];
  saveTakeawayOrder: (cartItems: OrderCartItem[]) => Promise<void>;
  createTakeawayOrder: ReturnType<typeof useCreateTakeawayOrder>;
  addToExistingTakeawayOrder: (
    orderId: string,
    cartItems: OrderCartItem[],
    campaignInfo?: {
      campaignId: string;
      campaignName: string;
      campaignPrice: number;
    }
  ) => Promise<void>;
  markTakeawayOrderAsPaid: (
    orderId: string,
    products?: OrderProduct[]
  ) => Promise<void>;
  markTakeawayProductAsPaid: (
    orderId: string,
    productIndex: number
  ) => Promise<void>;
  deleteTakeawayProduct: (
    orderId: string,
    productIndex: number
  ) => Promise<void>;
  markAllTakeawayAsPaid: () => Promise<void>;
  updateTakeawayOrderProducts: (
    orderId: string,
    products: OrderProduct[]
  ) => Promise<void>;
  getTakeawayPaidOrders: (
    dateFrom?: Date,
    dateTo?: Date
  ) => TakeawayOrderWithRelations[];
  refreshTakeawayOrders: () => void;
  isSaving: boolean;
}

interface UseTakeawayOrderOperationsProps {
  cafeId: string | null;
}

export function useTakeawayOrderOperations({
  cafeId,
}: UseTakeawayOrderOperationsProps): UseTakeawayOrderOperationsReturn {
  // Data queries
  const { data: takeawayOrdersData, refetch: refetchTakeawayOrders } =
    useTakeawayOrders(cafeId || "");

  // Mutations
  const createTakeawayOrderMutation = useCreateTakeawayOrder();
  const updateTakeawayOrderMutation = useUpdateTakeawayOrder();

  const takeawayOrders = useMemo(
    () => takeawayOrdersData?.data || [],
    [takeawayOrdersData?.data]
  );

  // Get unpaid takeaway orders
  const getUnpaidTakeawayOrders = useCallback((): TakeawayOrderWithRelations[] => {
    return takeawayOrders.filter(
      (order: TakeawayOrderWithRelations) => !order.isPaid
    );
  }, [takeawayOrders]);

  // Save takeaway order using centralized calculator
  const saveTakeawayOrder = useCallback(
    async (cartItems: OrderCartItem[]): Promise<void> => {
      if (!cafeId || cartItems.length === 0) return;

      // Validate cart items before saving
      const validation = cartItems.every((item) => {
        const itemValidation = OrderCalculator.validateCartItem(item);
        return itemValidation.isValid;
      });

      if (!validation) {
        throw new Error("Invalid cart items detected");
      }

      const orderData: CreateTakeawayOrderRequest = {
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
        await createTakeawayOrderMutation.mutateAsync({
          cafeId,
          data: orderData,
        });
      } catch (error) {
        console.error("Error saving takeaway order:", error);
        throw error;
      }
    },
    [cafeId, createTakeawayOrderMutation]
  );

  // Add items to existing takeaway order using centralized calculator
  const addToExistingTakeawayOrder = useCallback(
    async (
      orderId: string,
      cartItems: OrderCartItem[],
      campaignInfo?: {
        campaignId: string;
        campaignName: string;
        campaignPrice: number;
      }
    ): Promise<void> => {
      if (!cafeId || cartItems.length === 0) return;

      // Validate cart items before adding
      const validation = cartItems.every((item) => {
        const itemValidation = OrderCalculator.validateCartItem(item);
        return itemValidation.isValid;
      });

      if (!validation) {
        throw new Error("Invalid cart items detected");
      }

      try {
        await updateTakeawayOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: {
            orderItems: cartItems.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              size: item.size,
              extras: item.extras.map((extra) => ({
                extraId: extra.extraId,
                quantity: extra.quantity,
              })),
            })),
            ...(campaignInfo && {
              campaignId: campaignInfo.campaignId,
              campaignName: campaignInfo.campaignName,
              campaignPrice: campaignInfo.campaignPrice,
            }),
          },
        });
      } catch (error) {
        console.error("Error adding to existing takeaway order:", error);
        throw error;
      }
    },
    [cafeId, updateTakeawayOrderMutation]
  );

  // Mark takeaway order as paid using centralized calculator
  const markTakeawayOrderAsPaid = useCallback(
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

        await updateTakeawayOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: updateData,
        });
      } catch (error) {
        console.error("Error marking takeaway order as paid:", error);
        throw error;
      }
    },
    [cafeId, updateTakeawayOrderMutation]
  );

  // Mark individual product as paid using centralized utils
  const markTakeawayProductAsPaid = useCallback(
    async (orderId: string, productIndex: number): Promise<void> => {
      if (!cafeId) return;

      try {
        const order = takeawayOrders.find(
          (o: TakeawayOrderWithRelations) => o.id === orderId
        );
        if (!order || !order.products) return;

        // Use centralized utils to mark product as paid
        const updatedProducts = OrderProductUtils.markProductAsPaid(
          order.products,
          productIndex
        );

        // Check if all products are paid using centralized utils
        const allProductsPaid =
          OrderProductUtils.areAllProductsPaid(updatedProducts);

        await updateTakeawayOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: {
            products: updatedProducts,
            isPaid: allProductsPaid,
            paidAt: allProductsPaid ? new Date() : null,
          } as UpdateTakeawayOrderRequest,
        });
      } catch (error) {
        console.error("Error marking takeaway product as paid:", error);
        throw error;
      }
    },
    [cafeId, takeawayOrders, updateTakeawayOrderMutation]
  );

  // Delete individual product from takeaway order using centralized utils
  const deleteTakeawayProduct = useCallback(
    async (orderId: string, productIndex: number): Promise<void> => {
      if (!cafeId) return;

      try {
        const order = takeawayOrders.find(
          (o: TakeawayOrderWithRelations) => o.id === orderId
        );
        if (!order || !order.products) return;

        // Use centralized utils to remove product and get updated data
        const { updatedProducts, newTotalAmount } =
          OrderProductUtils.removeProductFromOrder(
            order.products,
            productIndex
          );

        // If no products left, mark order as empty
        if (updatedProducts.length === 0) {
          await updateTakeawayOrderMutation.mutateAsync({
            cafeId,
            orderId,
            data: {
              products: [],
              totalAmount: 0,
              isPaid: false,
              paidAt: null,
            } as UpdateTakeawayOrderRequest,
          });
        } else {
          // Calculate payment status using centralized utils
          const allProductsPaid =
            OrderProductUtils.areAllProductsPaid(updatedProducts);

          await updateTakeawayOrderMutation.mutateAsync({
            cafeId,
            orderId,
            data: {
              products: updatedProducts,
              totalAmount: newTotalAmount,
              isPaid: allProductsPaid,
              paidAt: allProductsPaid ? new Date() : null,
            } as UpdateTakeawayOrderRequest,
          });
        }
      } catch (error) {
        console.error("Error deleting takeaway product:", error);
        throw error;
      }
    },
    [cafeId, takeawayOrders, updateTakeawayOrderMutation]
  );

  // Mark all takeaway orders as paid using centralized utils
  const markAllTakeawayAsPaid = useCallback(async (): Promise<void> => {
    if (!cafeId) return;

    const unpaidOrders = takeawayOrders.filter(
      (order: TakeawayOrderWithRelations) => !order.isPaid
    );

    try {
      await Promise.all(
        unpaidOrders.map(async (order: TakeawayOrderWithRelations) => {
          // Use centralized utils to mark all products as paid
          const updatedProducts = OrderProductUtils.markAllProductsAsPaid(
            order.products
          );

          await updateTakeawayOrderMutation.mutateAsync({
            cafeId,
            orderId: order.id,
            data: {
              isPaid: true,
              products: updatedProducts,
              paidAt: new Date(),
            } as UpdateTakeawayOrderRequest,
          });
        })
      );
    } catch (error) {
      console.error("Error marking all takeaway orders as paid:", error);
      throw error;
    }
  }, [cafeId, takeawayOrders, updateTakeawayOrderMutation]);

  // Update takeaway order products array
  const updateTakeawayOrderProducts = useCallback(
    async (orderId: string, products: OrderProduct[]): Promise<void> => {
      if (!cafeId) return;

      try {
        await updateTakeawayOrderMutation.mutateAsync({
          cafeId,
          orderId,
          data: { products } as UpdateTakeawayOrderRequest,
        });
      } catch (error) {
        console.error("Error updating takeaway order products:", error);
        throw error;
      }
    },
    [cafeId, updateTakeawayOrderMutation]
  );

  // Get paid takeaway orders with optional date filtering
  const getTakeawayPaidOrders = useCallback(
    (
      dateFrom?: Date,
      dateTo?: Date
    ): TakeawayOrderWithRelations[] => {
      let paidOrders = takeawayOrders.filter(
        (order: TakeawayOrderWithRelations) => order.isPaid
      );

      // Apply date filtering if provided
      if (dateFrom || dateTo) {
        paidOrders = paidOrders.filter((order: TakeawayOrderWithRelations) => {
          if (!order.paidAt) return false;

          const orderDate = new Date(order.paidAt);
          if (dateFrom && orderDate < dateFrom) return false;
          if (dateTo && orderDate > dateTo) return false;

          return true;
        });
      }

      // Sort by paidAt descending (most recent first)
      return paidOrders.sort(
        (a: TakeawayOrderWithRelations, b: TakeawayOrderWithRelations) => {
          if (!a.paidAt || !b.paidAt) return 0;
          return new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime();
        }
      );
    },
    [takeawayOrders]
  );

  return {
    takeawayOrders,
    getUnpaidTakeawayOrders,
    saveTakeawayOrder,
    createTakeawayOrder: createTakeawayOrderMutation,
    addToExistingTakeawayOrder,
    markTakeawayOrderAsPaid,
    markTakeawayProductAsPaid,
    deleteTakeawayProduct,
    markAllTakeawayAsPaid,
    updateTakeawayOrderProducts,
    getTakeawayPaidOrders,
    refreshTakeawayOrders: () => refetchTakeawayOrders(),
    isSaving:
      createTakeawayOrderMutation.isPending ||
      updateTakeawayOrderMutation.isPending,
  };
}

