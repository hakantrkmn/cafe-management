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
        <Badge variant="default" className="category-card-status-new">
          Yeni
        </Badge>
      );
    }
    if (category._status === "modified") {
      return (
        <Badge variant="default" className="category-card-status-modified">
          Değiştirildi
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        "category-card",
        isActive ? "category-card-active" : "category-card-inactive"
      )}
      onClick={onSelect}
    >
      <CardContent className="category-card-content">
        <div className="category-card-header">
          <div className="category-card-left">
            <h3 className="category-card-name">{category.name}</h3>
            <div className="category-card-info">
              {getStatusBadge(category)}
              <span className="category-card-order">
                Sıra: {category.order}
              </span>
            </div>
          </div>

          <div className="category-card-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="category-card-action-button category-card-edit-button"
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
              className="category-card-action-button category-card-delete-button"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
