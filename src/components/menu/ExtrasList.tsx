"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";

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

  const getStatusBadge = (extra: Extra) => {
    if (extra._status === "new") {
      return (
        <Badge variant="default" className="bg-green-500">
          Yeni
        </Badge>
      );
    }
    if (extra._status === "modified") {
      return (
        <Badge variant="default" className="bg-blue-500">
          Değiştirildi
        </Badge>
      );
    }
    return null;
  };

  const getAvailabilityBadge = (extra: Extra) => {
    return extra.isAvailable ? (
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ekstralar</h3>
        <Button onClick={onAddExtra} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Ekstra
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
        <div className="menu-grid-compact">
          {visibleExtras.map((extra) => (
            <Card key={extra.id} className="menu-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{extra.name}</CardTitle>
                  <div className="flex gap-2">
                    {getStatusBadge(extra)}
                    {getAvailabilityBadge(extra)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {extra.price.toFixed(2)} ₺
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditExtra(extra)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteExtra(extra.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
