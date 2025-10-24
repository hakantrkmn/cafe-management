"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SWIPE_THRESHOLD } from "@/lib/constants";
import {
  Category,
  Extra,
  ExtraWithQuantity,
  MenuItemSize,
  MenuItemWithRelations,
  OrderCartItem,
  OrderWithRelations,
  Table,
} from "@/types";
import { useRef, useState } from "react";
import { ExtraSelectionDialog } from "./ExtraSelectionDialog";
import { MenuSelection } from "./MenuSelection";
import { OrderHistory } from "./OrderHistory";
import { OrderSummary } from "./OrderSummary";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTableId: string | null;
  selectedTableName?: string;
  categories: Category[];
  menuItems: MenuItemWithRelations[];
  extras: Extra[];
  cartItems: OrderCartItem[];
  cartTotal: number;
  existingOrders: OrderWithRelations[];
  paidOrders: OrderWithRelations[];
  onAddToCart: (
    menuItem: MenuItemWithRelations,
    quantity: number,
    extras: ExtraWithQuantity[],
    size?: MenuItemSize
  ) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSaveOrder: () => void;
  onAddToExistingOrder: (orderId: string) => void;
  onMarkAllAsPaid: () => void;
  onMarkProductAsPaid: (orderId: string, productIndex: number) => void;
  onDeleteProduct: (orderId: string, productIndex: number) => void;
  onRefresh: () => void;
  onTransferOrder?: (sourceTableId: string, targetTableId: string) => void;
  availableTables?: Table[];
  onSaveCartItemDirectly: (
    menuItem: MenuItemWithRelations,
    quantity: number,
    extras: ExtraWithQuantity[],
    size?: MenuItemSize
  ) => Promise<void>;
  isSaving: boolean;
}

export function OrderDialog({
  open,
  onOpenChange,
  selectedTableId,
  selectedTableName,
  categories,
  menuItems,
  extras,
  cartItems,
  cartTotal,
  existingOrders,
  paidOrders,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onSaveOrder,
  onAddToExistingOrder,
  onMarkAllAsPaid,
  onMarkProductAsPaid,
  onDeleteProduct,
  onRefresh,
  onTransferOrder,
  availableTables,
  onSaveCartItemDirectly,
  isSaving,
}: OrderDialogProps) {
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItemWithRelations | null>(null);
  const [selectedSize, setSelectedSize] = useState<MenuItemSize | undefined>(
    undefined
  );
  const [extraDialogOpen, setExtraDialogOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleItemSelect = (
    menuItem: MenuItemWithRelations,
    size?: MenuItemSize
  ) => {
    setSelectedMenuItem(menuItem);
    setSelectedSize(size);
    setExtraDialogOpen(true);
  };

  const handleAddToCart = async (
    menuItem: MenuItemWithRelations,
    quantity: number,
    selectedExtras: ExtraWithQuantity[]
  ) => {
    console.log("OrderDialog - handleAddToCart called");
    setIsAddingToCart(true);

    try {
      // Use direct save functionality instead of adding to cart
      await onSaveCartItemDirectly(
        menuItem,
        quantity,
        selectedExtras,
        selectedSize
      );
      console.log("OrderDialog - item saved directly");
    } catch (error) {
      console.error("Error saving item directly:", error);
      // Fallback to cart if direct save fails
      onAddToCart(menuItem, quantity, selectedExtras, selectedSize);
    }

    setSelectedMenuItem(null);
    setSelectedSize(undefined);
    setExtraDialogOpen(false);
    // Flag'i kısa bir süre sonra sıfırla
    setTimeout(() => setIsAddingToCart(false), 100);
    console.log("OrderDialog - handleAddToCart completed");
  };

  const handleClose = (open: boolean) => {
    console.log(
      "OrderDialog - handleClose called with open:",
      open,
      "isAddingToCart:",
      isAddingToCart
    );
    if (!open && !isAddingToCart) {
      console.log("OrderDialog - closing dialog");
      onOpenChange(false);
      setSelectedMenuItem(null);
      setSelectedSize(undefined);
      setExtraDialogOpen(false);
    } else if (!open && isAddingToCart) {
      console.log("OrderDialog - ignoring close request during add to cart");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > SWIPE_THRESHOLD;
    const isRightSwipe = distance < -SWIPE_THRESHOLD;

    if (isLeftSwipe) {
      // Sola swipe: Menu -> Orders -> History
      if (activeTab === "menu") {
        setActiveTab("orders");
      } else if (activeTab === "orders") {
        setActiveTab("history");
      }
    } else if (isRightSwipe) {
      // Sağa swipe: History -> Orders -> Menu
      if (activeTab === "history") {
        setActiveTab("orders");
      } else if (activeTab === "orders") {
        setActiveTab("menu");
      }
    }
  };

  if (!selectedTableId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full lg:max-w-7xl">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-white">
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              Sipariş Ekle -{" "}
              {selectedTableName || `Masa ${selectedTableId.slice(-4)}`}
            </DialogTitle>
          </DialogHeader>

          <div
            className="h-[calc(90vh-70px)]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="order-dialog-tabs-list grid grid-cols-3">
                <TabsTrigger value="menu" className="text-xs sm:text-sm">
                  Ürün Ekleme
                </TabsTrigger>
                <TabsTrigger value="orders" className="text-xs sm:text-sm">
                  Sipariş Özeti
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">
                  Sipariş Geçmişi
                </TabsTrigger>
              </TabsList>

              <div className="order-dialog-swipe-hint">
                Kaydırarak değiştirebilirsiniz
              </div>

              <TabsContent value="menu" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-3 sm:p-6 bg-white">
                  <div className="order-dialog-container">
                    <MenuSelection
                      categories={categories}
                      menuItems={menuItems}
                      onItemSelect={handleItemSelect}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto bg-slate-50 p-3 sm:p-6">
                  <div className="order-dialog-container">
                    <OrderSummary
                      cartItems={cartItems}
                      cartTotal={cartTotal}
                      existingOrders={existingOrders}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemoveItem={onRemoveItem}
                      onSaveOrder={onSaveOrder}
                      onAddToExistingOrder={onAddToExistingOrder}
                      onMarkAllAsPaid={onMarkAllAsPaid}
                      onMarkProductAsPaid={onMarkProductAsPaid}
                      onDeleteProduct={onDeleteProduct}
                      onRefresh={onRefresh}
                      isSaving={isSaving}
                      selectedTableName={selectedTableName}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto bg-slate-50 p-3 sm:p-6">
                  <div className="order-dialog-container">
                    <OrderHistory
                      paidOrders={paidOrders}
                      selectedTableName={selectedTableName}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extra Selection Dialog */}
      <ExtraSelectionDialog
        open={extraDialogOpen}
        onOpenChange={setExtraDialogOpen}
        menuItem={selectedMenuItem}
        selectedSize={selectedSize}
        availableExtras={extras}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
