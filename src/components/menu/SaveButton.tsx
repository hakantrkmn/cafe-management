"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save } from "lucide-react";

interface SaveButtonProps {
  hasChanges: boolean;
  isLoading: boolean;
  onSave: () => void;
}

export function SaveButton({ hasChanges, isLoading, onSave }: SaveButtonProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      {hasChanges && (
        <Badge
          variant="outline"
          className="text-orange-600 border-orange-600 text-xs"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Kaydedilmemiş değişiklikler</span>
          <span className="sm:hidden">Kaydedilmemiş</span>
        </Badge>
      )}

      <Button
        onClick={onSave}
        disabled={!hasChanges || isLoading}
        className="min-w-[120px] sm:min-w-[140px] w-full sm:w-auto"
        size="sm"
      >
        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="text-xs sm:text-sm">
          {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </span>
      </Button>
    </div>
  );
}
