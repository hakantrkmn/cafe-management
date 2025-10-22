"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { OrderProduct, OrderWithRelations } from "@/types";
import { CheckCircle, CreditCard } from "lucide-react";

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
    <div className="order-products-grid">
      {order.products.map((product: OrderProduct, index) => {
        // Bu ürün için menu item bilgisini bul
        const menuItem = order.orderItems.find(
          (item) => item.menuItemId === product.id
        )?.menuItem;

        // Bu ürün için tüm orderItems'i bul (birden fazla olabilir)
        const matchingOrderItems = order.orderItems.filter(
          (item) => item.menuItemId === product.id
        );

        // Tüm orderItemExtras'ları topla
        const allOrderItemExtras = matchingOrderItems.flatMap(
          (item) => item.orderItemExtras
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
                      // Extra adını bul: önce product.extras.name varsa onu kullan,
                      // yoksa orderItemExtras'tan bul
                      const extraName =
                        extra.name ||
                        allOrderItemExtras.find((e) => e.extraId === extra.id)
                          ?.extraName ||
                        null;

                      // Extra adı bulunamazsa badge gösterme
                      if (!extraName) return null;

                      return (
                        <Badge
                          key={extraIndex}
                          variant="outline"
                          className="order-product-extra-badge"
                        >
                          {extraName} (+{formatPrice(extra.price)})
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
                    <CreditCard className="mr-1" />
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
                  Sil
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
