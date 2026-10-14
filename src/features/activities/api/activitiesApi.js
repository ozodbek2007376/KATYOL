import { axiosInstance } from '@/api/axiosInstance';

const mapActivity = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    title: item.action || 'Tizim amali',
    description: item.description || item.new_values?.notes || item.new_values?.description || `${item.entity_name || 'Ob' } tahrirlandi`,
    user: item.actor_name || item.user_name || 'Mas\'ul xodim',
    moduleName: item.entity_name || 'Tizim',
    timestamp: item.created_at ? item.created_at.replace('T', ' ').slice(0, 16) : '',
  };
};

export const activitiesApi = {
  async getActivities(params = {}) {
    let response;
    try {
      response = await axiosInstance.get('/audit-logs/logs', { params: { limit: 100 } });
    } catch {
      try {
        response = await axiosInstance.get('/audit-logs', { params: { limit: 100 } });
      } catch {
        response = await axiosInstance.get('/audit-logs/list', { params: { limit: 100 } });
      }
    }

    const items = response?.data?.data || response?.data || response || [];
    let result = (Array.isArray(items) ? items : []).map(mapActivity).filter(Boolean);

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.user.toLowerCase().includes(q)
      );
    }

    if (params.moduleName) {
      result = result.filter((a) => a.moduleName === params.moduleName);
    }

    return { success: true, data: result };
  },
};
