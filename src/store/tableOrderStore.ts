import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TableOrderState {
  tableOrders: Record<string, string[]>; // { [cafeId]: tableId[] }
  setTableOrder: (cafeId: string, tableIds: string[]) => void;
  getTableOrder: (cafeId: string) => string[];
  clearTableOrder: (cafeId: string) => void;
  clearAllTableOrders: () => void;
}

export const useTableOrderStore = create<TableOrderState>()(
  persist(
    (set, get) => ({
      tableOrders: {},

      setTableOrder: (cafeId, tableIds) => {
        set((state) => ({
          tableOrders: {
            ...state.tableOrders,
            [cafeId]: tableIds,
          },
        }));
      },

      getTableOrder: (cafeId) => {
        return get().tableOrders[cafeId] || [];
      },

      clearTableOrder: (cafeId) => {
        set((state) => {
          const newTableOrders = { ...state.tableOrders };
          delete newTableOrders[cafeId];
          return { tableOrders: newTableOrders };
        });
      },

      clearAllTableOrders: () => {
        set({ tableOrders: {} });
      },
    }),
    {
      name: "cafe-table-orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
