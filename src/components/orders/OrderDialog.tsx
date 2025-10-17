"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Category,
  Extra,
  ExtraWithQuantity,
  MenuItem,
  OrderCartItem,
  OrderWithRelations,
} from "@/types";
import { useState } from "react";
import { ExtraSelectionDialog } from "./ExtraSelectionDialog";
import { MenuSelection } from "./MenuSelection";
import { OrderSummary } from "./OrderSummary";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTableId: string | null;
  selectedTableName?: string;
  categories: Category[];
  menuItems: MenuItem[];
  extras: Extra[];
  cartItems: OrderCartItem[];
  cartTotal: number;
  existingOrders: OrderWithRelations[];
  onAddToCart: (
    menuItem: MenuItem,
    quantity: number,
    extras: ExtraWithQuantity[]
  ) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSaveOrder: () => void;
  onAddToExistingOrder: (orderId: string) => void;
  onMarkAsPaid: (orderId: string) => void;
  onMarkAllAsPaid: () => void;
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
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onSaveOrder,
  onAddToExistingOrder,
  onMarkAsPaid,
  onMarkAllAsPaid,
  isSaving,
}: OrderDialogProps) {
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  );
  const [extraDialogOpen, setExtraDialogOpen] = useState(false);

  const handleItemSelect = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setExtraDialogOpen(true);
  };

  const handleAddToCart = (
    menuItem: MenuItem,
    quantity: number,
    selectedExtras: ExtraWithQuantity[]
  ) => {
    onAddToCart(menuItem, quantity, selectedExtras);
    setSelectedMenuItem(null);
    setExtraDialogOpen(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedMenuItem(null);
    setExtraDialogOpen(false);
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

          <div className="h-[calc(90vh-70px)]">
            <Tabs defaultValue="menu" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-2 sm:mb-4 mx-2 sm:mx-0">
                <TabsTrigger value="menu" className="text-xs sm:text-sm">
                  Ürün Ekleme
                </TabsTrigger>
                <TabsTrigger value="orders" className="text-xs sm:text-sm">
                  Sipariş Özeti
                </TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-3 sm:p-6 bg-white">
                  <MenuSelection
                    categories={categories}
                    menuItems={menuItems}
                    extras={extras}
                    onItemSelect={handleItemSelect}
                  />
                </div>
              </TabsContent>

              <TabsContent value="orders" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto bg-slate-50 p-3 sm:p-6">
                  <OrderSummary
                    cartItems={cartItems}
                    cartTotal={cartTotal}
                    existingOrders={existingOrders}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                    onSaveOrder={onSaveOrder}
                    onAddToExistingOrder={onAddToExistingOrder}
                    onMarkAsPaid={onMarkAsPaid}
                    onMarkAllAsPaid={onMarkAllAsPaid}
                    isSaving={isSaving}
                    selectedTableName={selectedTableName}
                  />
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
        availableExtras={extras}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
