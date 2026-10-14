import { customersApi } from '../../customers/api/customersApi';
import { axiosInstance } from '@/api/axiosInstance';

const mapLead = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    fullName: item.full_name || '',
    phone: item.phone || '',
    email: item.email || '',
    companyName: item.company_name || '',
    status: item.status || 'NEW',
    source: item.source || '',
    notes: item.notes || '',
    nextContactDate: item.next_contact_date || '',
    assignedEmployeeId: item.assigned_employee_id || '',
    assignedEmployeeName: item.assigned_employee_name || '',
    createdDate: item.created_at ? item.created_at.split('T')[0] : '',
  };
};

const mapPayload = (data) => {
  return {
    full_name: data.fullName,
    phone: data.phone,
    email: data.email || '',
    company_name: data.companyName || '',
    status: data.status || 'NEW',
    source: data.source || '',
    notes: data.notes || '',
    next_contact_date: data.nextContactDate || null,
    assigned_employee_id: data.assignedEmployeeId || '',
    assigned_employee_name: data.assignedEmployeeName || '',
  };
};

export const leadsApi = {
  getLeads: async () => {
    const response = await axiosInstance.get('/leads');
    const list = response.data || response;
    return (Array.isArray(list) ? list : []).map(mapLead).filter(Boolean);
  },

  getLeadById: async (id) => {
    const response = await axiosInstance.get(`/leads/${id}`);
    const data = response.data || response;
    return mapLead(data);
  },

  createLead: async (data) => {
    const payload = mapPayload(data);
    const response = await axiosInstance.post('/leads', payload);
    const result = response.data || response;
    return mapLead(result);
  },

  updateLead: async (id, data) => {
    let fullData = { ...data };
    if (data.fullName === undefined || data.phone === undefined) {
      const existing = await leadsApi.getLeadById(id);
      fullData = { ...existing, ...data };
    }
    const payload = mapPayload(fullData);
    const response = await axiosInstance.put(`/leads/${id}`, payload);
    const result = response.data || response;
    return mapLead(result);
  },

  deleteLead: async (id) => {
    await axiosInstance.delete(`/leads/${id}`);
    return true;
  },

  convertLeadToCustomer: async (id) => {
    const lead = await leadsApi.getLeadById(id);
    if (!lead) throw new Error('Lid topilmadi');

    await customersApi.createCustomer({
      customerName: lead.companyName || lead.fullName,
      phone: lead.phone,
      email: lead.email,
      customerTypeId: 'ctype_1',
      region: 'Toshkent shahri',
      status: 'ACTIVE',
      notes: `Liddan aylantirildi. Izoh: ${lead.notes}`,
    });

    return await leadsApi.updateLead(id, { ...lead, status: 'WON' });
  }
};
