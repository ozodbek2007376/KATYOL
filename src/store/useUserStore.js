import { create } from 'zustand';
import { UserRole } from '@/shared/enums';

export const useUserStore = create((set) => ({
  user: {
    id: 'usr_admin_01',
    name: 'Alex Vance',
    email: 'alex.vance@kotyol.com',
    role: UserRole.SUPER_ADMIN,
    department: 'Executive Operations',
    avatar: null,
  },

  setUser: (userData) => set({ user: userData }),
  updateUserProfile: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
    })),
  clearUser: () => set({ user: null }),
}));
