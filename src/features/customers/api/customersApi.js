import { axiosInstance } from '@/api/axiosInstance';

const mapCustomer = (item) => {
  if (!item) return null;

  let extra = {
    customerTypeId: 'ctype_1',
    region: 'Toshkent shahri',
    address: item.address || '',
    district: '',
    altPhone: '',
    notes: '',
    passport: '',
    depositAmount: 0,
    orderDate: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    boilerModelName: '',
    totalAmount: 0,
    autoDiscountOnLate: true,
    lateDiscountRate: 0.5,
  };

  if (item.address && item.address.trim().startsWith('{')) {
    try {
      extra = { ...extra, ...JSON.parse(item.address) };
    } catch (_err) {
      /* ignore */
    }
  } else {
    extra.address = item.address || '';
  }

  return {
    id: item.id,
    customerName: item.name || '',
    contactPerson: item.contact_name || '',
    phone: item.phone || '',
    email: item.email || '',
    address: extra.address || '',
    tin: item.code || '',
    customerTypeId: extra.customerTypeId || 'ctype_1',
    customerTypeName: extra.customerTypeId === 'ctype_2' ? 'Yuridik Shaxs' : 'Jismoniy Shaxs',
    region: extra.region || 'Toshkent shahri',
    district: extra.district || '',
    altPhone: extra.altPhone || '',
    notes: extra.notes || '',
    passport: extra.passport || '',
    depositAmount: extra.depositAmount !== undefined ? Number(extra.depositAmount) : 0,
    orderDate: extra.orderDate || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    deliveryDate: extra.deliveryDate || '',
    boilerModelName: extra.boilerModelName || '',
    totalAmount: extra.totalAmount !== undefined ? Number(extra.totalAmount) : 0,
    autoDiscountOnLate: extra.autoDiscountOnLate !== undefined ? Boolean(extra.autoDiscountOnLate) : true,
    lateDiscountRate: extra.lateDiscountRate !== undefined ? Number(extra.lateDiscountRate) : 0.5,
    status: item.status || 'ACTIVE',
    createdDate: item.created_at?.split('T')[0] || '',
    updatedDate: item.updated_at?.split('T')[0] || '',
    timeline: [],
  };
};

export const customersApi = {
  getCustomers: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/master-data/customers');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = items.map(mapCustomer).filter(Boolean);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (c) =>
            c.customerName.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q) ||
            (c.tin && c.tin.includes(q))
        );
      }

      if (filters.customerTypeId) {
        result = result.filter((c) => c.customerTypeId === filters.customerTypeId);
      }

      if (filters.region) {
        result = result.filter((c) => c.region === filters.region);
      }

      if (filters.status) {
        result = result.filter((c) => c.status === filters.status);
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getCustomers error:", err);
      return { success: false, data: [], error: err };
    }
  },

  getCustomerById: async (id) => {
    try {
      const response = await axiosInstance.get('/master-data/customers');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const item = items.find((c) => String(c.id) === String(id));
      return { success: true, data: mapCustomer(item) };
    } catch (err) {
      console.error("getCustomerById error:", err);
      return { success: false, data: null, error: err };
    }
  },

  createCustomer: async (customerData) => {
    try {
      const addressStr = JSON.stringify({
        customerTypeId: customerData.customerTypeId || 'ctype_1',
        region: customerData.region || 'Toshkent shahri',
        district: customerData.district || '',
        address: customerData.address || '',
        altPhone: customerData.altPhone || '',
        passport: customerData.passport || '',
        notes: customerData.notes || '',
        depositAmount: customerData.depositAmount !== undefined ? Number(customerData.depositAmount) : 0,
        orderDate: customerData.orderDate || new Date().toISOString().split('T')[0],
        deliveryDate: customerData.deliveryDate || '',
        boilerModelName: customerData.boilerModelName || '',
        totalAmount: customerData.totalAmount !== undefined ? Number(customerData.totalAmount) : 0,
        autoDiscountOnLate: customerData.autoDiscountOnLate !== undefined ? Boolean(customerData.autoDiscountOnLate) : true,
        lateDiscountRate: customerData.lateDiscountRate !== undefined ? Number(customerData.lateDiscountRate) : 0.5,
      });

      const payload = {
        code: customerData.tin || `CUST-${Date.now()}`,
        name: customerData.customerName,
        contact_name: customerData.contactPerson || '',
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: addressStr,
      };

      const response = await axiosInstance.post('/master-data/customers/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/customers', payload);
      });
      const itemData = response?.data || response;
      return { success: true, data: mapCustomer(itemData), message: "Mijoz muvaffaqiyatli saqlandi." };
    } catch (err) {
      console.error("createCustomer error:", err);
      return { success: false, error: err, message: "Mijozni saqlashda xatolik yuz berdi." };
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      const currentResponse = await axiosInstance.get('/master-data/customers');
      const items = Array.isArray(currentResponse?.data) ? currentResponse.data : Array.isArray(currentResponse) ? currentResponse : [];
      const item = items.find((c) => String(c.id) === String(id));

      let currentExtra = {};
      if (item && item.address && item.address.trim().startsWith('{')) {
        try {
          currentExtra = JSON.parse(item.address);
        } catch (_err) {
          /* ignore */
        }
      } else if (item) {
        currentExtra.address = item.address || '';
      }

      const addressStr = JSON.stringify({
        ...currentExtra,
        customerTypeId: customerData.customerTypeId || currentExtra.customerTypeId,
        region: customerData.region || currentExtra.region,
        district: customerData.district !== undefined ? customerData.district : currentExtra.district,
        address: customerData.address !== undefined ? customerData.address : currentExtra.address,
        altPhone: customerData.altPhone !== undefined ? customerData.altPhone : currentExtra.altPhone,
        notes: customerData.notes !== undefined ? customerData.notes : currentExtra.notes,
        depositAmount: customerData.depositAmount !== undefined ? Number(customerData.depositAmount) : currentExtra.depositAmount,
        orderDate: customerData.orderDate || currentExtra.orderDate,
        deliveryDate: customerData.deliveryDate !== undefined ? customerData.deliveryDate : currentExtra.deliveryDate,
        boilerModelName: customerData.boilerModelName || currentExtra.boilerModelName,
        totalAmount: customerData.totalAmount !== undefined ? Number(customerData.totalAmount) : currentExtra.totalAmount,
        autoDiscountOnLate: customerData.autoDiscountOnLate !== undefined ? Boolean(customerData.autoDiscountOnLate) : currentExtra.autoDiscountOnLate,
        lateDiscountRate: customerData.lateDiscountRate !== undefined ? Number(customerData.lateDiscountRate) : currentExtra.lateDiscountRate,
      });

      const payload = {
        code: customerData.tin || undefined,
        name: customerData.customerName || undefined,
        contact_name: customerData.contactPerson !== undefined ? customerData.contactPerson : undefined,
        phone: customerData.phone !== undefined ? customerData.phone : undefined,
        email: customerData.email !== undefined ? customerData.email : undefined,
        address: addressStr,
        status: customerData.status || undefined,
      };

      const response = await axiosInstance.put(`/master-data/customers/${id}`, payload);
      const itemData = response?.data || response;
      return { success: true, data: mapCustomer(itemData), message: "Mijoz ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateCustomer error:", err);
      return { success: false, error: err, message: "Mijozni yangilashda xatolik yuz berdi." };
    }
  },

  deleteCustomer: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/customers/${id}`);
      return { success: true, message: "Mijoz bazadan o'chirildi." };
    } catch (err) {
      console.error("deleteCustomer error:", err);
      return { success: false, error: err, message: "Mijozni o'chirishda xatolik yuz berdi." };
    }
  },
};
