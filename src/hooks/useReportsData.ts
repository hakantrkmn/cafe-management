"use client";

import { QueryKeys } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { DateRange, TimeRange } from "./useReportsPage";

export interface ReportsProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ReportsOrder {
  id: string;
  tableName: string;
  createdAt: Date;
  totalAmount: number;
  isPaid: boolean;
  products: ReportsProduct[];
}

export interface ReportsTopProduct {
  id: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

export interface ReportsTableStat {
  tableId: string;
  tableName: string;
  orderCount: number;
  totalRevenue: number;
}

export interface ReportsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalTables: number;
  averageOrderValue: number;
}

export interface ReportsData {
  summary: ReportsSummary;
  orders: ReportsOrder[];
  topProducts: ReportsTopProduct[];
  tableStats: ReportsTableStat[];
}

// API functions
const reportsApi = {
  getReports: async (
    cafeId: string,
    dateRange: DateRange,
    timeRange: TimeRange
  ): Promise<ReportsData> => {
    const params = new URLSearchParams();

    if (dateRange.from) {
      params.append("startDate", dateRange.from.toISOString());
    }
    if (dateRange.to) {
      params.append("endDate", dateRange.to.toISOString());
    }
    if (timeRange.start) {
      params.append("startTime", timeRange.start);
    }
    if (timeRange.end) {
      params.append("endTime", timeRange.end);
    }

    const response = await fetch(
      `/api/cafes/${cafeId}/reports?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Rapor verileri alınamadı");
    }

    const result = await response.json();
    return result.data;
  },
};

// Hook
export function useReportsData({
  cafeId,
  dateRange,
  timeRange,
}: {
  cafeId: string;
  dateRange: DateRange;
  timeRange: TimeRange;
}) {
  return useQuery({
    queryKey: QueryKeys.reports(cafeId, dateRange, timeRange),
    queryFn: () => reportsApi.getReports(cafeId, dateRange, timeRange),
    enabled: !!cafeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
