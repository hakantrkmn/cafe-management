"use client";

import {
  OrderWithRelations,
  Table,
  TableLayout,
  TablePosition,
  TableStatus,
} from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseTableManagementReturn {
  tableLayout: TableLayout;
  editMode: boolean;
  getTablePosition: (tableId: string) => TablePosition;
  updateTablePosition: (tableId: string, x: number, y: number) => void;
  getTableStatus: (table: Table) => TableStatus;
  handleTableClick: (tableId: string) => void;
  setEditMode: (mode: boolean) => void;
}

interface UseTableManagementProps {
  cafeId: string | null;
  orders: OrderWithRelations[];
  onTableSelect?: (tableId: string) => void;
}

export function useTableManagement({
  cafeId,
  orders,
  onTableSelect,
}: UseTableManagementProps): UseTableManagementReturn {
  const [editMode, setEditMode] = useState(false);
  const [tableLayout, setTableLayout] = useState<TableLayout>({});

  // Load table layout from localStorage
  useEffect(() => {
    if (cafeId) {
      const savedLayout = localStorage.getItem(`tablePositions-${cafeId}`);
      if (savedLayout) {
        try {
          setTableLayout(JSON.parse(savedLayout));
        } catch (error) {
          console.error("Error loading table layout:", error);
        }
      }
    }
  }, [cafeId]);

  // Save table layout to localStorage
  const saveTableLayout = useCallback(
    (layout: TableLayout) => {
      if (cafeId) {
        localStorage.setItem(
          `tablePositions-${cafeId}`,
          JSON.stringify(layout)
        );
        setTableLayout(layout);
      }
    },
    [cafeId]
  );

  // Get table position or default
  const getTablePosition = useCallback(
    (tableId: string): TablePosition => {
      return (
        tableLayout[tableId] || {
          id: tableId,
          x: Math.random() * 400,
          y: Math.random() * 300,
        }
      );
    },
    [tableLayout]
  );

  // Update table position
  const updateTablePosition = useCallback(
    (tableId: string, x: number, y: number) => {
      const newLayout = {
        ...tableLayout,
        [tableId]: { id: tableId, x, y },
      };
      saveTableLayout(newLayout);
    },
    [tableLayout, saveTableLayout]
  );

  // Get table status
  const getTableStatus = useCallback(
    (table: Table): TableStatus => {
      const tableOrders = orders.filter(
        (order: OrderWithRelations) =>
          order.tableId === table.id && !order.isPaid
      );

      if (tableOrders.length > 0) {
        return "has-orders";
      }

      return table.isOccupied ? "occupied" : "available";
    },
    [orders]
  );

  // Handle table click
  const handleTableClick = useCallback(
    (tableId: string) => {
      if (editMode) return; // Don't open dialog in edit mode

      onTableSelect?.(tableId);
    },
    [editMode, onTableSelect]
  );

  return {
    tableLayout,
    editMode,
    getTablePosition,
    updateTablePosition,
    getTableStatus,
    handleTableClick,
    setEditMode,
  };
}
