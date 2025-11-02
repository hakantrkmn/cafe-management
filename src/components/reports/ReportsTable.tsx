"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Filter,
  Package,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ReportsTableProps {
  data: ReportsData;
}

export function ReportsTable({ data }: ReportsTableProps) {
  const { orders, takeawayOrders, topProducts, takeawayTopProducts, tableStats } = data;
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Combine orders and takeaway orders
  const allOrders = useMemo(() => {
    const tableOrders = orders.map((order) => ({ ...order, isTakeaway: false }));
    const takeaway = (takeawayOrders || []).map((order) => ({ ...order, isTakeaway: true }));
    return [...tableOrders, ...takeaway].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, takeawayOrders]);

  // Filter states for top products table
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Extract unique categories and sizes from topProducts
  const { categories, sizes } = useMemo(() => {
    const categorySet = new Set<string>();
    const sizeSet = new Set<string>();

    topProducts.forEach((product) => {
      // Use the category field directly from the product
      if (product.category) {
        categorySet.add(product.category);
      }

      if (product.size) {
        sizeSet.add(product.size);
      }
    });

    return {
      categories: Array.from(categorySet).sort(),
      sizes: Array.from(sizeSet).sort(),
    };
  }, [topProducts]);

  // Filter top products based on selected filters
  const filteredTopProducts = useMemo(() => {
    return topProducts.filter((product) => {
      // Category filter
      if (selectedCategories.size > 0) {
        if (!product.category || !selectedCategories.has(product.category)) {
          return false;
        }
      }

      // Size filter
      if (selectedSizes.size > 0) {
        if (!product.size || !selectedSizes.has(product.size)) {
          return false;
        }
      }

      return true;
    });
  }, [topProducts, selectedCategories, selectedSizes]);

  // Handle category selection
  const handleCategoryToggle = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  // Handle size selection
  const handleSizeToggle = (size: string) => {
    const newSelected = new Set(selectedSizes);
    if (newSelected.has(size)) {
      newSelected.delete(size);
    } else {
      newSelected.add(size);
    }
    setSelectedSizes(newSelected);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories(new Set());
    setSelectedSizes(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="reports-table-title">
            <Package className="h-5 w-5" />
            Sipariş Detayları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allOrders.length === 0 ? (
            <div className="reports-table-empty">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Seçilen dönemde sipariş bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allOrders.map((order) => (
                <Card
                  key={order.id}
                  className={`border-l-4 ${
                    order.isTakeaway
                      ? "border-l-amber-500 bg-amber-50/30"
                      : "border-l-primary"
                  }`}
                >
                  <CardContent className="p-4">
                    {/* Order Header */}
                    <div className="reports-table-row-header">
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
                          {order.isTakeaway ? (
                            <>
                              <Truck className="h-4 w-4 text-amber-600" />
                              <Badge
                                variant="outline"
                                className="border-amber-300 text-amber-700 bg-amber-50"
                              >
                                Takeaway
                              </Badge>
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-muted-foreground">
                                Masa:
                              </span>
                              <Badge variant="outline">{order.tableName}</Badge>
                            </>
                          )}
                        </div>
                        <Badge
                          variant={order.isPaid ? "default" : "destructive"}
                        >
                          {order.isPaid ? "Ödenmiş" : "Ödenmemiş"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="reports-table-cell-amount">
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
                                    <div className="flex items-center gap-2">
                                      {product.isCampaign && (
                                        <Badge variant="secondary" className="text-xs">
                                          Kampanya
                                        </Badge>
                                      )}
                                      <span>
                                        {product.name}
                                        {product.size ? ` (${product.size})` : ""}
                                      </span>
                                    </div>
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

      {/* Top Products Table - Table Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Masa Siparişleri - En Çok Satan Ürünler
              {(selectedCategories.size > 0 || selectedSizes.size > 0) && (
                <Badge variant="secondary" className="ml-2">
                  {filteredTopProducts.length} / {topProducts.length}
                </Badge>
              )}
            </CardTitle>
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                  {(selectedCategories.size > 0 || selectedSizes.size > 0) && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-4 px-1 text-xs"
                    >
                      {selectedCategories.size + selectedSizes.size}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ürün Filtreleri</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Kategoriler</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategories(new Set())}
                          className="h-6 px-2 text-xs"
                        >
                          Temizle
                        </Button>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {categories.map((category) => (
                          <div
                            key={category}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.has(category)}
                              onCheckedChange={() =>
                                handleCategoryToggle(category)
                              }
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Filter */}
                  {sizes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Boyutlar</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSizes(new Set())}
                          className="h-6 px-2 text-xs"
                        >
                          Temizle
                        </Button>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {sizes.map((size) => (
                          <div
                            key={size}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`size-${size}`}
                              checked={selectedSizes.has(size)}
                              onCheckedChange={() => handleSizeToggle(size)}
                            />
                            <label
                              htmlFor={`size-${size}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {size}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear All Button */}
                  {(selectedCategories.size > 0 || selectedSizes.size > 0) && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="w-full"
                      >
                        Tüm Filtreleri Temizle
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Henüz satış verisi bulunamadı</p>
            </div>
          ) : filteredTopProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Seçilen filtreler için ürün bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead className="text-center">Satış Adedi</TableHead>
                  <TableHead className="text-right">Toplam Gelir</TableHead>
                  <TableHead className="text-right">Ortalama Fiyat</TableHead>
                  <TableHead className="text-center">
                    En Çok Satılan Saat
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                      {product.size ? ` (${product.size})` : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.totalSold}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(product.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(product.averagePrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.peakHour !== undefined
                        ? `${product.peakHour}:00`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Takeaway Top Products Table */}
      {takeawayTopProducts && takeawayTopProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
              <Truck className="h-5 w-5 text-amber-700" />
              Takeaway - En Çok Satan Ürünler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead className="text-center">Satış Adedi</TableHead>
                  <TableHead className="text-right">Toplam Gelir</TableHead>
                  <TableHead className="text-right">Ortalama Fiyat</TableHead>
                  <TableHead className="text-center">
                    En Çok Satılan Saat
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {takeawayTopProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                      {product.size ? ` (${product.size})` : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.totalSold}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(product.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(product.averagePrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.peakHour !== undefined
                        ? `${product.peakHour}:00`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
