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
    <div className="flex items-center gap-3">
      {hasChanges && (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          Kaydedilmemiş değişiklikler
        </Badge>
      )}

      <Button
        onClick={onSave}
        disabled={!hasChanges || isLoading}
        className="min-w-[140px]"
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </Button>
    </div>
  );
}
