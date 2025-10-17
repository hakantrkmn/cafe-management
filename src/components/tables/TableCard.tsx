"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TableIcon className="h-5 w-5" />
          <h3 className="font-medium">{table.name}</h3>
        </div>
        <Badge variant={table.isOccupied ? "destructive" : "secondary"}>
          {table.isOccupied ? "Dolu" : "Boş"}
        </Badge>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(table)}
          disabled={isLoading}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(table)}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
