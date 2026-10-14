import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFormDraftStore = create(
  persist(
    (set, get) => ({
      drafts: {},

      saveDraft: (formKey, data) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [formKey]: {
              data,
              timestamp: new Date().toISOString(),
            },
          },
        })),

      getDraft: (formKey) => {
        const entry = get().drafts[formKey];
        return entry ? entry.data : null;
      },

      clearDraft: (formKey) =>
        set((state) => {
          const updated = { ...state.drafts };
          delete updated[formKey];
          return { drafts: updated };
        }),
    }),
    {
      name: 'kotyol_form_drafts',
    }
  )
);
