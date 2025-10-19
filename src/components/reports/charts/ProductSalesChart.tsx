"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportsTopProduct } from "@/hooks/useReportsData";
import { Filter, Package } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductSalesChartProps {
  data: ReportsTopProduct[];
}

export function ProductSalesChart({ data }: ProductSalesChartProps) {
  // State for selected products
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(data.slice(0, 8).map((product) => product.id))
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter data based on selected products
  const filteredData = data.filter((product) =>
    selectedProducts.has(product.id)
  );

  // Prepare data for the chart - show selected products
  const chartData = filteredData.map((product) => ({
    name:
      product.name.length > 15
        ? product.name.substring(0, 15) + "..."
        : product.name,
    fullName: product.name,
    satış: product.totalSold,
    gelir: product.totalRevenue,
    ortalama: product.averagePrice,
  }));

  // Handle product selection
  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Select all products
  const handleSelectAll = () => {
    setSelectedProducts(new Set(data.map((product) => product.id)));
  };

  // Deselect all products
  const handleDeselectAll = () => {
    setSelectedProducts(new Set());
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        fullName: string;
        satış: number;
        gelir: number;
        ortalama: number;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">
            Satış: {data.satış} adet
          </p>
          <p className="text-sm text-muted-foreground">
            Gelir: ₺{data.gelir.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Ortalama: ₺{data.ortalama.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ürün Satış Grafiği
            </CardTitle>
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele ({selectedProducts.size})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ürün Seçimi</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Tümünü Seç
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                    >
                      Tümünü Kaldır
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {data.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50"
                      >
                        <Checkbox
                          id={product.id}
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() =>
                            handleProductToggle(product.id)
                          }
                        />
                        <label
                          htmlFor={product.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {product.name}
                          {product.size && (
                            <span className="text-muted-foreground ml-1">
                              ({product.size})
                            </span>
                          )}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {product.totalSold} adet
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {selectedProducts.size === 0
                ? "Lütfen görüntülenecek ürünleri seçin"
                : "Seçilen ürünler için satış verisi bulunamadı"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ürün Satış Grafiği
          </CardTitle>
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele ({selectedProducts.size})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ürün Seçimi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Tümünü Seç
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                  >
                    Tümünü Kaldır
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {data.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50"
                    >
                      <Checkbox
                        id={product.id}
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => handleProductToggle(product.id)}
                      />
                      <label
                        htmlFor={product.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {product.name}
                        {product.size && (
                          <span className="text-muted-foreground ml-1">
                            ({product.size})
                          </span>
                        )}
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {product.totalSold} adet
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="satış"
                fill="#3b82f6"
                name="Satış Adedi"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
