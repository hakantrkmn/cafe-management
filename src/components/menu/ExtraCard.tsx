"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

interface Extra {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
}

interface ExtraCardProps {
  extra: Extra;
  onEdit: (extra: Extra) => void;
  onDelete: (extraId: string) => void;
}

export function ExtraCard({ extra, onEdit, onDelete }: ExtraCardProps) {
  const getStatusBadge = () => {
    if (extra._status === "new") {
      return (
        <Badge variant="default" className="extra-status-new">
          Yeni
        </Badge>
      );
    }
    if (extra._status === "modified") {
      return (
        <Badge variant="default" className="extra-status-modified">
          Değiştirildi
        </Badge>
      );
    }
    return null;
  };

  const getAvailabilityBadge = () => {
    return extra.isAvailable ? (
      <Badge variant="outline" className="extra-availability-available">
        Müsait
      </Badge>
    ) : (
      <Badge variant="outline" className="extra-availability-unavailable">
        Müsait Değil
      </Badge>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm sm:text-base">{extra.name}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            {getStatusBadge()}
            {getAvailabilityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-bold text-primary">
              {extra.price.toFixed(2)} ₺
            </span>
          </div>

          <div className="extra-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(extra)}
              className="extra-edit-button"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Düzenle</span>
              <span className="sm:hidden">Düzenle</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(extra.id)}
              className="extra-delete-button"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-2">Sil</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
