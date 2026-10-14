import { axiosInstance } from '@/api/axiosInstance';

const actionLabelMap = {
  CREATE: 'Yaratildi',
  UPDATE: 'Yangilandi',
  DELETE: "O'chirildi",
  LOGIN: 'Tizimga kirildi',
  STAGE_UPDATE: "Bosqich O'zgartirildi",
  ASSIGN_EMPLOYEE: 'Xodim Biriktirildi',
  STOCK_MOVEMENT: 'Ombor Kirimi',
  COMPLETE: 'Yakunlandi',
};

const entityLabelMap = {
  Sale: 'Sotuv',
  Lead: 'Lid',
  Order: 'Buyurtma',
  ServiceTicket: 'Servis',
  Product: 'Mahsulot',
  Boiler: 'Kotyol',
  Customer: 'Mijoz',
  User: 'Foydalanuvchi',
  FinanceTransaction: 'Moliya',
  ProductionOrder: 'Ishlab Chiqarish',
};

const mapAuditLog = (item) => {
  if (!item) return null;
  const dt = new Date(item.created_at);
  const entityLabel = entityLabelMap[item.entity_name] || item.entity_name || 'Tizim';
  const entitySlug = item.entity_name?.toLowerCase() || 'system';

  return {
    id: item.id,
    date: dt.toISOString().split('T')[0],
    time: dt.toTimeString().split(' ')[0],
    user: item.actor_name || 'Tizim',
    actorId: item.actor_id,
    module: entitySlug,
    moduleLabel: entityLabel,
    action: item.action,
    actionLabel: actionLabelMap[item.action] || item.action,
    affectedRecord: item.entity_id,
    description: `${entityLabel} bo'yicha ${actionLabelMap[item.action] || item.action} harakati bajarildi.`,
    ipAddress: item.ip_address || '—',
    userAgent: item.user_agent,
    linkPath: `/${entitySlug}s`,
    oldValues: item.old_values,
    newValues: item.new_values,
  };
};

export const auditApi = {
  async getAuditLogs(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 50,
        action: params.action || undefined,
        entity_name: params.module || undefined,
        search: params.search || undefined,
        start_date: params.startDate || undefined,
        end_date: params.endDate || undefined,
      };

      const response = await axiosInstance.get('/audit-logs', { params: queryParams });
      const body = response.data || response;
      const items = Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : [];
      const result = items.map(mapAuditLog).filter(Boolean);

      return {
        success: true,
        data: result,
        pagination: body.pagination || { total: result.length, page: 1, limit: 50, total_pages: 1 },
      };
    } catch (err) {
      console.error('Audit logs fetch error:', err);
      return { success: false, data: [], pagination: {} };
    }
  },

  async getAuditLogById(id) {
    try {
      const response = await axiosInstance.get(`/audit-logs/${id}`);
      const body = response.data || response;
      const log = body.data || body;
      if (!log || !log.id) return { success: false, message: 'Audit yozuvi topilmadi' };
      return { success: true, data: mapAuditLog(log) };
    } catch (err) {
      console.error('Audit log detail error:', err);
      return { success: false, message: 'Audit yozuvi topilmadi' };
    }
  },
};
