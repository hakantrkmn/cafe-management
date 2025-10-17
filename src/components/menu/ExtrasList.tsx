"use client";

import { ExtraCard } from "@/components/menu/ExtraCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

interface ExtrasListProps {
  extras: Extra[];
  onAddExtra: () => void;
  onEditExtra: (extra: Extra) => void;
  onDeleteExtra: (extraId: string) => void;
}

export function ExtrasList({
  extras,
  onAddExtra,
  onEditExtra,
  onDeleteExtra,
}: ExtrasListProps) {
  // Filter out deleted extras
  const visibleExtras = extras.filter((extra) => extra._status !== "deleted");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-semibold">Ekstralar</h3>
        <Button onClick={onAddExtra} size="sm" className="w-full sm:w-auto">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="text-sm">Yeni Ekstra</span>
        </Button>
      </div>

      {visibleExtras.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Henüz ekstra yok.</p>
          <p className="text-sm">
            Yeni ekstra eklemek için yukarıdaki butonu kullanın.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleExtras.map((extra) => (
            <ExtraCard
              key={extra.id}
              extra={extra}
              onEdit={onEditExtra}
              onDelete={onDeleteExtra}
            />
          ))}
        </div>
      )}
    </div>
  );
}
