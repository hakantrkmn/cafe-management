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
      <div className="reports-summary-grid">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="reports-summary-header">
              <CardTitle className="reports-summary-title">
                {card.title}
              </CardTitle>
              <div className={`reports-summary-icon ${card.bgColor}`}>
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
      <div className="reports-payment-status-grid">
        <Card>
          <CardHeader className="reports-summary-card-header">
            <CardTitle className="reports-summary-card-title">
              <Users className="h-4 w-4 text-green-600" />
              Ödenmiş Siparişler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="reports-summary-change-positive">{paidOrders}</div>
            <p className="reports-summary-change">Tamamlanmış ödemeler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="reports-summary-card-header">
            <CardTitle className="reports-summary-card-title">
              <Users className="h-4 w-4 text-red-600" />
              Ödenmemiş Siparişler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="reports-summary-change-negative">
              {unpaidOrders}
            </div>
            <p className="reports-summary-change">Bekleyen ödemeler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="reports-summary-card-header">
            <CardTitle className="reports-summary-card-title">
              <Package className="h-4 w-4 text-blue-600" />
              En Çok Satan Ürün
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="reports-summary-change-info">
              {topProducts.length > 0 ? topProducts[0].name : "Veri yok"}
            </div>
            <p className="reports-summary-change">
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
