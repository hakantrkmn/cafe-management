"use client";

import { useAuth } from "@/queries/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ReportsData, useReportsData } from "./useReportsData";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface TimeRange {
  start: string;
  end: string;
}

export function useReportsPage() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    isManager,
    user,
  } = useAuth();
  const router = useRouter();

  // Date and time filters
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    to: new Date(),
  });

  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: "00:00",
    end: "23:59",
  });

  const cafeId = user?.cafeId || user?.managedCafe?.id || null;

  // Reports data hook
  const {
    data: reportsData,
    isLoading: reportsLoading,
    refetch,
  } = useReportsData({
    cafeId: cafeId || "",
    dateRange,
    timeRange,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  // Refresh data
  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // Auth state
    isAuthenticated,
    isLoading: authLoading || reportsLoading,
    isManager,
    hasCafe: !!cafeId,

    // Data
    reportsData:
      reportsData ||
      ({
        summary: {
          totalOrders: 0,
          totalRevenue: 0,
          totalTables: 0,
          averageOrderValue: 0,
        },
        orders: [],
        topProducts: [],
        tableStats: [],
        campaignStats: [],
        chartData: {
          hourlyRevenue: [],
          dailyRevenue: [],
          categoryDistribution: [],
          paymentStatus: [],
        },
      } as ReportsData),

    // Filters
    dateRange,
    setDateRange,
    timeRange,
    setTimeRange,

    // Actions
    refreshData,
  };
}
