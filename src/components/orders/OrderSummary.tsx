"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatOrderId, formatPrice } from "@/lib/formatters";
import { OrderCartItem, OrderWithRelations } from "@/types";
import { CreditCard, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { OrderProducts } from "./OrderProducts";

interface OrderSummaryProps {
  cartItems: OrderCartItem[];
  cartTotal: number;
  existingOrders: OrderWithRelations[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSaveOrder: () => void;
  onAddToExistingOrder?: (orderId: string) => void;
  onMarkAllAsPaid: () => void;
  onMarkProductAsPaid: (orderId: string, productIndex: number) => void;
  onDeleteProduct: (orderId: string, productIndex: number) => void;
  isSaving: boolean;
  selectedTableName?: string;
}

export function OrderSummary({
  cartItems,
  cartTotal,
  existingOrders,
  onUpdateQuantity,
  onRemoveItem,
  onSaveOrder,
  onMarkAllAsPaid,
  onMarkProductAsPaid,
  onDeleteProduct,
  isSaving,
  selectedTableName,
}: OrderSummaryProps) {
  return (
    <div className="space-y-6 p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Sipariş Özeti {selectedTableName && `- ${selectedTableName}`}
        </h3>
      </div>

      {/* Existing Orders */}
      {existingOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Mevcut Siparişler
            </h4>
            <Button
              size="sm"
              onClick={onMarkAllAsPaid}
              disabled={isSaving}
              className="order-mark-all-paid-button"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Tümünün Ödemesini Al
            </Button>
          </div>
          {existingOrders.map((order) => (
            <Card key={order.id} className="p-3">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{formatOrderId(order.id)}</p>
                    <p className="text-sm font-medium">
                      {formatPrice(order.totalAmount)}
                    </p>
                    {/* Ürün Özeti */}
                    <div className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const productSummary = order.products.reduce(
                          (acc, product) => {
                            const menuItem = order.orderItems.find(
                              (item) => item.menuItemId === product.id
                            )?.menuItem;
                            const name = menuItem?.name || "Bilinmeyen Ürün";
                            acc[name] = (acc[name] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        );

                        return Object.entries(productSummary)
                          .map(([name, count]) => `${count} adet ${name}`)
                          .join(", ");
                      })()}
                    </div>
                  </div>
                </div>

                {/* Products List - Her ürün ayrı ayrı gösterilir */}
                <OrderProducts
                  order={order}
                  onMarkProductAsPaid={onMarkProductAsPaid}
                  onDeleteProduct={onDeleteProduct}
                  isSaving={isSaving}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">
          Yeni Sipariş
        </h4>

        {cartItems.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Henüz ürün seçilmedi</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <h5 className="font-medium">{item.menuItemName}</h5>
                    {item.extras.length > 0 && (
                      <div className="mt-1">
                        {item.extras.map((extra, index) => (
                          <Badge
                            key={`${item.id}-extra-${extra.extraId}-${index}`}
                            variant="secondary"
                            className="mr-1 mb-1 text-xs"
                          >
                            {extra.extraName} x{extra.quantity}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.menuItemPrice)} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={isSaving}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isSaving}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right min-w-0">
                      <p className="font-medium">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveItem(item.id)}
                      disabled={isSaving}
                      className="order-cart-remove-button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Total and Actions */}
      {cartItems.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-lg font-semibold">Toplam:</span>
              <span className="text-lg font-bold">
                {formatPrice(cartTotal)}
              </span>
            </div>

            <Button
              onClick={onSaveOrder}
              disabled={isSaving}
              className="w-full"
              size="lg"
            >
              {isSaving ? (
                "Kaydediliyor..."
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Siparişi Kaydet
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
