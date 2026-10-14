import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserPreferencesStore = create(
  persist(
    (set, get) => ({
      pageSize: 10,
      tableColumns: {},
      lastWarehouseId: '',
      lastCurrency: 'USD',
      lastFilters: {},

      setPageSize: (size) => set({ pageSize: size }),

      setTableColumns: (tableKey, hiddenColumns) =>
        set((state) => ({
          tableColumns: {
            ...state.tableColumns,
            [tableKey]: hiddenColumns,
          },
        })),

      setLastWarehouseId: (warehouseId) => set({ lastWarehouseId: warehouseId }),

      setLastCurrency: (currency) => set({ lastCurrency: currency }),

      setModuleFilters: (moduleKey, filters) =>
        set((state) => ({
          lastFilters: {
            ...state.lastFilters,
            [moduleKey]: filters,
          },
        })),

      getTableHiddenColumns: (tableKey) => get().tableColumns[tableKey] || [],
    }),
    {
      name: 'kotyol_user_preferences',
    }
  )
);
