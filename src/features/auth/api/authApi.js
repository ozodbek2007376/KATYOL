import { axiosInstance } from '@/api/axiosInstance';

export const authApi = {
  login: async ({ username, password }) => {
    if (!username || !password) {
      throw new Error('Foydalanuvchi nomi va parol kiritilishi shart');
    }

    const response = await axiosInstance.post('/auth/login', { username, password });
    const backendData = response.data;
    
    const role = backendData.user.role;
    let permissions = [];
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      permissions = [
        'MANAGE_USERS',
        'VIEW_FINANCE',
        'MANAGE_PRODUCTION',
        'MANAGE_WAREHOUSE',
        'MANAGE_SALES',
        'VIEW_REPORTS',
      ];
    } else if (role === 'PRODUCTION_OPERATOR') {
      permissions = ['MANAGE_PRODUCTION'];
    } else if (role === 'WAREHOUSE_KEEPER') {
      permissions = ['MANAGE_WAREHOUSE'];
    } else {
      permissions = ['VIEW_REPORTS'];
    }

    const user = {
      id: backendData.user.id,
      username: backendData.user.username || username,
      name: backendData.user.full_name,
      email: backendData.user.email,
      phone: backendData.user.phone || username,
      role: role,
      roleCode: role,
      department: backendData.user.department || 'Boshqaruv',
      organizationName: backendData.user.organization_name,
      branchName: backendData.user.branch_name,
      organization_id: backendData.user.organization_id,
      branch_id: backendData.user.branch_id,
      permissions,
      status: 'ACTIVE',
    };

    return {
      success: true,
      user,
      accessToken: backendData.access_token,
      refreshToken: backendData.refresh_token,
    };
  },

  register: async ({ phone, password, fullName, organizationName, branchName, currency }) => {
    if (!phone || !password || !fullName || !organizationName || !branchName || !currency) {
      throw new Error('Barcha maydonlarni to\'ldirish majburiy');
    }

    const response = await axiosInstance.post('/auth/register', {
      phone,
      password,
      full_name: fullName,
      organization_name: organizationName,
      branch_name: branchName,
      currency,
    });
    return response.data;
  },

  forgotPassword: async (identifier) => {
    return {
      success: true,
      message: "Parolni tiklash yo'riqnomasi ko'rsatilgan email manziliga yuborildi.",
    };
  },

  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    return {
      success: true,
      message: "Parol muvaffaqiyatli o'zgartirildi.",
    };
  },

  updateProfile: async (updates) => {
    return {
      success: true,
      user: updates,
      message: "Profil ma'lumotlari muvaffaqiyatli yangilandi.",
    };
  },

  logout: async () => {
    return { success: true };
  },
};
