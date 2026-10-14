import { axiosInstance } from '@/api/axiosInstance';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { setActiveCurrency } from '@/utils/currency.utils';

const extractList = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const extractItem = (response) => {
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return response.data;
  }
  return response;
};

export const settingsApi = {
  // Company Profile
  getCompany: async () => {
    try {
      const response = await axiosInstance.get('/master-data/company/profile');
      const backendData = response?.data || response || {};
      const currency = backendData.currency || 'UZS';
      setActiveCurrency(currency);
      return {
        success: true,
        data: {
          name: backendData.name || '',
          phone: backendData.phone || '',
          website: backendData.website || '',
          address: backendData.address || '',
          description: backendData.description || '',
          currency,
          timezone: backendData.timezone || 'Asia/Tashkent (UTC+5)',
          dateFormat: backendData.date_format || 'YYYY-MM-DD',
        },
      };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateCompany: async (companyData) => {
    try {
      const payload = {
        name: companyData.name,
        phone: companyData.phone,
        website: companyData.website,
        address: companyData.address,
        description: companyData.description,
        currency: companyData.currency,
        timezone: companyData.timezone,
        date_format: companyData.dateFormat,
      };
      const response = await axiosInstance.put('/master-data/company/profile', payload);
      const backendData = response?.data || response || {};
      const currency = backendData.currency || companyData.currency;
      setActiveCurrency(currency);
      return {
        success: true,
        data: {
          name: backendData.name,
          phone: backendData.phone,
          website: backendData.website,
          address: backendData.address,
          description: backendData.description,
          currency,
          timezone: backendData.timezone,
          dateFormat: backendData.date_format,
        },
        message: "Kompaniya sozlamalari saqlandi.",
      };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Product Categories
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/master-data/product-categories', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('productCategories', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createCategory: async (catData) => {
    try {
      const payload = {
        name: catData.name,
        description: catData.description || '',
        status: catData.status || 'ACTIVE',
      };
      const response = await axiosInstance.post('/master-data/product-categories/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/product-categories', payload);
      });
      const data = extractItem(response);
      return { success: true, data, message: "Yangi kategoriya yaratildi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateCategory: async (id, catData) => {
    try {
      const payload = {
        name: catData.name,
        description: catData.description || '',
        status: catData.status || 'ACTIVE',
      };
      const response = await axiosInstance.put(`/master-data/product-categories/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data, message: "Kategoriya yangilandi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteCategory: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/product-categories/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/product-categories/${id}/delete`);
      });
      return { success: true, message: "Kategoriya o'chirildi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Material Types
  getMaterialTypes: async () => {
    try {
      const response = await axiosInstance.get('/master-data/material-types', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('materialTypes', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createMaterialType: async (matData) => {
    try {
      const payload = {
        name: matData.name,
        description: matData.description || '',
        status: matData.status || 'ACTIVE',
      };
      const response = await axiosInstance.post('/master-data/material-types/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/material-types', payload);
      });
      const data = extractItem(response);
      return { success: true, data, message: "Yangi material turi yaratildi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateMaterialType: async (id, matData) => {
    try {
      const payload = {
        name: matData.name,
        description: matData.description || '',
        status: matData.status || 'ACTIVE',
      };
      const response = await axiosInstance.put(`/master-data/material-types/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data, message: "Material turi yangilandi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteMaterialType: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/material-types/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/material-types/${id}/delete`);
      });
      return { success: true, message: "Material turi o'chirildi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Supplier Categories
  getSupplierCategories: async () => {
    try {
      const response = await axiosInstance.get('/master-data/supplier-categories', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('supplierCategories', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createSupplierCategory: async (catData) => {
    try {
      const payload = {
        name: catData.name,
        description: catData.description || '',
        status: catData.status || 'ACTIVE',
      };
      const response = await axiosInstance.post('/master-data/supplier-categories/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/supplier-categories', payload);
      });
      const data = extractItem(response);
      return { success: true, data, message: "Yangi ta'minotchi kategoriyasi yaratildi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateSupplierCategory: async (id, catData) => {
    try {
      const payload = {
        name: catData.name,
        description: catData.description || '',
        status: catData.status || 'ACTIVE',
      };
      const response = await axiosInstance.put(`/master-data/supplier-categories/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data, message: "Ta'minotchi kategoriyasi yangilandi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteSupplierCategory: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/supplier-categories/${id}`);
      return { success: true, message: "Ta'minotchi kategoriyasi o'chirildi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Measurement Units
  getUnits: async () => {
    try {
      const response = await axiosInstance.get('/master-data/units', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('units', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createUnit: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/units/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/units', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateUnit: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/units/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteUnit: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/units/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/units/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Expense Types
  getExpenseTypes: async () => {
    try {
      const response = await axiosInstance.get('/master-data/expense-types', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('expenseTypes', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createExpenseType: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/expense-types/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/expense-types', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateExpenseType: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/expense-types/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteExpenseType: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/expense-types/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/expense-types/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Defect Reasons
  getDefectReasons: async () => {
    try {
      const response = await axiosInstance.get('/master-data/defect-reasons', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('defectReasons', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createDefectReason: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/defect-reasons/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/defect-reasons', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateDefectReason: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/defect-reasons/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteDefectReason: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/defect-reasons/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/defect-reasons/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Service Types
  getServiceTypes: async () => {
    try {
      const response = await axiosInstance.get('/master-data/service-types', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('serviceTypes', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createServiceType: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/service-types/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/service-types', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateServiceType: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/service-types/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteServiceType: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/service-types/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/service-types/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Warranty Types
  getWarrantyTypes: async () => {
    try {
      const response = await axiosInstance.get('/master-data/warranty-types', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('warrantyTypes', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createWarrantyType: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/warranty-types/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/warranty-types', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateWarrantyType: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/warranty-types/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteWarrantyType: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/warranty-types/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/warranty-types/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Currencies
  getCurrencies: async () => {
    try {
      const response = await axiosInstance.get('/master-data/currencies', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('currencies', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createCurrency: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/currencies/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/currencies', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateCurrency: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/currencies/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteCurrency: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/currencies/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/currencies/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Warehouses
  getWarehouses: async () => {
    try {
      const response = await axiosInstance.get('/master-data/warehouses', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('warehouses', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createWarehouse: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/warehouses/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/warehouses', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateWarehouse: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/warehouses/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteWarehouse: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/warehouses/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/warehouses/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Roles
  getRoles: async () => {
    try {
      const response = await axiosInstance.get('/master-data/roles', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('roles', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createRole: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/roles/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/roles', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateRole: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/roles/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteRole: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/roles/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/roles/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Permissions Matrix
  getPermissionsMatrix: async () => {
    try {
      const response = await axiosInstance.get('/master-data/permissions-matrix');
      return { success: true, data: response?.data || response || {} };
    } catch (err) {
      return { success: false, data: {}, error: err };
    }
  },

  // Insurance Types
  getInsuranceTypes: async () => {
    try {
      const response = await axiosInstance.get('/master-data/insurance-types', { params: { include_archived: true } });
      const items = extractList(response);
      dynamicSettingsService.saveList('insuranceTypes', items);
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createInsuranceType: async (payload) => {
    try {
      const response = await axiosInstance.post('/master-data/insurance-types/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/insurance-types', payload);
      });
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateInsuranceType: async (id, payload) => {
    try {
      const response = await axiosInstance.put(`/master-data/insurance-types/${id}`, payload);
      const data = extractItem(response);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteInsuranceType: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/insurance-types/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/insurance-types/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Production Stages
  getProductionStages: async () => {
    try {
      const response = await axiosInstance.get('/master-data/production-stages', { params: { include_archived: true } });
      const items = extractList(response);
      const data = items.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        stageOrder: item.stage_order || item.stageOrder || item.sequence || 1,
        defaultPrice: Number(item.default_price || item.defaultPrice || item.amount) || 0,
        status: item.status || 'ACTIVE',
      }));
      dynamicSettingsService.saveList('productionStages', data);
      return { success: true, data };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createProductionStage: async (payload) => {
    try {
      const data = {
        name: payload.name,
        code: payload.code,
        stage_order: payload.stageOrder || 1,
        default_price: Number(payload.defaultPrice) || 0,
        status: payload.status || 'ACTIVE',
      };
      const response = await axiosInstance.post('/master-data/production-stages/create', data).catch(async () => {
        return await axiosInstance.post('/master-data/production-stages', data);
      });
      const resItem = extractItem(response);
      return { success: true, data: resItem };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateProductionStage: async (id, payload) => {
    try {
      const data = {
        name: payload.name,
        code: payload.code,
        stage_order: payload.stageOrder,
        default_price: payload.defaultPrice,
        status: payload.status,
      };
      const response = await axiosInstance.put(`/master-data/production-stages/${id}`, data);
      const resItem = extractItem(response);
      return { success: true, data: resItem };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  deleteProductionStage: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/production-stages/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/production-stages/${id}/delete`);
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  updateStagesOrder: async (stages) => {
    try {
      return { success: true, data: stages, message: "Texnologik bosqichlar ketma-ketligi saqlandi." };
    } catch (err) {
      return { success: false, error: err };
    }
  },
};
