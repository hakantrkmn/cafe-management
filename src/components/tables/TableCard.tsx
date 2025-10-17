"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Table as TableIcon, Trash2 } from "lucide-react";

interface TableCardProps {
  table: {
    id: string;
    name: string;
    isOccupied: boolean;
  };
  onEdit: (table: { id: string; name: string; isOccupied: boolean }) => void;
  onDelete: (table: { id: string; name: string; isOccupied: boolean }) => void;
  isLoading: boolean;
}

export function TableCard({
  table,
  onEdit,
  onDelete,
  isLoading,
}: TableCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TableIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-base">{table.name}</h3>
          </div>
          <Badge
            variant={table.isOccupied ? "destructive" : "secondary"}
            className="text-xs"
          >
            {table.isOccupied ? "Dolu" : "Boş"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(table)}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Düzenle</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(table)}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 sm:h-9 px-2 sm:px-3"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline ml-2">Sil</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
