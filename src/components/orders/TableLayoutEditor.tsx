"use client";

import { Badge } from "@/components/ui/badge";
import { OrderWithRelations, Table, TableStatus } from "@/types";
import { Table as TableIcon } from "lucide-react";

interface TableLayoutEditorProps {
  tables: Table[];
  getTableStatus: (table: Table) => TableStatus;
  onTableClick: (tableId: string) => void;
  orders: OrderWithRelations[];
}

export function TableLayoutEditor({
  tables,
  getTableStatus,
  onTableClick,
  orders,
}: TableLayoutEditorProps) {
  const getStatusColor = (status: TableStatus): string => {
    switch (status) {
      case "available":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800";
      case "occupied":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800";
      case "has-orders":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800";
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

  const getTableOrderInfo = (tableId: string) => {
    const tableOrders = orders.filter(
      (order: OrderWithRelations) => order.tableId === tableId && !order.isPaid
    );
    const orderCount = tableOrders.length;
    const totalAmount = tableOrders.reduce(
      (sum: number, order: OrderWithRelations) =>
        sum + (order.totalAmount || 0),
      0
    );
    return { orderCount, totalAmount };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Masalar</h2>
        <p className="text-muted-foreground">
          Siparişleri yönetmek için bir masa seçin
        </p>
      </div>

      {/* Table List */}
      <div className="orders-table-list">
        {tables.map((table) => {
          const status = getTableStatus(table);
          const { orderCount, totalAmount } = getTableOrderInfo(table.id);

          return (
            <div
              key={table.id}
              onClick={() => onTableClick(table.id)}
              className="orders-table-item"
            >
              <div className="orders-table-item-header">
                <div className="flex items-center gap-3">
                  <div className="orders-table-item-icon">
                    <TableIcon className="h-5 w-5" />
                  </div>
                  <div className="orders-table-item-content">
                    <h3 className="orders-table-item-name">{table.name}</h3>
                    <Badge className={getStatusColor(status)}>
                      {getStatusText(status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {orderCount > 0 && (
                <div className="orders-table-item-orders">
                  <div className="orders-table-item-stat">
                    <span className="text-xs text-muted-foreground">
                      Siparişler
                    </span>
                    <span className="font-semibold">{orderCount}</span>
                  </div>
                  <div className="orders-table-item-stat">
                    <span className="text-xs text-muted-foreground">
                      Toplam
                    </span>
                    <span className="font-semibold">
                      {totalAmount.toFixed(2)} ₺
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tables.length === 0 && (
        <div className="text-center py-12">
          <TableIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Henüz masa oluşturulmadı</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Boş</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>Dolu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          <span>Sipariş Var</span>
        </div>
      </div>
    </div>
  );
}
