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
        <Badge variant="default" className="bg-green-500">
          Yeni
        </Badge>
      );
    }
    if (item._status === "modified") {
      return (
        <Badge variant="default" className="bg-blue-500">
          Değiştirildi
        </Badge>
      );
    }
    return null;
  };

  const getAvailabilityBadge = () => {
    return item.isAvailable ? (
      <Badge variant="outline" className="text-green-600 border-green-600">
        Müsait
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-600">
        Müsait Değil
      </Badge>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
          <div className="flex gap-2">
            {getStatusBadge()}
            {getAvailabilityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {item.price.toFixed(2)} ₺
            </span>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
