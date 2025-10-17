"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { Table, TableStatus } from "@/types";
import { CreditCard, ShoppingCart, Table as TableIcon } from "lucide-react";

interface TableCardMobileProps {
  table: Table;
  status: TableStatus;
  orderCount: number;
  totalAmount: number;
  onClick: (tableId: string) => void;
}

export function TableCardMobile({
  table,
  status,
  orderCount,
  totalAmount,
  onClick,
}: TableCardMobileProps) {
  const getStatusColor = (status: TableStatus): string => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "has-orders":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: TableStatus): string => {
    switch (status) {
      case "available":
        return "Boş";
      case "occupied":
        return "Dolu";
      case "has-orders":
        return "Sipariş Var";
      default:
        return "Bilinmiyor";
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case "available":
        return <TableIcon className="h-4 w-4" />;
      case "occupied":
        return <TableIcon className="h-4 w-4" />;
      case "has-orders":
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <TableIcon className="h-4 w-4" />;
    }
  };

  return (
    <Card
      className={`
        p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${
          status === "available"
            ? "bg-white border-green-200 hover:border-green-300"
            : status === "occupied"
            ? "bg-yellow-50 border-yellow-200 hover:border-yellow-300"
            : "bg-blue-50 border-blue-200 hover:border-blue-300"
        }
      `}
      onClick={() => onClick(table.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getStatusIcon(status)}</div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{table.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`text-xs ${getStatusColor(status)}`}
              >
                {getStatusText(status)}
              </Badge>
              {orderCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {orderCount} sipariş
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {totalAmount > 0 && (
            <div className="text-right">
              <p className="font-semibold text-sm">
                {formatPrice(totalAmount)}
              </p>
              <p className="text-xs text-muted-foreground">Toplam</p>
            </div>
          )}

          {status === "has-orders" && (
            <div className="flex items-center gap-1 text-blue-600">
              <CreditCard className="h-3 w-3" />
              <span className="text-xs">Ödeme Bekliyor</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
