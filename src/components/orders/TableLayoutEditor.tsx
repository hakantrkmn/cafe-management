"use client";

import { useConfirmationModal } from "@/components/providers/ConfirmationModalProvider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { OrderWithRelations, Table, TableStatus } from "@/types";
import { ArrowRightLeft, GripVertical, Table as TableIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";

interface TableLayoutEditorProps {
  tables: Table[];
  getTableStatus: (table: Table) => TableStatus;
  onTableClick: (tableId: string) => void;
  orders: OrderWithRelations[];
  onTransferOrder?: (sourceTableId: string, targetTableId: string) => void;
  availableTables?: Table[];
  isSaving?: boolean;
  onTableOrderChange?: (tableIds: string[]) => void;
}

export function TableLayoutEditor({
  tables,
  getTableStatus,
  onTableClick,
  orders,
  onTransferOrder,
  availableTables = [],
  isSaving = false,
  onTableOrderChange,
}: TableLayoutEditorProps) {
  const { showConfirmation } = useConfirmationModal();
  const isMobile = useIsMobile();
  const [selectedTransferTable, setSelectedTransferTable] = useState<
    Record<string, string>
  >({});
  const [sortableTables, setSortableTables] = useState<Table[]>([]);

  // Update sortableTables when tables prop changes
  useEffect(() => {
    setSortableTables(tables);
  }, [tables]);

  // Get current order number for a table (1-based index)
  const getCurrentOrderNumber = (tableId: string): number => {
    const index = sortableTables.findIndex((table) => table.id === tableId);
    return index + 1; // Convert to 1-based index
  };

  // Handle table order number change
  const handleTableOrderNumberChange = (
    tableId: string,
    newOrderNumber: number
  ) => {
    // Validate input
    if (
      !newOrderNumber ||
      newOrderNumber < 1 ||
      newOrderNumber > sortableTables.length
    ) {
      return;
    }

    // Convert to 0-based index
    const newIndex = newOrderNumber - 1;
    const currentIndex = sortableTables.findIndex(
      (table) => table.id === tableId
    );

    // If the position hasn't changed, do nothing
    if (currentIndex === newIndex) {
      return;
    }

    // Create new array with reordered tables
    const newTables = [...sortableTables];
    const [movedTable] = newTables.splice(currentIndex, 1);
    newTables.splice(newIndex, 0, movedTable);

    // Update local state
    setSortableTables(newTables);

    // Notify parent component
    if (onTableOrderChange) {
      const tableIds = newTables.map((table) => table.id);
      onTableOrderChange(tableIds);
    }
  };
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
      <ReactSortable
        list={sortableTables.map((table) => ({
          sortableId: table.id,
          ...table,
        }))}
        setList={(newList) => {
          console.log("New list from sortable:", newList);

          // Ignore empty arrays - this happens during initialization
          if (newList.length === 0) {
            console.log("Ignoring empty list");
            return;
          }

          const newTables = newList
            .map((item) => {
              const originalTable = sortableTables.find(
                (t) => t.id === item.sortableId
              );
              return originalTable || item;
            })
            .filter((item): item is Table => "id" in item && "name" in item);

          console.log("New tables after mapping:", newTables);
          setSortableTables(newTables);

          if (onTableOrderChange) {
            const tableIds = newTables.map((table) => table.id);
            console.log("Calling onTableOrderChange with:", tableIds);
            onTableOrderChange(tableIds);
          }
        }}
        animation={150}
        ghostClass="sortable-ghost"
        handle=".orders-table-drag-handle"
        disabled={isSaving || isMobile}
        className="orders-table-list"
        forceFallback={false}
        fallbackTolerance={0}
        swapThreshold={0.65}
        touchStartThreshold={1}
        delay={0}
      >
        {sortableTables.map((table) => {
          const status = getTableStatus(table);
          const { orderCount, totalAmount } = getTableOrderInfo(table.id);

          return (
            <div
              key={table.id}
              data-id={table.id}
              className="orders-table-item cursor-pointer"
              onClick={() => onTableClick(table.id)}
            >
              <div className="orders-table-item-header">
                <div className="flex items-center gap-3">
                  {/* Drag Handle - Only show on desktop */}
                  {!isMobile && (
                    <div className="orders-table-drag-handle cursor-grab active:cursor-grabbing select-none">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

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

                <div className="flex items-center gap-2">
                  {/* Order Number Input - Only show on mobile */}
                  {isMobile && (
                    <div
                      className="orders-table-order-input"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="number"
                        min="1"
                        max={sortableTables.length}
                        value={getCurrentOrderNumber(table.id)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            handleTableOrderNumberChange(table.id, value);
                          }
                        }}
                        className="w-16 h-8 text-xs text-center"
                        placeholder="Sıra"
                      />
                    </div>
                  )}

                  {/* Transfer Button - Only show for tables with orders */}
                  {orderCount > 0 &&
                    onTransferOrder &&
                    availableTables.length > 0 && (
                      <div
                        className="orders-table-transfer-button"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Select
                          value={selectedTransferTable[table.id] || ""}
                          onValueChange={async (targetTableId) => {
                            // Set the selected value first
                            setSelectedTransferTable((prev) => ({
                              ...prev,
                              [table.id]: targetTableId,
                            }));

                            const targetTable = availableTables.find(
                              (t) => t.id === targetTableId
                            );

                            if (targetTable) {
                              const confirmed = await showConfirmation({
                                title: "Siparişi Taşı",
                                description: `${table.name} masasındaki siparişleri ${targetTable.name} masasına taşımak istediğinizden emin misiniz?`,
                                confirmText: "Taşı",
                                cancelText: "İptal",
                                variant: "warning",
                                onConfirm: () => {
                                  onTransferOrder(table.id, targetTableId);
                                  // Clear selection after successful transfer
                                  setSelectedTransferTable((prev) => ({
                                    ...prev,
                                    [table.id]: "",
                                  }));
                                },
                              });

                              // Reset dropdown if user cancelled
                              if (!confirmed) {
                                setSelectedTransferTable((prev) => ({
                                  ...prev,
                                  [table.id]: "",
                                }));
                              }
                            }
                          }}
                          disabled={isSaving}
                        >
                          <SelectTrigger className="w-fit h-8 text-xs">
                            <ArrowRightLeft className="h-3 w-3 mr-1" />
                            <SelectValue placeholder="Taşı" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTables
                              .filter(
                                (targetTable) => targetTable.id !== table.id
                              )
                              .map((targetTable) => (
                                <SelectItem
                                  key={targetTable.id}
                                  value={targetTable.id}
                                >
                                  {targetTable.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
      </ReactSortable>

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
