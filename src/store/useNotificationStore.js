import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  isDrawerOpen: false,
  unreadCount: 3,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setUnreadCount: (count) => set({ unreadCount: count }),

  addNotification: ({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    set((state) => ({
      notifications: [...state.notifications, { id, type, title, message }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));
