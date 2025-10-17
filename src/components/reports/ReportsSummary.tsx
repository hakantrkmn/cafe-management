"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsData } from "@/hooks/useReportsData";
import { formatPrice } from "@/lib/formatters";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Table,
  TrendingUp,
  Users,
} from "lucide-react";

interface ReportsSummaryProps {
  data: ReportsData;
}

export function ReportsSummary({ data }: ReportsSummaryProps) {
  const { summary, orders, topProducts } = data;

  const summaryCards = [
    {
      title: "Toplam Sipariş",
      value: summary.totalOrders.toString(),
      icon: ShoppingCart,
      description: "Seçilen dönemde",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Toplam Gelir",
      value: formatPrice(summary.totalRevenue),
      icon: DollarSign,
      description: "Toplam ciro",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Aktif Masalar",
      value: summary.totalTables.toString(),
      icon: Table,
      description: "Sipariş verilen masa sayısı",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Ortalama Sipariş",
      value: formatPrice(summary.averageOrderValue),
      icon: TrendingUp,
      description: "Sipariş başına ortalama",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const paidOrders = orders.filter((order) => order.isPaid).length;
  const unpaidOrders = orders.length - paidOrders;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Ödenmiş Siparişler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Tamamlanmış ödemeler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-red-600" />
              Ödenmemiş Siparişler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {unpaidOrders}
            </div>
            <p className="text-xs text-muted-foreground">Bekleyen ödemeler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              En Çok Satan Ürün
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {topProducts.length > 0 ? topProducts[0].name : "Veri yok"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topProducts.length > 0
                ? `${topProducts[0].totalSold} adet satıldı`
                : "Henüz satış yok"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
