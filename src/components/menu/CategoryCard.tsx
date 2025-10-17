"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  order: number;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
  _status?: "new" | "modified" | "deleted";
}

interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onSelect: () => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryCard({
  category,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const getStatusBadge = (category: Category) => {
    if (category._status === "new") {
      return (
        <Badge variant="default" className="bg-green-500 text-xs">
          Yeni
        </Badge>
      );
    }
    if (category._status === "modified") {
      return (
        <Badge variant="default" className="bg-blue-500 text-xs">
          Değiştirildi
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isActive ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate">
              {category.name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
              {getStatusBadge(category)}
              <span className="text-xs text-muted-foreground">
                Sıra: {category.order}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-muted"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.id);
              }}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
