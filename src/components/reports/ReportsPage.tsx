"use client";

import { usePageLoading } from "@/hooks/usePageLoading";
import { useReportsPage } from "@/hooks/useReportsPage";
import { CampaignStatsTable } from "./CampaignStatsTable";
import { ReportsCharts } from "./ReportsCharts";
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

  // Auto page loading
  usePageLoading(isLoading, {
    loadingText: "Raporlar yükleniyor...",
    delay: 200,
    minDuration: 800,
  });

  // Loading is now handled by usePageLoading hook

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Bu sayfaya erişim yetkiniz yok.
          </p>
        </div>
      </div>
    );
  }

  if (!hasCafe) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Kafe bilgisi bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
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

        {/* Charts */}
        <ReportsCharts data={reportsData} />

        {/* Campaign Statistics */}
        <CampaignStatsTable data={reportsData} />

        {/* Detailed Table */}
        <ReportsTable data={reportsData} />
      </div>
    </div>
  );
}
