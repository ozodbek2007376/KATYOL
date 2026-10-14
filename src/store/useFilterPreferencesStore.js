import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFilterPreferencesStore = create(
  persist(
    (set, get) => ({
      savedFilters: {},

      getSavedFilter: (filterKey, defaultValues = {}) => {
        const state = get();
        return state.savedFilters[filterKey] || defaultValues;
      },

      setSavedFilter: (filterKey, values) => {
        set((state) => ({
          savedFilters: {
            ...state.savedFilters,
            [filterKey]: values,
          },
        }));
      },

      clearSavedFilter: (filterKey) => {
        set((state) => {
          const newFilters = { ...state.savedFilters };
          delete newFilters[filterKey];
          return { savedFilters: newFilters };
        });
      },
    }),
    {
      name: 'kotyol_erp_filter_preferences',
    }
  )
);
