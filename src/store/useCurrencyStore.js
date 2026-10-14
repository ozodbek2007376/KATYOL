import { create } from 'zustand';
import { DEFAULT_CURRENCY_CODE } from '@/shared/currencies';
import { storageService } from '@/services/storage.service';

const getInitialCurrency = () => {
  return storageService.get('selected_currency') || DEFAULT_CURRENCY_CODE;
};

export const useCurrencyStore = create((set) => ({
  currency: getInitialCurrency(),

  setCurrency: (code) => {
    storageService.set('selected_currency', code);
    set({ currency: code });
  },
}));
