"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrderDialog } from "@/components/orders/OrderDialog";
import { TakeawayOrderDialog } from "@/components/orders/TakeawayOrderDialog";
import { TableLayoutEditor } from "@/components/orders/TableLayoutEditor";
import { useOrdersPage } from "@/hooks/useOrdersPage";
import { usePageLoading } from "@/hooks/usePageLoading";
import { Table } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrdersPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading,
    cafeId,
    tables,
    menu,
    selectedTableId,
    orderDialogOpen,
    takeawayDialogOpen,
    tableManagement,
    cartManagement,
    takeawayCartManagement,
    orderOperations,
    takeawayOrderOperations,
    getTableOrders,
    getTablePaidOrders,
    saveOrder,
    addToExistingOrder,
    markProductAsPaid,
    deleteProduct,
    markAllAsPaid,
    refreshOrders,
    closeOrderDialog,
    saveCartItemDirectly,
    onTransferOrder,
    availableTables,
    onTableOrderChange,
    onCampaignSelect,
    onTakeawayClick,
    closeTakeawayDialog,
    saveTakeawayOrder,
    addToExistingTakeawayOrder,
    markAllTakeawayAsPaid,
    saveTakeawayCartItemDirectly,
    getTakeawayOrders,
    getTakeawayPaidOrders,
    takeawayOrdersStats,
    markTakeawayProductAsPaid,
    deleteTakeawayProduct,
    refreshTakeawayOrders,
  } = useOrdersPage();

  // Auto page loading
  usePageLoading(isLoading, {
    loadingText: "Siparişler yükleniyor...",
    delay: 200,
    minDuration: 800,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (!cafeId) {
    return (
      <DashboardLayout>
        <div className="page-container">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Cafe Bulunamadı</h1>
            <p className="text-muted-foreground">
              Bu hesap herhangi bir cafe ile ilişkilendirilmemiş. Lütfen
              yöneticinizle iletişime geçin.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedTable = tables.find(
    (table: Table) => table.id === selectedTableId
  );
  const existingOrders = getTableOrders();
  const paidOrders = getTablePaidOrders();

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Sipariş Yönetimi</h1>
              <p className="page-description">
                Masaları düzenleyin ve siparişleri yönetin
              </p>
            </div>
          </div>
        </div>

        {/* Table Layout Editor */}
        <TableLayoutEditor
          tables={tables}
          getTableStatus={tableManagement.getTableStatus}
          onTableClick={tableManagement.handleTableClick}
          orders={orderOperations.orders}
          onTransferOrder={onTransferOrder}
          availableTables={availableTables}
          isSaving={orderOperations.isSaving}
          onTableOrderChange={onTableOrderChange}
          takeawayOrders={takeawayOrdersStats}
          onTakeawayClick={onTakeawayClick}
        />

        {/* Order Dialog */}
        <OrderDialog
          open={orderDialogOpen}
          onOpenChange={closeOrderDialog}
          selectedTableId={selectedTableId}
          selectedTableName={selectedTable?.name}
          categories={menu.categories}
          menuItems={menu.menuItems}
          extras={menu.extras}
          cartItems={cartManagement.cartItems}
          cartTotal={cartManagement.cartTotal}
          existingOrders={existingOrders}
          paidOrders={paidOrders}
          onAddToCart={cartManagement.addToCart}
          onUpdateQuantity={cartManagement.updateCartItemQuantity}
          onRemoveItem={cartManagement.removeFromCart}
          onSaveOrder={saveOrder}
          onAddToExistingOrder={addToExistingOrder}
          onMarkAllAsPaid={markAllAsPaid}
          onMarkProductAsPaid={markProductAsPaid}
          onDeleteProduct={deleteProduct}
          onRefresh={refreshOrders}
          onSaveCartItemDirectly={saveCartItemDirectly}
          onCampaignSelect={onCampaignSelect}
          isSaving={orderOperations.isSaving}
        />

        {/* Takeaway Order Dialog */}
        <TakeawayOrderDialog
          open={takeawayDialogOpen}
          onOpenChange={closeTakeawayDialog}
          categories={menu.categories}
          menuItems={menu.menuItems}
          extras={menu.extras}
          cartItems={takeawayCartManagement.cartItems}
          cartTotal={takeawayCartManagement.cartTotal}
          existingOrders={getTakeawayOrders()}
          paidOrders={getTakeawayPaidOrders()}
          onAddToCart={takeawayCartManagement.addToCart}
          onUpdateQuantity={takeawayCartManagement.updateCartItemQuantity}
          onRemoveItem={takeawayCartManagement.removeFromCart}
          onSaveOrder={saveTakeawayOrder}
          onAddToExistingOrder={addToExistingTakeawayOrder}
          onMarkAllAsPaid={markAllTakeawayAsPaid}
          onMarkProductAsPaid={markTakeawayProductAsPaid}
          onDeleteProduct={deleteTakeawayProduct}
          onRefresh={refreshTakeawayOrders}
          onSaveCartItemDirectly={saveTakeawayCartItemDirectly}
          onCampaignSelect={onCampaignSelect}
          isSaving={takeawayOrderOperations.isSaving}
        />
      </div>
    </DashboardLayout>
  );
}
