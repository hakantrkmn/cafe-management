"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsData } from "@/hooks/useReportsData";
import { formatPrice } from "@/lib/formatters";
import {
  DollarSign,
  Gift,
  Package,
  ShoppingCart,
  Table,
  TrendingUp,
  Users,
  Truck,
} from "lucide-react";

interface ReportsSummaryProps {
  data: ReportsData;
}

export function ReportsSummary({ data }: ReportsSummaryProps) {
  const { summary, takeawaySummary, orders, topProducts, campaignStats } = data;

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

  // Get most used campaign
  const mostUsedCampaign =
    campaignStats.length > 0
      ? campaignStats.reduce((prev, current) =>
          prev.totalUsed > current.totalUsed ? prev : current
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards - Table Orders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-purple-700">Masa Siparişleri</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      {/* Summary Cards - Takeaway Orders */}
      {takeawaySummary && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-amber-700">Takeaway</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">
                  Toplam Takeaway
                </CardTitle>
                <div className="p-2 rounded-full bg-amber-100">
                  <Truck className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">
                  {takeawaySummary.totalTakeawayOrders}
                </div>
                <p className="text-xs text-amber-700">
                  Seçilen dönemde
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">
                  Takeaway Geliri
                </CardTitle>
                <div className="p-2 rounded-full bg-amber-100">
                  <DollarSign className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">
                  {formatPrice(takeawaySummary.totalTakeawayRevenue)}
                </div>
                <p className="text-xs text-amber-700">
                  Toplam ciro
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">
                  Ortalama Takeaway
                </CardTitle>
                <div className="p-2 rounded-full bg-amber-100">
                  <TrendingUp className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">
                  {formatPrice(takeawaySummary.averageTakeawayOrderValue)}
                </div>
                <p className="text-xs text-amber-700">
                  Sipariş başına ortalama
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
              {topProducts.length > 0
                ? `${topProducts[0].name}${
                    topProducts[0].size ? ` (${topProducts[0].size})` : ""
                  }`
                : "Veri yok"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topProducts.length > 0
                ? `${topProducts[0].totalSold} adet satıldı`
                : "Henüz satış yok"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Overview */}
      {mostUsedCampaign && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="h-4 w-4 text-purple-600" />
                En Çok Kullanılan Kampanya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-600">
                {mostUsedCampaign.campaignName}
              </div>
              <p className="text-xs text-muted-foreground">
                {mostUsedCampaign.totalUsed} kez kullanıldı
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
