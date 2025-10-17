"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { OrderWithRelations, Table, TablePosition, TableStatus } from "@/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
} from "@dnd-kit/core";
import { Edit3, Move, Table as TableIcon } from "lucide-react";
import { useState } from "react";
import { TableCardMobile } from "./TableCardMobile";

// Draggable Table Component
function DraggableTable({
  table,
  position,
  status,
  editMode,
  onTableClick,
  getStatusColor,
  getStatusText,
}: {
  table: Table;
  position: TablePosition;
  status: TableStatus;
  editMode: boolean;
  onTableClick: (tableId: string) => void;
  getStatusColor: (status: TableStatus) => string;
  getStatusText: (status: TableStatus) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: table.id,
      disabled: !editMode,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={{
        ...style,
        left: position.x,
        top: position.y,
      }}
      className={`
        absolute w-20 h-20 cursor-pointer transition-all duration-200
        ${editMode ? "cursor-move hover:shadow-lg" : "hover:shadow-md"}
        ${
          status === "available"
            ? "bg-white border-green-200 hover:border-green-300"
            : status === "occupied"
            ? "bg-yellow-50 border-yellow-200 hover:border-yellow-300"
            : "bg-blue-50 border-blue-200 hover:border-blue-300"
        }
        ${isDragging ? "opacity-50" : ""}
      `}
      onClick={() => !editMode && onTableClick(table.id)}
      {...(editMode ? { ...attributes, ...listeners } : {})}
    >
      <div className="flex flex-col items-center justify-center h-full p-2">
        <TableIcon className="h-6 w-6 mb-1" />
        <span className="text-xs font-medium text-center leading-tight">
          {table.name}
        </span>
        <Badge
          variant="secondary"
          className={`text-xs mt-1 ${getStatusColor(status)}`}
        >
          {getStatusText(status)}
        </Badge>
      </div>
    </Card>
  );
}

interface TableLayoutEditorProps {
  tables: Table[];
  getTablePosition: (tableId: string) => TablePosition;
  updateTablePosition: (tableId: string, x: number, y: number) => void;
  getTableStatus: (table: Table) => TableStatus;
  onTableClick: (tableId: string) => void;
  editMode: boolean;
  onEditModeToggle: () => void;
  orders: OrderWithRelations[]; // For calculating order counts and totals
}

export function TableLayoutEditor({
  tables,
  getTablePosition,
  updateTablePosition,
  getTableStatus,
  onTableClick,
  editMode,
  onEditModeToggle,
  orders,
}: TableLayoutEditorProps) {
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const isDesktop = useIsDesktop();

  const handleDragStart = (event: DragStartEvent) => {
    if (!editMode) return;

    const tableId = event.active.id as string;
    const table = tables.find((t) => t.id === tableId);
    setDraggedTable(table || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!editMode || !draggedTable) return;

    const { active, over } = event;

    if (active.id !== over?.id) {
      const currentPosition = getTablePosition(draggedTable.id);
      const delta = event.delta;

      const newX = Math.max(0, currentPosition.x + delta.x);
      const newY = Math.max(0, currentPosition.y + delta.y);

      updateTablePosition(draggedTable.id, newX, newY);
    }

    setDraggedTable(null);
  };

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

  // Helper function to get table order info
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Masa Düzeni</h2>
          <p className="text-muted-foreground">
            Masaları sürükleyerek düzenleyebilir veya tıklayarak sipariş
            ekleyebilirsiniz
          </p>
        </div>
        <Button
          variant={editMode ? "default" : "outline"}
          onClick={onEditModeToggle}
          className="flex items-center gap-2"
        >
          {editMode ? (
            <>
              <Edit3 className="h-4 w-4" />
              Düzenleme Modu
            </>
          ) : (
            <>
              <Move className="h-4 w-4" />
              Düzenle
            </>
          )}
        </Button>
      </div>

      {/* Desktop: Drag & Drop Canvas */}
      {isDesktop && (
        <div className="relative">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="relative w-full h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              {tables.map((table) => {
                const position = getTablePosition(table.id);
                const status = getTableStatus(table);

                return (
                  <DraggableTable
                    key={table.id}
                    table={table}
                    position={position}
                    status={status}
                    editMode={editMode}
                    onTableClick={onTableClick}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {draggedTable ? (
                <Card className="w-20 h-20 bg-blue-100 border-blue-300 shadow-lg">
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <TableIcon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium text-center leading-tight">
                      {draggedTable.name}
                    </span>
                  </div>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Mobile: List View */}
      {!isDesktop && (
        <div className="space-y-2">
          {tables.map((table) => {
            const status = getTableStatus(table);
            const { orderCount, totalAmount } = getTableOrderInfo(table.id);

            return (
              <TableCardMobile
                key={table.id}
                table={table}
                status={status}
                orderCount={orderCount}
                totalAmount={totalAmount}
                onClick={onTableClick}
              />
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
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
