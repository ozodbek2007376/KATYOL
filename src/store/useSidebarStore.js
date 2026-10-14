import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  isCollapsed: true, // Compact by default as requested
  isMobileOpen: false,

  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  closeMobileSidebar: () => set({ isMobileOpen: false }),
}));
