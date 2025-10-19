"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { Table } from "lucide-react";
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

interface TablePerformanceChartProps {
  data: {
    tableId: string;
    tableName: string;
    orderCount: number;
    totalRevenue: number;
  }[];
}

export function TablePerformanceChart({ data }: TablePerformanceChartProps) {
  // Prepare data for the chart - show top 8 tables
  const chartData = data.slice(0, 8).map((table) => ({
    name: table.tableName,
    sipariş: table.orderCount,
    gelir: table.totalRevenue,
    ortalama: table.orderCount > 0 ? table.totalRevenue / table.orderCount : 0,
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        sipariş: number;
        gelir: number;
        ortalama: number;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Sipariş: {data.sipariş} adet
          </p>
          <p className="text-sm text-muted-foreground">
            Gelir: {formatPrice(data.gelir)}
          </p>
          <p className="text-sm text-muted-foreground">
            Ortalama: {formatPrice(data.ortalama)}
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
          <CardTitle className="text-lg flex items-center gap-2">
            <Table className="h-5 w-5" />
            Masa Performansı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Henüz masa verisi bulunamadı</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Table className="h-5 w-5" />
          Masa Performansı
        </CardTitle>
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
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="sipariş"
                fill="#3b82f6"
                name="Sipariş Sayısı"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="gelir"
                fill="#10b981"
                name="Gelir (₺)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
