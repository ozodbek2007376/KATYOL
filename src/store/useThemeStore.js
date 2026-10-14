import { create } from 'zustand';
import { storageService } from '@/services/storage.service';

const getInitialTheme = () => {
  const saved = storageService.get('theme');
  return saved || 'light';
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      storageService.set('theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { theme: nextTheme };
    }),

  setTheme: (newTheme) => {
    storageService.set('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },
}));
