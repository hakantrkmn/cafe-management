"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SalesTrendChartProps {
  data: { date: string; revenue: number; orderCount: number }[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "dd MMM", { locale: tr }),
    fullDate: item.date,
    gelir: item.revenue,
    sipariş: item.orderCount,
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { fullDate: string; gelir: number; sipariş: number };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-sm text-muted-foreground">
            Gelir: ₺{data.gelir.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Sipariş: {data.sipariş} adet
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
            <TrendingUp className="h-5 w-5" />
            Satış Trendi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Henüz satış verisi bulunamadı</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Satış Trendi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="gelir"
                stroke="#10b981"
                strokeWidth={2}
                name="Gelir (₺)"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="sipariş"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Sipariş Sayısı"
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
