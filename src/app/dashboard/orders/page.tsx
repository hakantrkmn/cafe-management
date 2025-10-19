"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrderDialog } from "@/components/orders/OrderDialog";
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
    tableManagement,
    cartManagement,
    orderOperations,
    getTableOrders,
    saveOrder,
    addToExistingOrder,
    markProductAsPaid,
    deleteProduct,
    markAllAsPaid,
    closeOrderDialog,
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

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Sipariş Yönetimi</h1>
          <p className="page-description">
            Masaları düzenleyin ve siparişleri yönetin
          </p>
        </div>

        {/* Table Layout Editor */}
        <TableLayoutEditor
          tables={tables}
          getTableStatus={tableManagement.getTableStatus}
          onTableClick={tableManagement.handleTableClick}
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
          onMarkAllAsPaid={markAllAsPaid}
          onMarkProductAsPaid={markProductAsPaid}
          onDeleteProduct={deleteProduct}
          isSaving={orderOperations.isSaving}
        />
      </div>
    </DashboardLayout>
  );
}
