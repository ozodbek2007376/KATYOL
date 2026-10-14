import { axiosInstance } from '@/api/axiosInstance';

export const branchesApi = {
  getBranches: async () => {
    const response = await axiosInstance.get('/auth/branches');
    return response;
  },

  createBranch: async (branchData) => {
    const response = await axiosInstance.post('/auth/branches/create', branchData);
    return response;
  },

  updateBranch: async (id, branchData) => {
    const response = await axiosInstance.put(`/auth/branches/${id}`, branchData);
    return response;
  },

  deleteBranch: async (id) => {
    const response = await axiosInstance.delete(`/auth/branches/${id}/delete`);
    return response;
  },

  getBranchStats: async () => {
    const response = await axiosInstance.get('/auth/branches/stats');
    return response;
  },
};
