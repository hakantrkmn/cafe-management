"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRange } from "@/hooks/useReportsPage";
import { format } from "date-fns";
import { Calendar, Clock, RefreshCw } from "lucide-react";

interface ReportsFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  timeRange: { start: string; end: string };
  onTimeRangeChange: (timeRange: { start: string; end: string }) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ReportsFilters({
  dateRange,
  onDateRangeChange,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  isLoading,
}: ReportsFiltersProps) {
  const handleDateChange = (field: "from" | "to", value: string) => {
    const date = value ? new Date(value) : undefined;
    onDateRangeChange({
      ...dateRange,
      [field]: date,
    });
  };

  const handleTimeChange = (field: "start" | "end", value: string) => {
    onTimeRangeChange({
      ...timeRange,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtreler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Başlangıç Tarihi
            </Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
              onChange={(e) => handleDateChange("from", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              Bitiş Tarihi
            </Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
              onChange={(e) => handleDateChange("to", e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="startTime"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Başlangıç Saati
            </Label>
            <Input
              id="startTime"
              type="time"
              value={timeRange.start}
              onChange={(e) => handleTimeChange("start", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="endTime"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Bitiş Saati
            </Label>
            <Input
              id="endTime"
              type="time"
              value={timeRange.end}
              onChange={(e) => handleTimeChange("end", e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            className="h-9"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Yenile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
