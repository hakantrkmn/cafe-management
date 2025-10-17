"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatOrderId, formatPrice } from "@/lib/formatters";
import { OrderCartItem, OrderProduct, OrderWithRelations } from "@/types";
import { CreditCard, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

interface OrderSummaryProps {
  cartItems: OrderCartItem[];
  cartTotal: number;
  existingOrders: OrderWithRelations[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSaveOrder: () => void;
  onAddToExistingOrder: (orderId: string) => void;
  onMarkAsPaid: (orderId: string) => void;
  onMarkAllAsPaid: () => void;
  onMarkProductAsPaid: (orderId: string, productIndex: number) => void;
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
  onAddToExistingOrder,
  onMarkAsPaid,
  onMarkAllAsPaid,
  onMarkProductAsPaid,
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
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-muted-foreground">
              Mevcut Siparişler
            </h4>
            <Button
              size="sm"
              onClick={onMarkAllAsPaid}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-xs"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Tümünün Ödemesini Al
            </Button>
          </div>
          {existingOrders.map((order) => (
            <Card key={order.id} className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatOrderId(order.id)}</p>
                    <p className="text-sm font-medium">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddToExistingOrder(order.id)}
                      disabled={isSaving || cartItems.length === 0}
                    >
                      Ekle
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onMarkAsPaid(order.id)}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Ödeme Al
                    </Button>
                  </div>
                </div>

                {/* Products List - Her ürün ayrı ayrı gösterilir */}
                <div className="space-y-2">
                  {order.products && order.products.length > 0 ? (
                    order.products.map((product: OrderProduct, index) => {
                      // Bu ürün için menu item bilgisini bul
                      const menuItem = order.orderItems.find(
                        (item) => item.menuItemId === product.id
                      )?.menuItem;

                      return (
                        <div
                          key={`${order.id}-product-${index}`}
                          className={`text-sm p-2 rounded border ${
                            product.isPaid
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {menuItem?.name || "Bilinmeyen Ürün"}
                                </p>
                                {product.isPaid && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-100 text-green-800"
                                  >
                                    Ödendi
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <p className="font-medium">
                                {formatPrice(product.price)}
                              </p>
                              {!product.isPaid && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    onMarkProductAsPaid(order.id, index)
                                  }
                                  disabled={isSaving}
                                  className="mt-1 bg-green-600 hover:bg-green-700 text-xs"
                                >
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Öde
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground p-2">
                      Henüz ürün eklenmemiş
                    </div>
                  )}
                </div>
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium">{item.menuItemName}</h5>
                    {item.extras.length > 0 && (
                      <div className="mt-1">
                        {item.extras.map((extra, index) => (
                          <Badge
                            key={`${item.id}-extra-${extra.extraId}-${index}`}
                            variant="secondary"
                            className="mr-1 mb-1"
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

                  <div className="flex items-center gap-2">
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
                      <span className="w-8 text-center text-sm">
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

                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveItem(item.id)}
                      disabled={isSaving}
                      className="text-red-600 hover:text-red-700"
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
            <div className="flex justify-between items-center">
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
