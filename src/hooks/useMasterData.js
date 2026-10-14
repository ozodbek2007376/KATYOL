import { useState, useEffect, useMemo, useCallback } from 'react';
import { axiosInstance } from '@/api/axiosInstance';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { dataIntegrityService } from '@/services/dataIntegrity.service';
import { notifySuccess, notifyError } from '@/services/notification.service';

const normalizeKey = (key) => {
  const map = {
    productCategories: 'product-categories',
    units: 'units',
    customerTypes: 'customer-types',
    serviceTypes: 'service-types',
    warrantyTypes: 'warranty-types',
    priorities: 'priorities',
    orderStatuses: 'order-statuses',
    materialTypes: 'material-types',
    supplierCategories: 'supplier-categories',
    expenseTypes: 'expense-types',
    defectReasons: 'defect-reasons',
    roles: 'roles',
    productionStages: 'production-stages',
    insuranceTypes: 'insurance-types',
    currencies: 'currencies',
    warehouses: 'warehouses',
  };
  return map[key] || key.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * Reusable hook for managing any master data entity via backend API.
 * @param {string} entityKey - Key in dynamicSettingsService (e.g. 'productCategories', 'units', 'customerTypes', 'priorities')
 * @param {string} integrityType - Optional entity type string for dataIntegrityService (e.g. 'CATEGORY', 'UNIT', 'CUSTOMER_TYPE')
 */
export const useMasterData = (entityKey, integrityType = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE'
  const [selectedIds, setSelectedIds] = useState([]);

  const apiKey = useMemo(() => normalizeKey(entityKey), [entityKey]);

  // Fetch / refresh data from service
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/master-data/${apiKey}`, {
        params: { include_archived: true },
      });
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setData(items);
      dynamicSettingsService.saveList(entityKey, items);
    } catch (err) {
      console.error(`Error loading master data for ${entityKey}:`, err);
      const fallback = dynamicSettingsService.getList(entityKey, { includeArchived: true });
      setData(fallback || []);
    } finally {
      setLoading(false);
    }
  }, [apiKey, entityKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Filtered and searched data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && (item.status === 'INACTIVE' || item.status === 'ARCHIVED')) {
        return false;
      }
      if (statusFilter === 'INACTIVE' && item.status !== 'INACTIVE' && item.status !== 'ARCHIVED') {
        return false;
      }

      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const nameMatch = item.name && item.name.toLowerCase().includes(term);
      const codeMatch = item.code && item.code.toLowerCase().includes(term);
      const descMatch = item.description && item.description.toLowerCase().includes(term);
      return nameMatch || codeMatch || descMatch;
    });
  }, [data, searchTerm, statusFilter]);

  // Actions
  const createItem = useCallback(
    async (itemData) => {
      try {
        const response = await axiosInstance.post(`/master-data/${apiKey}/create`, itemData).catch(async () => {
          return await axiosInstance.post(`/master-data/${apiKey}`, itemData);
        });
        const created = response?.data || response;
        notifySuccess("Yangi ma'lumot saqlandi.");
        await refresh();
        return created;
      } catch (err) {
        notifyError("Ma'lumot saqlashda xatolik yuz berdi.");
        console.error("Create item error:", err);
        return null;
      }
    },
    [apiKey, refresh]
  );

  const updateItem = useCallback(
    async (id, itemData) => {
      try {
        const response = await axiosInstance.put(`/master-data/${apiKey}/${id}`, itemData);
        const updated = response?.data || response;
        notifySuccess("Ma'lumot yangilandi.");
        await refresh();
        return updated;
      } catch (err) {
        notifyError("Ma'lumotni yangilashda xatolik yuz berdi.");
        console.error("Update item error:", err);
        return null;
      }
    },
    [apiKey, refresh]
  );

  const archiveItem = useCallback(
    async (id) => {
      try {
        const response = await axiosInstance.post(`/master-data/${apiKey}/${id}/archive`).catch(async () => {
          return await axiosInstance.put(`/master-data/${apiKey}/${id}`, { status: 'ARCHIVED' });
        });
        const archived = response?.data || response;
        notifySuccess("Ma'lumot arxivlandi.");
        await refresh();
        return archived;
      } catch (err) {
        notifyError("Arxivlashda xatolik yuz berdi.");
        return null;
      }
    },
    [apiKey, refresh]
  );

  const restoreItem = useCallback(
    async (id) => {
      try {
        const response = await axiosInstance.post(`/master-data/${apiKey}/${id}/restore`).catch(async () => {
          return await axiosInstance.put(`/master-data/${apiKey}/${id}`, { status: 'ACTIVE' });
        });
        const restored = response?.data || response;
        notifySuccess("Ma'lumot qayta tiklandi.");
        await refresh();
        return restored;
      } catch (err) {
        notifyError("Qayta tiklashda xatolik yuz berdi.");
        return null;
      }
    },
    [apiKey, refresh]
  );

  const deleteItem = useCallback(
    async (id) => {
      try {
        await axiosInstance.delete(`/master-data/${apiKey}/${id}`).catch(async () => {
          return await axiosInstance.delete(`/master-data/${apiKey}/${id}/delete`);
        });
        notifySuccess("Ma'lumot o'chirildi.");
        await refresh();
        return { success: true };
      } catch (err) {
        notifyError("O'chirishda xatolik yuz berdi.");
        return { success: false };
      }
    },
    [apiKey, refresh]
  );

  const canDeleteCheck = useCallback(
    (id) => {
      const checkType = integrityType || entityKey;
      return dataIntegrityService.canDelete(checkType, id);
    },
    [integrityType, entityKey]
  );

  // Bulk actions
  const bulkArchive = useCallback(async () => {
    for (const id of selectedIds) {
      await archiveItem(id);
    }
    setSelectedIds([]);
    await refresh();
  }, [selectedIds, archiveItem, refresh]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((d) => d.id || d.code));
    }
  }, [selectedIds, filteredData]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  return {
    data,
    filteredData,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    bulkArchive,
    createItem,
    updateItem,
    archiveItem,
    restoreItem,
    deleteItem,
    canDeleteCheck,
    refresh,
  };
};
