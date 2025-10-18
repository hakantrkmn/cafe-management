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
            className={`order-product-card ${
              product.isPaid
                ? "order-product-card-paid"
                : "order-product-card-unpaid"
            }`}
          >
            <div className="order-product-header">
              {/* Header - Ürün Adı ve Durum */}
              <div className="order-product-header-top">
                <div className="order-product-header-left">
                  <div className="order-product-header-right">
                    <h4 className="order-product-name">
                      {menuItem?.name || "Bilinmeyen Ürün"}
                      {product.size && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          ({product.size === "SMALL" && "Küçük"}
                          {product.size === "MEDIUM" && "Orta"}
                          {product.size === "LARGE" && "Büyük"})
                        </span>
                      )}
                    </h4>
                    {product.isPaid && (
                      <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                    )}
                  </div>

                  {/* Fiyat */}
                  <div className="order-product-price">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>

              {/* Ekstralar */}
              {product.extras && product.extras.length > 0 && (
                <div className="order-product-extras">
                  <div className="order-product-extras-list">
                    {product.extras.map((extra, extraIndex) => {
                      const extraInfo = orderItem?.orderItemExtras.find(
                        (e) => e.extraId === extra.id
                      );

                      return (
                        <Badge
                          key={extraIndex}
                          variant="outline"
                          className="order-product-extra-badge"
                        >
                          {extraInfo?.extraName || "Ekstra"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Butonlar - En alta sabitlenmiş */}
              <div className="order-product-buttons">
                {!product.isPaid && (
                  <Button
                    size="sm"
                    onClick={() => onMarkProductAsPaid(order.id, index)}
                    disabled={isSaving}
                    className="order-pay-button"
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
                  className="order-delete-button"
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
