import { axiosInstance } from '@/api/axiosInstance';

const mapNotification = (n) => {
  if (!n) return null;
  return {
    id: n.id,
    title: n.title || '',
    message: n.message || n.content || '',
    type: n.type || 'INFO',
    isRead: n.is_read ?? n.isRead ?? false,
    timestamp: n.created_at ? n.created_at.replace('T', ' ').slice(0, 16) : (n.timestamp || ''),
  };
};

export const notificationsApi = {
  async getNotifications() {
    const response = await axiosInstance.get('/notifications');
    const result = (response.data || []).map(mapNotification).filter(Boolean);
    return { success: true, data: result };
  },

  async markAsRead(id) {
    await axiosInstance.put(`/notifications/${id}`, { is_read: true }).catch(async () => {
      await axiosInstance.post(`/notifications/${id}/read`);
    });
    return { success: true, message: 'Bildirishnoma o\'qilgan deb belgilandi' };
  },

  async markAllAsRead() {
    await axiosInstance.put('/notifications/read-all').catch(async () => {
      await axiosInstance.post('/notifications/read-all');
    });
    return { success: true, message: 'Barcha bildirishnomalar o\'qilgan deb belgilandi' };
  },

  async deleteNotification(id) {
    await axiosInstance.delete(`/notifications/${id}`).catch(async () => {
      await axiosInstance.delete(`/notifications/${id}/delete`);
    });
    return { success: true, message: 'Bildirishnoma o\'chirildi' };
  },
};
