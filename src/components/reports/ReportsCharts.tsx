"use client";

import { ReportsData } from "@/hooks/useReportsData";
import { CategoryDistributionChart } from "./charts/CategoryDistributionChart";
import { HourlySalesChart } from "./charts/HourlySalesChart";
import { PaymentStatusChart } from "./charts/PaymentStatusChart";
import { ProductSalesChart } from "./charts/ProductSalesChart";
import { SalesTrendChart } from "./charts/SalesTrendChart";
import { TablePerformanceChart } from "./charts/TablePerformanceChart";

interface ReportsChartsProps {
  data: ReportsData;
}

export function ReportsCharts({ data }: ReportsChartsProps) {
  const { chartData, topProducts, tableStats } = data;

  return (
    <div className="space-y-6">
      {/* Top Row - Product Sales and Sales Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProductSalesChart data={topProducts} />
        <SalesTrendChart data={chartData.dailyRevenue} />
      </div>

      {/* Second Row - Category Distribution and Payment Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CategoryDistributionChart data={chartData.categoryDistribution} />
        <PaymentStatusChart data={chartData.paymentStatus} />
      </div>

      {/* Third Row - Hourly Sales and Table Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <HourlySalesChart data={chartData.hourlyRevenue} />
        <TablePerformanceChart data={tableStats} />
      </div>
    </div>
  );
}
