"use client";

import { OrderCalculator } from "@/lib/orderCalculator";
import { useAuth } from "@/queries/auth";
import { useMenu } from "@/queries/menu";
import { useTables } from "@/queries/tables";
import {
  ExtraWithQuantity,
  MenuItemSize,
  MenuItemWithRelations,
} from "@/types";
import { useCallback, useState } from "react";
import { useCartManagement } from "./useCartManagement";
import { useOrderOperations } from "./useOrderOperations";
import { useTableManagement } from "./useTableManagement";

export function useOrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const cafeId = user?.cafeId || user?.managedCafe?.id || null;

  // Data queries
  const { data: tablesData, isLoading: tablesLoading } = useTables(
    cafeId || ""
  );
  const { data: menuData, isLoading: menuLoading } = useMenu(cafeId || "");

  const tables = tablesData || [];
  const menu = menuData || { categories: [], menuItems: [], extras: [] };

  // Initialize specialized hooks
  const orderOperations = useOrderOperations({ cafeId });
  const cartManagement = useCartManagement();

  // Handle table selection
  const handleTableSelect = useCallback(
    (tableId: string) => {
      setSelectedTableId(tableId);
      setOrderDialogOpen(true);
      cartManagement.clearCart(); // Reset cart
    },
    [cartManagement]
  );

  const tableManagement = useTableManagement({
    cafeId: cafeId || null,
    orders: orderOperations.orders,
    onTableSelect: handleTableSelect,
  });

  // Enhanced order operations with cart integration
  const saveOrder = useCallback(async () => {
    if (!selectedTableId || cartManagement.cartItems.length === 0) return;

    try {
      // Masada ödenmemiş sipariş var mı kontrol et
      const existingOrders = orderOperations.getTableOrders(selectedTableId);

      if (existingOrders.length > 0) {
        // Ödenmemiş sipariş varsa, ilk siparişe ekle
        const firstOrder = existingOrders[0];
        await orderOperations.addToExistingOrder(
          firstOrder.id,
          cartManagement.cartItems
        );
      } else {
        // Ödenmemiş sipariş yoksa, yeni sipariş oluştur
        try {
          await orderOperations.saveOrder(
            selectedTableId,
            cartManagement.cartItems
          );
        } catch (error: unknown) {
          // Eğer API'den "ödenmemiş sipariş var" hatası gelirse, otomatik olarak ekleme yap
          if (
            error instanceof Error &&
            error.message?.includes("ödenmemiş sipariş var")
          ) {
            const existingOrders =
              orderOperations.getTableOrders(selectedTableId);
            if (existingOrders.length > 0) {
              const firstOrder = existingOrders[0];
              await orderOperations.addToExistingOrder(
                firstOrder.id,
                cartManagement.cartItems
              );
            }
          } else {
            throw error; // Diğer hataları tekrar fırlat
          }
        }
      }

      cartManagement.clearCart();
      // Dialog'u kapatmıyoruz - kullanıcı aynı masaya daha fazla ürün ekleyebilir
    } catch (error) {
      console.error("Error saving order:", error);
    }
  }, [selectedTableId, cartManagement, orderOperations]);

  const addToExistingOrder = useCallback(
    async (orderId: string) => {
      if (cartManagement.cartItems.length === 0) return;

      try {
        // Mevcut siparişe ürünleri ekle (API seviyesinde products array otomatik güncellenir)
        await orderOperations.addToExistingOrder(
          orderId,
          cartManagement.cartItems
        );

        cartManagement.clearCart();
        // Dialog'u kapatmıyoruz - kullanıcı aynı masaya daha fazla ürün ekleyebilir
      } catch (error) {
        console.error("Error adding to existing order:", error);
      }
    },
    [cartManagement, orderOperations]
  );

  const markAllAsPaid = useCallback(async () => {
    if (!selectedTableId) return;

    try {
      // Mark all orders as paid using the centralized method
      await orderOperations.markAllAsPaid(selectedTableId);
    } catch (error) {
      console.error("Error marking all orders as paid:", error);
    }
  }, [selectedTableId, orderOperations]);

  // Direct save function - saves cart item immediately without confirmation
  const saveCartItemDirectly = useCallback(
    async (
      menuItem: MenuItemWithRelations,
      quantity: number,
      extras: ExtraWithQuantity[] = [],
      size?: MenuItemSize
    ) => {
      if (!selectedTableId || !cafeId) return;

      try {
        await OrderCalculator.createAndSaveCartItem(
          menuItem,
          quantity,
          extras,
          size,
          selectedTableId,
          cafeId,
          {
            getTableOrders: orderOperations.getTableOrders,
            saveOrder: orderOperations.saveOrder,
            addToExistingOrder: orderOperations.addToExistingOrder,
          }
        );
      } catch (error) {
        console.error("Error saving cart item directly:", error);
        throw error; // Re-throw to handle in UI
      }
    },
    [selectedTableId, cafeId, orderOperations]
  );

  // Close order dialog
  const closeOrderDialog = useCallback(() => {
    setOrderDialogOpen(false);
    setSelectedTableId(null);
    cartManagement.clearCart();
  }, [cartManagement]);

  // Get existing orders for selected table
  const getTableOrders = useCallback(() => {
    if (!selectedTableId) return [];
    return orderOperations.getTableOrders(selectedTableId);
  }, [selectedTableId, orderOperations]);

  return {
    // Auth state
    isAuthenticated,
    isLoading: authLoading || tablesLoading || menuLoading,
    user,
    cafeId,

    // Data
    tables,
    menu,

    // UI state
    selectedTableId,
    orderDialogOpen,

    // Table management
    tableManagement,

    // Cart management
    cartManagement,

    // Order operations
    orderOperations,
    getTableOrders,
    saveOrder,
    addToExistingOrder,
    markProductAsPaid: orderOperations.markProductAsPaid,
    deleteProduct: orderOperations.deleteProduct,
    markAllAsPaid,
    refreshOrders: orderOperations.refreshOrders,
    closeOrderDialog,

    // Direct save functionality
    saveCartItemDirectly,
  };
}
