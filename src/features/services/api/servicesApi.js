import { axiosInstance } from '@/api/axiosInstance';
import { financeApi } from '@/features/finance/api/financeApi';

const mapService = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    serviceNumber: item.service_number || item.serviceNumber || `SRV-${item.id?.slice(0, 8)}`,
    customerId: item.customer_id || item.customerId || '',
    customerName: item.customer_name || item.customerName || 'Mijoz',
    boilerId: item.boiler_id || item.boilerId || '',
    boilerModelName: item.boiler_model_name || item.boilerModelName || 'Sanoat Kotyoli',
    serviceTypeId: item.service_type_id || item.serviceTypeId || '',
    serviceTypeName: item.service_type_name || item.serviceTypeName || 'Texnik Xizmat',
    assignedEmployeeId: item.assigned_employee_id || item.assignedEmployeeId || '',
    assignedEmployeeName: item.assigned_employee_name || item.assignedEmployeeName || 'Biriktirilmagan',
    serviceDate: item.service_date || item.serviceDate || new Date().toISOString().split('T')[0],
    priority: item.priority || 'NORMAL',
    status: item.status || 'NEW',
    statusName: item.status === 'COMPLETED' ? 'Yakunlangan' : item.status === 'IN_PROGRESS' ? 'Jarayonda' : 'Yangi',
    isUnderWarranty: item.is_under_warranty ?? item.isUnderWarranty ?? true,
    warrantyPeriod: item.warranty_period || item.warrantyPeriod || '24 oy',
    saleDate: item.sale_date || item.saleDate || '',
    orderNumber: item.order_number || item.orderNumber || '',
    productionNumber: item.production_number || item.productionNumber || '',
    notes: item.notes || '',
    attachments: item.attachments || [],
    timeline: item.timeline || [],
    serviceCost: Number(item.service_cost || item.serviceCost) || 0,
    saleId: item.sale_id || item.saleId || '',
    saleInvoiceNumber: item.sale_invoice_number || item.saleInvoiceNumber || '',
    employeeCost: Number(item.employee_cost || item.employeeCost) || 0,
  };
};

export const servicesApi = {
  async getServices(params = {}) {
    try {
      const apiParams = {
        customer_id: params.customerId || undefined,
        service_type_id: params.serviceTypeId || undefined,
        status: params.status || undefined,
        priority: params.priority || undefined,
      };
      const response = await axiosInstance.get('/master-data/services', { params: apiParams });
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = items.map(mapService).filter(Boolean);

      if (params.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (s) =>
            s.serviceNumber.toLowerCase().includes(q) ||
            s.customerName.toLowerCase().includes(q) ||
            s.boilerModelName.toLowerCase().includes(q)
        );
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getServices error:", err);
      return { success: false, data: [], error: err };
    }
  },

  async getServiceById(id) {
    try {
      const response = await axiosInstance.get(`/master-data/services/${id}`);
      const itemData = response?.data || response;
      return { success: true, data: mapService(itemData) };
    } catch (err) {
      console.error("getServiceById error:", err);
      return { success: false, data: null, error: err };
    }
  },

  async createService(serviceData) {
    try {
      const payload = {
        service_number: serviceData.serviceNumber || `SRV-${Date.now()}`,
        customer_id: serviceData.customerId || null,
        customer_name: serviceData.customerName || '',
        boiler_id: serviceData.boilerId || null,
        boiler_model_name: serviceData.boilerModelName || '',
        service_type_id: serviceData.serviceTypeId || null,
        service_type_name: serviceData.serviceTypeName || '',
        assigned_employee_id: serviceData.assignedEmployeeId || null,
        assigned_employee_name: serviceData.assignedEmployeeName || '',
        service_date: serviceData.serviceDate || new Date().toISOString().split('T')[0],
        priority: serviceData.priority || 'NORMAL',
        status: serviceData.status || 'NEW',
        is_under_warranty: serviceData.isUnderWarranty ?? true,
        warranty_period: serviceData.warrantyPeriod || '24 oy',
        sale_date: serviceData.saleDate || null,
        order_number: serviceData.orderNumber || null,
        production_number: serviceData.productionNumber || null,
        notes: serviceData.notes || '',
        service_cost: Number(serviceData.serviceCost) || 0,
        sale_id: serviceData.saleId || null,
        sale_invoice_number: serviceData.saleInvoiceNumber || null,
      };
      const response = await axiosInstance.post('/master-data/services/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/services', payload);
      });
      const itemData = response?.data || response;

      // Auto-create finance expense for service cost
      if (serviceData.serviceCost && Number(serviceData.serviceCost) > 0) {
        try {
          await financeApi.createExpense({
            expenseNumber: `SRV-EXP-${itemData.id?.slice(0, 8) || Date.now()}`,
            expenseTypeId: 'service_expense',
            amount: Number(serviceData.serviceCost),
            date: serviceData.serviceDate || new Date().toISOString().split('T')[0],
            description: `Servis xarajati: ${serviceData.serviceTypeName || 'Texnik xizmat'} — ${serviceData.customerName || 'Mijoz'}`,
          });
        } catch (_err) {
          // Finance write failed silently — service itself is saved
        }
      }

      return { success: true, data: mapService(itemData), message: 'Servis arizasi muvaffaqiyatli rasmiylashtirildi!' };
    } catch (err) {
      console.error("createService error:", err);
      return { success: false, error: err, message: "Servis arizasini saqlashda xatolik yuz berdi." };
    }
  },

  async updateService(id, updatedData) {
    try {
      const payload = {
        service_number: updatedData.serviceNumber,
        customer_id: updatedData.customerId,
        customer_name: updatedData.customerName,
        boiler_id: updatedData.boilerId,
        boiler_model_name: updatedData.boilerModelName,
        service_type_id: updatedData.serviceTypeId,
        service_type_name: updatedData.serviceTypeName,
        assigned_employee_id: updatedData.assignedEmployeeId,
        assigned_employee_name: updatedData.assignedEmployeeName,
        service_date: updatedData.serviceDate,
        priority: updatedData.priority,
        status: updatedData.status,
        is_under_warranty: updatedData.isUnderWarranty,
        warranty_period: updatedData.warrantyPeriod,
        sale_date: updatedData.saleDate,
        order_number: updatedData.orderNumber,
        production_number: updatedData.productionNumber,
        notes: updatedData.notes,
        sale_id: updatedData.saleId || null,
        sale_invoice_number: updatedData.saleInvoiceNumber || null,
      };
      const response = await axiosInstance.put(`/master-data/services/${id}`, payload);
      const itemData = response?.data || response;
      return { success: true, data: mapService(itemData), message: "Servis ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateService error:", err);
      return { success: false, error: err, message: "Servis arizasini yangilashda xatolik yuz berdi." };
    }
  },

  async deleteService(id) {
    try {
      await axiosInstance.delete(`/master-data/services/${id}`);
      return { success: true, message: "Servis arizasi o'chirildi." };
    } catch (err) {
      console.error("deleteService error:", err);
      return { success: false, error: err, message: "Servis arizasini o'chirishda xatolik yuz berdi." };
    }
  },

  async getCustomersList() {
    try {
      const response = await axiosInstance.get('/master-data/customers');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items.map((c) => ({ id: c.id, customerName: c.name, name: c.name })) };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  async getBoilersList() {
    try {
      const response = await axiosInstance.get('/master-data/boilers');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items.map((b) => ({ id: b.id, modelName: b.name || b.model_name || 'Kotyol', name: b.name || b.model_name || 'Kotyol', internalCode: b.model_code || b.code || 'SKU' })) };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  async getEmployeesList() {
    try {
      const response = await axiosInstance.get('/auth/employees');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return {
        success: true,
        data: items.map((e) => ({
          id: e.id,
          firstName: e.full_name?.split(' ')[0] || 'Usta',
          lastName: e.full_name?.split(' ').slice(1).join(' ') || '',
          positionName: e.position_name || e.role || 'Usta',
        })),
      };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  async getServiceTypes() {
    try {
      const response = await axiosInstance.get('/master-data/service-types');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      if (items.length > 0) {
        return { success: true, data: items.map((t) => ({ id: t.id, value: t.id, label: t.name, name: t.name })) };
      }
      return {
        success: true,
        data: [
          { id: 'st_1', value: 'INSTALLATION', label: "O'rnatish", name: "O'rnatish" },
          { id: 'st_2', value: 'MAINTENANCE', label: 'Profilaktika', name: 'Profilaktika' },
          { id: 'st_3', value: 'REPAIR', label: "Ta'mirlash", name: "Ta'mirlash" },
          { id: 'st_4', value: 'WARRANTY', label: 'Kafolat xizmati', name: 'Kafolat xizmati' },
          { id: 'st_5', value: 'INSPECTION', label: "Texnik ko'rik", name: "Texnik ko'rik" },
        ],
      };
    } catch (err) {
      return {
        success: true,
        data: [
          { id: 'st_1', value: 'INSTALLATION', label: "O'rnatish", name: "O'rnatish" },
          { id: 'st_2', value: 'MAINTENANCE', label: 'Profilaktika', name: 'Profilaktika' },
          { id: 'st_3', value: 'REPAIR', label: "Ta'mirlash", name: "Ta'mirlash" },
          { id: 'st_4', value: 'WARRANTY', label: 'Kafolat xizmati', name: 'Kafolat xizmati' },
          { id: 'st_5', value: 'INSPECTION', label: "Texnik ko'rik", name: "Texnik ko'rik" },
        ],
      };
    }
  },

  async getServiceStatuses() {
    try {
      const response = await axiosInstance.get('/master-data/order-statuses');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return {
        success: true,
        data: items.map((s) => ({ value: s.code || s.id, label: s.name, code: s.code, name: s.name })),
      };
    } catch (err) {
      return {
        success: true,
        data: [
          { value: 'NEW', label: 'Yangi', code: 'NEW', name: 'Yangi' },
          { value: 'IN_PROGRESS', label: 'Jarayonda', code: 'IN_PROGRESS', name: 'Jarayonda' },
          { value: 'COMPLETED', label: 'Yakunlangan', code: 'COMPLETED', name: 'Yakunlangan' },
          { value: 'CANCELLED', label: 'Bekor qilingan', code: 'CANCELLED', name: 'Bekor qilingan' },
        ],
      };
    }
  },

  async getSalesList() {
    try {
      const res = await axiosInstance.get('/sales');
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return {
        success: true,
        data: items.map((item) => ({
          id: item.id,
          invoiceNumber: item.invoice_number,
          customerId: item.customer_id,
          customerName: item.customer_name || 'Mijoz',
          boilerId: item.boiler_id || item.product_id,
          boilerModelName: item.boiler_model_name || item.product_name || 'Kotyol Modeli',
          assignedEmployeeId: item.assigned_employee_id,
          assignedEmployeeName: item.assigned_employee_name,
          warrantyPeriod: item.warranty_period,
          warrantyStartDate: item.warranty_start_date,
          warrantyEndDate: item.warranty_end_date,
          deliveryLocation: item.delivery_location,
          notes: item.notes,
          saleDate: item.created_at?.split('T')[0] || '',
        })),
      };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  async completeService(id, completionData) {
    try {
      const payload = {
        service_cost: Number(completionData.serviceCost) || 0,
        employee_cost: Number(completionData.employeeCost) || 0,
      };
      const response = await axiosInstance.post(`/master-data/services/${id}/complete`, payload);
      const itemData = response?.data || response;
      return { success: true, data: mapService(itemData), message: "Servis muvaffaqiyatli yakunlandi." };
    } catch (err) {
      console.error("completeService error:", err);
      return { success: false, error: err, message: "Servisni yakunlashda xatolik yuz berdi." };
    }
  },
};
