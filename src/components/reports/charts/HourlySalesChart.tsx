"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { Clock } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HourlySalesChartProps {
  data: { hour: number; revenue: number; orderCount: number }[];
}

export function HourlySalesChart({ data }: HourlySalesChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    saat: `${item.hour.toString().padStart(2, "0")}:00`,
    hour: item.hour,
    gelir: item.revenue,
    sipariş: item.orderCount,
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { saat: string; gelir: number; sipariş: number };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.saat}</p>
          <p className="text-sm text-muted-foreground">
            Gelir: {formatPrice(data.gelir)}
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
            <Clock className="h-5 w-5" />
            Saatlik Satışlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Henüz saatlik veri bulunamadı</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Saatlik Satışlar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="saat"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="gelir"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Gelir (₺)"
              />
              <Area
                type="monotone"
                dataKey="sipariş"
                stackId="2"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Sipariş Sayısı"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
