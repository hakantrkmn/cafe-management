"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrderDialog } from "@/components/orders/OrderDialog";
import { TableLayoutEditor } from "@/components/orders/TableLayoutEditor";
import { useOrdersPage } from "@/hooks/useOrdersPage";
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
    tableManagement,
    cartManagement,
    orderOperations,
    getTableOrders,
    saveOrder,
    addToExistingOrder,
    markOrderAsPaid,
    markAllAsPaid,
    closeOrderDialog,
  } = useOrdersPage();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!cafeId) {
    return (
      <DashboardLayout>
        <div className="p-6">
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sipariş Yönetimi
          </h1>
          <p className="text-muted-foreground">
            Masaları düzenleyin ve siparişleri yönetin
          </p>
        </div>

        {/* Table Layout Editor */}
        <TableLayoutEditor
          tables={tables}
          getTablePosition={tableManagement.getTablePosition}
          updateTablePosition={tableManagement.updateTablePosition}
          getTableStatus={tableManagement.getTableStatus}
          onTableClick={tableManagement.handleTableClick}
          editMode={tableManagement.editMode}
          onEditModeToggle={() =>
            tableManagement.setEditMode(!tableManagement.editMode)
          }
          orders={orderOperations.orders}
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
          onAddToCart={cartManagement.addToCart}
          onUpdateQuantity={cartManagement.updateCartItemQuantity}
          onRemoveItem={cartManagement.removeFromCart}
          onSaveOrder={saveOrder}
          onAddToExistingOrder={addToExistingOrder}
          onMarkAsPaid={markOrderAsPaid}
          onMarkAllAsPaid={markAllAsPaid}
          isSaving={orderOperations.isSaving}
        />
      </div>
    </DashboardLayout>
  );
}
