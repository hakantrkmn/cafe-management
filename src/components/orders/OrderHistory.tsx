"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatOrderId, formatPrice } from "@/lib/formatters";
import { OrderWithRelations } from "@/types";
import { Calendar, Clock, User } from "lucide-react";
import { useState } from "react";

interface OrderHistoryProps {
  paidOrders: OrderWithRelations[];
  selectedTableName?: string;
}

export function OrderHistory({
  paidOrders,
  selectedTableName,
}: OrderHistoryProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filter orders by date range
  const filteredOrders = paidOrders.filter((order) => {
    if (!order.paidAt) return false;

    const orderDate = new Date(order.paidAt);
    if (isNaN(orderDate.getTime())) return false;

    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    if (fromDate && isNaN(fromDate.getTime())) return true; // Invalid from date, include all
    if (toDate && isNaN(toDate.getTime())) return true; // Invalid to date, include all

    if (fromDate && orderDate < fromDate) return false;
    if (toDate && orderDate > toDate) return false;

    return true;
  });

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return "Tarih bilgisi yok";

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Geçersiz tarih";

    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-6 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Sipariş Geçmişi {selectedTableName && `- ${selectedTableName}`}
          </h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredOrders.length} sipariş
        </div>
      </div>

      {/* Date Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Tarih Filtresi</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-xs">
                Başlangıç Tarihi
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-xs">
                Bitiş Tarihi
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
              className="w-fit"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-muted-foreground">
            {paidOrders.length === 0
              ? "Bu masada henüz ödenmiş sipariş yok"
              : "Seçilen tarih aralığında sipariş bulunamadı"}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="space-y-3">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {formatOrderId(order.id)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Ödendi
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.paidAt && formatDateTime(order.paidAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Staff Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Siparişi alan: {order.staff.name}</span>
                </div>

                {/* Products List */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Sipariş Detayları:
                  </div>
                  {order.products && order.products.length > 0 ? (
                    <div className="space-y-2">
                      {order.products.map((product, index) => {
                        // Find menu item info
                        const menuItem = order.orderItems.find(
                          (item) => item.menuItemId === product.id
                        )?.menuItem;

                        return (
                          <div
                            key={`${order.id}-product-${index}`}
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {menuItem?.name || "Bilinmeyen Ürün"}
                                </span>
                                {product.size && (
                                  <Badge variant="outline" className="text-xs">
                                    {product.size === "SMALL" && "Küçük"}
                                    {product.size === "MEDIUM" && "Orta"}
                                    {product.size === "LARGE" && "Büyük"}
                                  </Badge>
                                )}
                              </div>
                              {product.extras && product.extras.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {product.extras.map((extra, extraIndex) => (
                                    <Badge
                                      key={extraIndex}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {extra.name} (+{formatPrice(extra.price)})
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium">
                              {formatPrice(product.price)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Ürün detayları bulunamadı
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
