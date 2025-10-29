"use client";

import { OrderCalculator } from "@/lib/orderCalculator";
import { useAuth } from "@/queries/auth";
import { useMenu } from "@/queries/menu";
import { useTables } from "@/queries/tables";
import { useTableOrderStore } from "@/store/tableOrderStore";
import {
  CampaignWithRelations,
  ExtraWithQuantity,
  MenuItemPrice,
  MenuItemSize,
  MenuItemWithRelations,
  Table,
} from "@/types";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
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

  // Table order store
  const { setTableOrder, getTableOrder } = useTableOrderStore();

  const tables = useMemo(() => tablesData || [], [tablesData]);
  const menu = useMemo(
    () => menuData || { categories: [], menuItems: [], extras: [] },
    [menuData]
  );

  // Sort tables based on saved order
  const sortedTables = useMemo(() => {
    if (!cafeId || tables.length === 0) return tables;

    const savedOrder = getTableOrder(cafeId);

    if (savedOrder.length === 0) {
      // Default to alphabetical sorting by table name
      return [...tables].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Create a map for quick lookup
    const tableMap = new Map(tables.map((table: Table) => [table.id, table]));

    // First, add tables in saved order
    const orderedTables = savedOrder
      .map((id) => tableMap.get(id))
      .filter(Boolean) as Table[];

    // Then add any new tables that weren't in the saved order
    const savedIds = new Set(savedOrder);
    const newTables = tables.filter((table: Table) => !savedIds.has(table.id));

    return [...orderedTables, ...newTables];
  }, [tables, cafeId, getTableOrder]);

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

  // Get paid orders for selected table
  const getTablePaidOrders = useCallback(() => {
    if (!selectedTableId) return [];
    return orderOperations.getTablePaidOrders(selectedTableId);
  }, [selectedTableId, orderOperations]);

  // Available tables for transfer (tables without orders)
  const availableTables = useMemo(() => {
    return tables.filter((table: Table) => {
      const tableOrders = orderOperations.getTableOrders(table.id);
      return tableOrders.length === 0;
    });
  }, [tables, orderOperations]);

  // Transfer order functionality
  const handleTransferOrder = useCallback(
    async (sourceTableId: string, targetTableId: string) => {
      try {
        await orderOperations.transferOrder(sourceTableId, targetTableId);

        // Find table names for success message
        const sourceTable = tables.find((t: Table) => t.id === sourceTableId);
        const targetTable = tables.find((t: Table) => t.id === targetTableId);

        toast.success("Sipariş başarıyla taşındı", {
          description: `${sourceTable?.name} masasından ${targetTable?.name} masasına taşındı`,
          duration: 4000,
        });

        // Close dialog after successful transfer
        setOrderDialogOpen(false);
        setSelectedTableId(null);
        cartManagement.clearCart();
      } catch (error) {
        console.error("Error transferring order:", error);
        toast.error("Sipariş taşınamadı", {
          description:
            error instanceof Error ? error.message : "Bilinmeyen hata",
          duration: 4000,
        });
      }
    },
    [orderOperations, tables, cartManagement]
  );

  // Handle table order change
  const handleTableOrderChange = useCallback(
    (tableIds: string[]) => {
      if (cafeId) {
        setTableOrder(cafeId, tableIds);
      }
    },
    [cafeId, setTableOrder]
  );

  // Handle campaign selection
  const handleCampaignSelect = useCallback(
    async (campaign: CampaignWithRelations) => {
      if (!selectedTableId) {
        toast.error("Lütfen önce bir masa seçin");
        return;
      }

      try {
        // Check if there are existing unpaid orders for this table
        const existingOrders = orderOperations.getTableOrders(selectedTableId);

        if (existingOrders.length > 0) {
          // Add campaign to existing order
          const campaignCartItems = campaign.campaignItems.map(
            (campaignItem) => {
              // Find the full menu item from our menu data
              const fullMenuItem = menu.menuItems.find(
                (item: MenuItemWithRelations) =>
                  item.id === campaignItem.menuItemId
              );

              if (!fullMenuItem) {
                throw new Error(
                  `Menu item not found: ${campaignItem.menuItemId}`
                );
              }

              let size = campaignItem.size;
              let itemPrice = fullMenuItem.price;

              // If menu item has sizes but no size is specified in campaign, use the first available size
              if (fullMenuItem.hasSizes && !size) {
                const availableSizes =
                  fullMenuItem.prices?.map((p: MenuItemPrice) => p.size) || [];
                if (availableSizes.length > 0) {
                  size = availableSizes[0]; // Use the first available size as default
                }
              }

              // Calculate price based on size
              if (fullMenuItem.hasSizes && size && fullMenuItem.prices) {
                const sizePrice = fullMenuItem.prices.find(
                  (p: MenuItemPrice) => p.size === size
                );
                if (sizePrice) {
                  itemPrice = sizePrice.price;
                }
              }

              return {
                id: `${campaignItem.menuItemId}_${Date.now()}`, // temporary ID for local state
                menuItemId: campaignItem.menuItemId,
                menuItemName: fullMenuItem.name,
                menuItemPrice: itemPrice,
                quantity: campaignItem.quantity,
                size: size || undefined,
                extras: [], // Campaign items don't have extras
                subtotal: itemPrice * campaignItem.quantity,
              };
            }
          );

          // Add campaign to existing order with campaign info
          await orderOperations.addToExistingOrder(
            existingOrders[0].id,
            campaignCartItems,
            {
              campaignId: campaign.id,
              campaignName: campaign.name,
              campaignPrice: campaign.price,
            }
          );
          toast.success(`${campaign.name} kampanyası mevcut siparişe eklendi`);
        } else {
          // Create new order with campaign
          const campaignOrderItems = campaign.campaignItems.map(
            (campaignItem) => {
              // Find the full menu item from our menu data
              const fullMenuItem = menu.menuItems.find(
                (item: MenuItemWithRelations) =>
                  item.id === campaignItem.menuItemId
              );

              if (!fullMenuItem) {
                throw new Error(
                  `Menu item not found: ${campaignItem.menuItemId}`
                );
              }

              let size = campaignItem.size;

              // If menu item has sizes but no size is specified in campaign, use the first available size
              if (fullMenuItem.hasSizes && !size) {
                const availableSizes =
                  fullMenuItem.prices?.map((p: MenuItemPrice) => p.size) || [];
                if (availableSizes.length > 0) {
                  size = availableSizes[0]; // Use the first available size as default
                }
              }

              return {
                menuItemId: campaignItem.menuItemId,
                quantity: campaignItem.quantity,
                size: size || undefined,
                extras: [], // Campaign items don't have extras
              };
            }
          );

          // Create order with campaign
          const orderData = {
            tableId: selectedTableId,
            orderItems: campaignOrderItems,
          };

          // Use the createOrder mutation directly
          await orderOperations.createOrder.mutateAsync({
            cafeId: cafeId!,
            data: orderData,
          });

          toast.success(`${campaign.name} kampanyası siparişe eklendi`);
        }
      } catch (error) {
        console.error("Error adding campaign to order:", error);
        toast.error("Kampanya siparişe eklenirken hata oluştu");
      }
    },
    [selectedTableId, menu.menuItems, orderOperations, cafeId]
  );

  return {
    // Auth state
    isAuthenticated,
    isLoading: authLoading || tablesLoading || menuLoading,
    user,
    cafeId,

    // Data
    tables: sortedTables,
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
    getTablePaidOrders,
    saveOrder,
    addToExistingOrder,
    markProductAsPaid: orderOperations.markProductAsPaid,
    deleteProduct: orderOperations.deleteProduct,
    markAllAsPaid,
    refreshOrders: orderOperations.refreshOrders,
    closeOrderDialog,

    // Direct save functionality
    saveCartItemDirectly,

    // Campaign functionality
    onCampaignSelect: handleCampaignSelect,

    // Transfer functionality
    onTransferOrder: handleTransferOrder,
    availableTables,

    // Table ordering
    onTableOrderChange: handleTableOrderChange,
  };
}
