"use client";

import { useConfirmationModal } from "@/components/providers/ConfirmationModalProvider";
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
  const { showConfirmation } = useConfirmationModal();
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
        // Check if this is a campaign product
        if (product.campaignId && product.campaignName) {
          return (
            <Card
              key={`${product.id}-${index}`}
              className={`order-product-card ${
                product.isPaid ? "paid" : "unpaid"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{product.campaignName}</h4>
                    <Badge variant="secondary" className="text-xs">
                      Kampanya
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {formatPrice(product.price)}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Kampanya içeriği:
                    {product.products?.map((campaignProduct, itemIndex) => {
                      // Find menu item name from orderItems
                      const menuItem = order.orderItems.find(
                        (item) => item.menuItemId === campaignProduct.id
                      )?.menuItem;
                      const menuItemName = menuItem?.name || "Bilinmeyen Ürün";

                      return (
                        <span key={itemIndex}>
                          {itemIndex > 0 && ", "}
                          {campaignProduct.quantity} adet {menuItemName}
                          {campaignProduct.size &&
                            ` (${
                              campaignProduct.size === "SMALL"
                                ? "Küçük"
                                : campaignProduct.size === "MEDIUM"
                                ? "Orta"
                                : "Büyük"
                            })`}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {product.isPaid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkProductAsPaid(order.id, index)}
                      disabled={isSaving}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Öde
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        }

        // Regular product handling
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
                  onClick={async () => {
                    await showConfirmation({
                      title: "Ürünü Sil",
                      description: `${
                        menuItem?.name || "Bu ürün"
                      } siparişten silinecek. Bu işlem geri alınamaz.`,
                      confirmText: "Sil",
                      cancelText: "İptal",
                      variant: "destructive",
                      onConfirm: () => onDeleteProduct(order.id, index),
                    });
                  }}
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
