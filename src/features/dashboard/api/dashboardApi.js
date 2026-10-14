import { axiosInstance } from '@/api/axiosInstance';

export const dashboardApi = {
  getSummary: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/summary');
      return response;
    } catch (error) {
      return { success: false, data: null };
    }
  },

  getCharts: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/charts');
      return response;
    } catch (error) {
      return { success: false, data: null };
    }
  },

  getNotifications: async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      return response;
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getSystemStatus: async () => {
    try {
      const response = await axiosInstance.get('/system/status');
      return response;
    } catch (error) {
      return { success: false, data: null };
    }
  },
};
