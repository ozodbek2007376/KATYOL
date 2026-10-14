import { axiosInstance } from '@/api/axiosInstance';

export const filesApi = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  },
};
