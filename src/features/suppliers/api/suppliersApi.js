import { axiosInstance } from '@/api/axiosInstance';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';

const mapSupplier = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    companyName: item.name || item.companyName || '',
    contactPerson: item.contact_name || item.contactPerson || '',
    phone: item.phone || '',
    email: item.email || '',
    address: item.address || '',
    tin: item.code || item.tin || '',
    status: item.status || 'ACTIVE',
    notes: '',
  };
};

export const suppliersApi = {
  getSuppliers: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/master-data/suppliers');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = items.map(mapSupplier).filter(Boolean);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (s) =>
            s.companyName.toLowerCase().includes(q) ||
            s.contactPerson.toLowerCase().includes(q) ||
            s.phone.toLowerCase().includes(q) ||
            s.tin.toLowerCase().includes(q)
        );
      }

      if (filters.status) {
        result = result.filter((s) => s.status === filters.status);
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getSuppliers error:", err);
      return { success: false, data: [], error: err };
    }
  },

  getSupplierById: async (id) => {
    try {
      const response = await axiosInstance.get('/master-data/suppliers');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const item = items.find((s) => String(s.id) === String(id));
      return { success: true, data: mapSupplier(item) };
    } catch (err) {
      console.error("getSupplierById error:", err);
      return { success: false, data: null, error: err };
    }
  },

  createSupplier: async (supplierData) => {
    try {
      const payload = {
        code: supplierData.tin || supplierData.code || `SUP-${Date.now()}`,
        name: supplierData.name || supplierData.companyName,
        contact_name: supplierData.contactPerson || '',
        phone: supplierData.phone || '',
        email: supplierData.email || '',
        address: supplierData.address || '',
      };

      const response = await axiosInstance.post('/master-data/suppliers/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/suppliers', payload);
      });
      const itemData = response?.data || response;
      return { success: true, data: mapSupplier(itemData), message: "Ta'minotchi muvaffaqiyatli saqlandi." };
    } catch (err) {
      console.error("createSupplier error:", err);
      return { success: false, error: err, message: "Ta'minotchi saqlashda xatolik yuz berdi." };
    }
  },

  updateSupplier: async (id, supplierData) => {
    try {
      const payload = {
        code: supplierData.tin || supplierData.code || undefined,
        name: supplierData.name || supplierData.companyName || undefined,
        contact_name: supplierData.contactPerson !== undefined ? supplierData.contactPerson : undefined,
        phone: supplierData.phone !== undefined ? supplierData.phone : undefined,
        email: supplierData.email !== undefined ? supplierData.email : undefined,
        address: supplierData.address !== undefined ? supplierData.address : undefined,
        status: supplierData.status || undefined,
      };

      const response = await axiosInstance.put(`/master-data/suppliers/${id}`, payload);
      const itemData = response?.data || response;
      return { success: true, data: mapSupplier(itemData), message: "Ta'minotchi ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateSupplier error:", err);
      return { success: false, error: err, message: "Ta'minotchini yangilashda xatolik yuz berdi." };
    }
  },

  deleteSupplier: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/suppliers/${id}`);
      return { success: true, message: "Ta'minotchi tizimdan o'chirildi." };
    } catch (err) {
      console.error("deleteSupplier error:", err);
      return { success: false, error: err, message: "Ta'minotchini o'chirishda xatolik yuz berdi." };
    }
  },

  getSupplierActivities: async () => {
    return { success: true, data: [] };
  },

  getSupplierCategories: async () => {
    try {
      const response = await axiosInstance.get('/master-data/supplier-categories');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items };
    } catch (err) {
      return {
        success: true,
        data: dynamicSettingsService.getSupplierCategories(),
      };
    }
  },
};
