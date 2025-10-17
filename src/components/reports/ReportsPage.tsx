"use client";

import { useReportsPage } from "@/hooks/useReportsPage";
import { Loader2 } from "lucide-react";
import { ReportsFilters } from "./ReportsFilters";
import { ReportsSummary } from "./ReportsSummary";
import { ReportsTable } from "./ReportsTable";

export function ReportsPage() {
  const {
    // Loading states
    isLoading,
    isAuthenticated,
    hasCafe,

    // Data
    reportsData,

    // Filters
    dateRange,
    setDateRange,
    timeRange,
    setTimeRange,

    // Actions
    refreshData,
  } = useReportsPage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  if (!hasCafe) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Kafe bilgisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Kafenizle ilgili detaylı analiz ve raporlar
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={refreshData}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <ReportsSummary data={reportsData} />

      {/* Detailed Table */}
      <ReportsTable data={reportsData} />
    </div>
  );
}
