"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { OrderProduct, OrderWithRelations } from "@/types";
import { CheckCircle, CreditCard, X } from "lucide-react";

interface OrderProductsProps {
  order: OrderWithRelations;
  onMarkProductAsPaid: (orderId: string, productIndex: number) => void;
  onDeleteProduct: (orderId: string, productIndex: number) => void;
  isSaving: boolean;
}

export function OrderProducts({
  order,
  onMarkProductAsPaid,
  onDeleteProduct,
  isSaving,
}: OrderProductsProps) {
  if (!order.products || order.products.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-sm text-muted-foreground">
          Henüz ürün eklenmemiş
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {order.products.map((product: OrderProduct, index) => {
        // Bu ürün için menu item bilgisini bul
        const menuItem = order.orderItems.find(
          (item) => item.menuItemId === product.id
        )?.menuItem;

        // Bu ürün için ekstra bilgilerini bul
        const orderItem = order.orderItems.find(
          (item) => item.menuItemId === product.id
        );

        return (
          <Card
            key={`${order.id}-product-${index}`}
            className={`transition-all duration-200 flex flex-col h-full ${
              product.isPaid
                ? "bg-green-50/50 border-green-200 shadow-sm"
                : "bg-white border-gray-200 hover:shadow-sm"
            }`}
          >
            <div className="p-3 flex flex-col h-full">
              {/* Header - Ürün Adı ve Durum */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <h4 className="font-medium text-xs text-gray-900 truncate">
                      {menuItem?.name || "Bilinmeyen Ürün"}
                    </h4>
                    {product.isPaid && (
                      <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                    )}
                  </div>

                  {/* Fiyat */}
                  <div className="text-sm font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>

              {/* Ekstralar */}
              {product.extras && product.extras.length > 0 && (
                <div className="mb-3 flex-1">
                  <div className="flex flex-wrap gap-1">
                    {product.extras.map((extra, extraIndex) => {
                      const extraInfo = orderItem?.orderItemExtras.find(
                        (e) => e.extraId === extra.id
                      );

                      return (
                        <Badge
                          key={extraIndex}
                          variant="outline"
                          className="text-xs bg-gray-50 text-gray-600 border-gray-200 px-1 py-0"
                        >
                          {extraInfo?.extraName || "Ekstra"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Butonlar - En alta sabitlenmiş */}
              <div className="flex gap-1 mt-auto pt-2">
                {!product.isPaid && (
                  <Button
                    size="sm"
                    onClick={() => onMarkProductAsPaid(order.id, index)}
                    disabled={isSaving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium h-7"
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    Öde
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteProduct(order.id, index)}
                  disabled={isSaving}
                  className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 h-7"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Sil</span>
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
