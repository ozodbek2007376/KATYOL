import { create } from 'zustand';
import { tokenService } from '@/api/tokenService';
import { authApi } from '@/features/auth/api/authApi';
import { setActiveCurrency } from '@/utils/currency.utils';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user_profile') || 'null');
  } catch {
    return null;
  }
};

const initialUser = tokenService.getAccessToken() ? getStoredUser() : null;

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  accessToken: tokenService.getAccessToken(),
  refreshToken: tokenService.getRefreshToken(),
  role: initialUser ? initialUser.roleCode : null,
  permissions: initialUser ? initialUser.permissions : [],
  isAuthenticated: !!tokenService.getAccessToken(),
  isLoading: false,

  setLoading: (isLoading) => set({ isLoading }),

  setAuthTokens: (accessToken, refreshToken) => {
    tokenService.setTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: !!accessToken });
  },

  login: async ({ username, password, rememberMe }) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ username, password, rememberMe });
      tokenService.setTokens(response.accessToken, response.refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(response.user));
      if (response.user?.currency) {
        setActiveCurrency(response.user.currency);
      }

      set({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        role: response.user.roleCode,
        permissions: response.user.permissions,
        isLoading: false,
      });

      return response;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginWithoutBackend: () => {
    const demoUser = {
      id: 1,
      username: '+998901234567',
      name: 'Admin Foydalanuvchi',
      full_name: 'Admin Foydalanuvchi',
      email: 'admin@kotyol.uz',
      phone: '+998901234567',
      role: 'ADMIN',
      roleCode: 'ADMIN',
      department: 'Boshqaruv',
      organizationName: 'Kotyol Zavodi (Demo)',
      organization_name: 'Kotyol Zavodi (Demo)',
      branchName: 'Bosh filial',
      branch_name: 'Bosh filial',
      organization_id: 1,
      branch_id: 1,
      permissions: [
        'MANAGE_USERS',
        'VIEW_FINANCE',
        'MANAGE_PRODUCTION',
        'MANAGE_WAREHOUSE',
        'MANAGE_SALES',
        'VIEW_REPORTS',
      ],
      status: 'ACTIVE',
      currency: 'UZS',
    };

    const token = 'demo_access_token_' + Date.now();
    const refreshToken = 'demo_refresh_token_' + Date.now();

    tokenService.setTokens(token, refreshToken);
    localStorage.setItem('user_profile', JSON.stringify(demoUser));
    localStorage.setItem('active_branch_id', '1');
    localStorage.setItem('is_demo_mode', 'true');
    setActiveCurrency('UZS');

    set({
      isAuthenticated: true,
      user: demoUser,
      accessToken: token,
      refreshToken: refreshToken,
      role: 'ADMIN',
      permissions: demoUser.permissions,
      isLoading: false,
    });

    return { success: true, user: demoUser };
  },

  logout: async () => {
    try {
      if (localStorage.getItem('is_demo_mode') !== 'true') {
        await authApi.logout();
      }
    } catch {
      // Ignore logout API failures
    } finally {
      tokenService.clearTokens();
      localStorage.removeItem('user_profile');
      localStorage.removeItem('is_demo_mode');
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        role: null,
        permissions: [],
        isLoading: false,
      });
    }
  },

  updateUserProfile: (updates) =>
    set((state) => {
      const newUser = state.user ? { ...state.user, ...updates } : null;
      if (newUser) {
        localStorage.setItem('user_profile', JSON.stringify(newUser));
      }
      return { user: newUser };
    }),
}));
