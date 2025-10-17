"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportsData } from "@/hooks/useReportsData";
import { formatPrice } from "@/lib/formatters";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Package,
} from "lucide-react";
import { useState } from "react";

interface ReportsTableProps {
  data: ReportsData;
}

export function ReportsTable({ data }: ReportsTableProps) {
  const { orders, topProducts, tableStats } = data;
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sipariş Detayları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Seçilen dönemde sipariş bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {format(
                              new Date(order.createdAt),
                              "dd MMM yyyy HH:mm",
                              { locale: tr }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Masa:
                          </span>
                          <Badge variant="outline">{order.tableName}</Badge>
                        </div>
                        <Badge
                          variant={order.isPaid ? "default" : "destructive"}
                        >
                          {order.isPaid ? "Ödenmiş" : "Ödenmemiş"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(order.totalAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.products.length} ürün
                          </div>
                        </div>
                        <Collapsible open={expandedOrder === order.id}>
                          <CollapsibleTrigger
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            {expandedOrder === order.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                        </Collapsible>
                      </div>
                    </div>

                    {/* Order Products */}
                    <Collapsible open={expandedOrder === order.id}>
                      <CollapsibleContent>
                        <div className="border-t pt-3 mt-3">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ürün</TableHead>
                                <TableHead className="text-center">
                                  Adet
                                </TableHead>
                                <TableHead className="text-right">
                                  Birim Fiyat
                                </TableHead>
                                <TableHead className="text-right">
                                  Toplam
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.products.map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell className="font-medium">
                                    {product.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {product.quantity}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatPrice(product.price)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatPrice(product.total)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            En Çok Satan Ürünler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Henüz satış verisi bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead className="text-center">Satış Adedi</TableHead>
                  <TableHead className="text-right">Toplam Gelir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.totalSold}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(product.totalRevenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Masa Bazlı İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tableStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Henüz masa istatistiği bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Masa Adı</TableHead>
                  <TableHead className="text-center">Sipariş Sayısı</TableHead>
                  <TableHead className="text-right">Toplam Gelir</TableHead>
                  <TableHead className="text-right">Ortalama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableStats.map((table) => (
                  <TableRow key={table.tableId}>
                    <TableCell className="font-medium">
                      {table.tableName}
                    </TableCell>
                    <TableCell className="text-center">
                      {table.orderCount}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(table.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(
                        table.orderCount > 0
                          ? table.totalRevenue / table.orderCount
                          : 0
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
