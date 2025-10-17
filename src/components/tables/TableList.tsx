"use client";

import { Table as TableIcon } from "lucide-react";
import { TableCard } from "./TableCard";

interface TableListProps {
  tables: Array<{
    id: string;
    name: string;
    isOccupied: boolean;
  }>;
  onEdit: (table: { id: string; name: string }) => void;
  onDelete: (table: { id: string; name: string; isOccupied: boolean }) => void;
  isLoading: boolean;
}

export function TableList({
  tables,
  onEdit,
  onDelete,
  isLoading,
}: TableListProps) {
  if (tables.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <TableIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Henüz masa eklenmemiş</p>
        <p className="text-sm">
          Yukarıdaki &quot;Masa Ekle&quot; butonunu kullanarak ilk masanızı
          ekleyin
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
