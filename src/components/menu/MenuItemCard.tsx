"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isAvailable: boolean;
  categoryId: string;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

export function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
  const getStatusBadge = () => {
    if (item._status === "new") {
      return (
        <Badge variant="default" className="menu-item-status-new">
          Yeni
        </Badge>
      );
    }
    if (item._status === "modified") {
      return (
        <Badge variant="default" className="menu-item-status-modified">
          Değiştirildi
        </Badge>
      );
    }
    return null;
  };

  const getAvailabilityBadge = () => {
    return item.isAvailable ? (
      <Badge variant="outline" className="menu-item-availability-available">
        Müsait
      </Badge>
    ) : (
      <Badge variant="outline" className="menu-item-availability-unavailable">
        Müsait Değil
      </Badge>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base sm:text-lg leading-tight">
            {item.name}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            {getStatusBadge()}
            {getAvailabilityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {item.price.toFixed(2)} ₺
            </span>
          </div>

          {item.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="menu-item-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
              className="menu-item-edit-button"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Düzenle</span>
              <span className="sm:hidden">Düzenle</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="menu-item-delete-button"
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
