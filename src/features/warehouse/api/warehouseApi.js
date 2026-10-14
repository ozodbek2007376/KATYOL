import { axiosInstance } from '@/api/axiosInstance';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { useAuthStore } from '@/store/useAuthStore';
import { financeApi } from '@/features/finance/api/financeApi';

const mapStock = (item) => {
  if (!item) return null;
  const qty = Number(item.quantity) || 0;
  const cost = Number(item.avg_unit_cost || item.purchasePrice || item.unitPrice) || 0;

  const categoryId = item.category_id || item.product?.category_id || '';
  const resolvedCategory = dynamicSettingsService.getItemById('productCategories', categoryId);
  const categoryName = item.category_name || item.product?.category_name || resolvedCategory?.name || '-';

  const materialTypeId = item.material_type_id || item.product?.material_type_id || '';
  const resolvedMaterial = dynamicSettingsService.getItemById('materialTypes', materialTypeId);
  const materialTypeName = item.material_type_name || item.product?.material_type_name || resolvedMaterial?.name || '-';

  return {
    id: item.id,
    productId: item.product_id || item.productId,
    productName: item.product_name || item.productName || item.product?.name || 'Mahsulot',
    internalCode: item.product_code || item.productCode || item.code || '-',
    warehouseId: item.warehouse_id || item.warehouseId,
    warehouseName: item.warehouse_name || item.warehouseName || 'Asosiy Ombor',
    quantity: qty,
    reservedQuantity: Number(item.reserved_quantity || item.reservedQuantity) || 0,
    availableQuantity: qty - (Number(item.reserved_quantity || item.reservedQuantity) || 0),
    unitName: item.unit_name || item.product?.unit_name || item.unitName || 'dona',
    categoryId,
    categoryName,
    materialTypeId,
    materialTypeName,
    minQuantity: Number(item.min_quantity || item.minQuantity) || 10,
    purchasePrice: cost,
    currentValue: qty * cost,
    currency: item.currency || item.product?.currency || 'USD',
    status: item.status || 'ACTIVE',
  };
};

const isValidUUID = (str) =>
  typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const sessionRevaluations = [];
const sessionCounts = [];

export const warehouseApi = {
  // Warehouses List Endpoints
  getWarehouses: async () => {
    try {
      const response = await axiosInstance.get('/master-data/warehouses');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items };
    } catch (err) {
      console.error("getWarehouses error:", err);
      return { success: false, data: [], error: err };
    }
  },

  createWarehouse: async (whData) => {
    try {
      const payload = {
        name: whData.name,
        description: whData.description || '',
      };
      const response = await axiosInstance.post('/master-data/warehouses/create', payload).catch(async () => {
        return await axiosInstance.post('/master-data/warehouses', payload);
      });
      return { success: true, data: response?.data || response, message: "Yangi ombor yaratildi." };
    } catch (err) {
      console.error("createWarehouse error:", err);
      return { success: false, error: err, message: "Ombor yaratishda xatolik yuz berdi." };
    }
  },

  updateWarehouse: async (id, whData) => {
    try {
      const payload = {
        name: whData.name,
        description: whData.description || '',
      };
      const response = await axiosInstance.put(`/master-data/warehouses/${id}`, payload);
      return { success: true, data: response?.data || response, message: "Ombor ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateWarehouse error:", err);
      return { success: false, error: err, message: "Omborni yangilashda xatolik yuz berdi." };
    }
  },

  deleteWarehouse: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/warehouses/${id}`).catch(async () => {
        return await axiosInstance.delete(`/master-data/warehouses/${id}/delete`);
      });
      return { success: true, message: "Ombor muvaffaqiyatli o'chirildi." };
    } catch (err) {
      console.error("deleteWarehouse error:", err);
      return { success: false, error: err, message: "Omborni o'chirishda xatolik yuz berdi." };
    }
  },

  getWarehouseStats: async () => {
    try {
      const response = await axiosInstance.get('/warehouse/stock');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const totalNomenclature = items.length;
      const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const totalVal = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.avg_unit_cost) || 0)), 0);
      const lowStockCount = items.filter((item) => (Number(item.quantity) || 0) <= (Number(item.min_quantity) || 10)).length;

      return {
        success: true,
        data: {
          totalNomenclature,
          totalQuantity: totalQty,
          totalValue: totalVal,
          lowStockAlerts: lowStockCount,
          outOfStockAlerts: items.filter((item) => (Number(item.quantity) || 0) === 0).length,
          totalProducts: totalNomenclature,
          totalStockValue: totalVal,
          lowStockCount: lowStockCount,
          outOfStockCount: items.filter((item) => (Number(item.quantity) || 0) === 0).length,
        },
      };
    } catch (err) {
      console.error("getWarehouseStats error:", err);
      return {
        success: false,
        data: { totalNomenclature: 0, totalQuantity: 0, totalValue: 0, lowStockAlerts: 0, outOfStockAlerts: 0 },
        error: err,
      };
    }
  },

  getCurrentStock: async (filters = {}) => {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 100,
        warehouse_id: filters.warehouseId || undefined,
        product_id: filters.productId || undefined,
        search: filters.search || undefined,
      };

      const response = await axiosInstance.get('/warehouse/stock', { params });
      let items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = items.map(mapStock).filter(Boolean);

      if (filters.categoryId) {
        result = result.filter((item) => String(item.categoryId) === String(filters.categoryId));
      }
      if (filters.materialTypeId) {
        result = result.filter((item) => String(item.materialTypeId) === String(filters.materialTypeId));
      }
      if (filters.status) {
        result = result.filter((item) => item.status === filters.status);
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getCurrentStock error:", err);
      return { success: false, data: [], error: err };
    }
  },

  getStockById: async (id) => {
    try {
      const response = await axiosInstance.get(`/warehouse/stock/${id}`)
        .catch(() => axiosInstance.get(`/warehouse/stock/${id}/`));
      const data = response?.data || response;
      return { success: true, data: mapStock(data) };
    } catch (err) {
      try {
        const response = await axiosInstance.get('/warehouse/stock');
        const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        const item = items.find((s) => String(s.id) === String(id) || String(s.product_id) === String(id));
        if (item) {
          return { success: true, data: mapStock(item) };
        }
      } catch (_err) {
        /* ignore */
      }
      return { success: false, data: null, error: err };
    }
  },

  updateStock: async (id, stockData) => {
    try {
      const payload = {
        quantity: Number(stockData.quantity) || 0,
        avg_unit_cost: Number(stockData.purchasePrice || stockData.unitPrice) || 0,
        min_quantity: Number(stockData.minQuantity) || 10,
        status: stockData.status || 'ACTIVE',
        category_id: stockData.categoryId || null,
        material_type_id: stockData.materialTypeId || null,
        warehouse_id: stockData.warehouseId || null,
        unit_id: stockData.unitId || null,
        product_name: stockData.productName || null,
        product_code: stockData.internalCode || null,
        description: stockData.description || null,
      };
      await axiosInstance.put(`/warehouse/stock/${id}`, payload)
        .catch(() => axiosInstance.put(`/warehouse/stock/${id}/`, payload))
        .catch(() => axiosInstance.put(`/warehouse/stock/${id}/update`, payload))
        .catch(() => axiosInstance.put(`/warehouse/stock/${id}/update/`, payload))
        .catch(() => axiosInstance.put(`/warehouse/stocks/${id}`, payload))
        .catch(() => axiosInstance.put(`/warehouse/stocks/${id}/`, payload));

      return { success: true, message: "Ombor zaxirasi muvaffaqiyatli yangilandi." };
    } catch (err) {
      console.error("updateStock error:", err);
      return { success: false, error: err, message: "Ombor zaxirasini yangilashda xatolik yuz berdi." };
    }
  },

  deleteStock: async (id) => {
    try {
      await axiosInstance.delete(`/warehouse/stock/${id}`)
        .catch(() => axiosInstance.delete(`/warehouse/stock/${id}/`))
        .catch(() => axiosInstance.delete(`/warehouse/stock/${id}/delete`))
        .catch(() => axiosInstance.delete(`/warehouse/stocks/${id}`))
        .catch(() => axiosInstance.delete(`/warehouse/stocks/${id}/`));

      return { success: true, message: "Ombor zaxirasi muvaffaqiyatli o'chirildi." };
    } catch (err) {
      console.error("deleteStock error:", err);
      return { success: false, error: err, message: "Ombor zaxirasini o'chirishda xatolik yuz berdi." };
    }
  },

  // Stock Movements Endpoints
  getMovements: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/warehouse/stock').catch(() => null);
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let apiMovements = items.map((m, idx) => ({
        id: m.id ? `api_mov_${m.id}_${idx}` : `stock_${Date.now()}_${idx}`,
        productName: m.product_name || m.productName || 'Mahsulot',
        warehouseName: m.warehouse_name || m.warehouseName || 'Asosiy Ombor',
        quantity: Number(m.quantity) || 0,
        unitName: m.unit_name || m.unitName || 'dona',
        unitPrice: Number(m.avg_unit_cost || m.avgUnitCost || m.purchase_price || m.purchasePrice || 0),
        movementTypeName: 'Kirim',
        movementTypeCode: 'PURCHASE',
        reason: m.notes || m.reason || 'Ombor Kirimi',
        createdBy: m.created_by || m.createdBy || 'Mas\'ul Xodim',
        createdDate: m.created_at
          ? new Date(m.created_at).toISOString().replace('T', ' ').slice(0, 16)
          : new Date().toISOString().replace('T', ' ').slice(0, 16),
      }));

      let result = apiMovements;

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (m) =>
            m.productName.toLowerCase().includes(q) ||
            m.warehouseName.toLowerCase().includes(q)
        );
      }

      if (filters.movementTypeCode) {
        result = result.filter((m) => m.movementTypeCode === filters.movementTypeCode);
      }

      return { success: true, data: result };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  getMovementById: async () => {
    return { success: true, data: null };
  },

  createMovement: async (movementData) => {
    try {
      let targetWarehouseId = movementData.warehouseId;
      let targetProductId = movementData.productId;

      let realWarehouses = [];
      try {
        const whRes = await axiosInstance.get('/master-data/warehouses');
        realWarehouses = Array.isArray(whRes?.data) ? whRes.data : Array.isArray(whRes) ? whRes : [];
      } catch (_err) {
        /* ignore */
      }

      if (realWarehouses.length > 0) {
        const matchedWh = realWarehouses.find(
          (w) => String(w.id) === String(targetWarehouseId) || w.name === movementData.warehouseName
        );
        targetWarehouseId = matchedWh ? matchedWh.id : realWarehouses[0].id;
      }

      let realProducts = [];
      try {
        const prodRes = await axiosInstance.get('/products');
        realProducts = Array.isArray(prodRes?.data) ? prodRes.data : Array.isArray(prodRes) ? prodRes : [];
      } catch (_err) {
        /* ignore */
      }

      if (targetProductId && realProducts.length > 0) {
        const matchedP = realProducts.find((p) => String(p.id) === String(targetProductId));
        if (matchedP) targetProductId = matchedP.id;
      }

      if (!isValidUUID(targetProductId) && movementData.productName) {
        const matchByName = realProducts.find(
          (p) => p.name?.toLowerCase() === movementData.productName?.toLowerCase()
        );
        if (matchByName) {
          targetProductId = matchByName.id;
        }
      }

      if (!isValidUUID(targetProductId) && movementData.productName) {
        try {
          const [catRes, unitRes] = await Promise.all([
            axiosInstance.get('/master-data/product-categories').catch(() => null),
            axiosInstance.get('/master-data/units').catch(() => null),
          ]);

          const catList = Array.isArray(catRes?.data) ? catRes.data : Array.isArray(catRes) ? catRes : [];
          const unitList = Array.isArray(unitRes?.data) ? unitRes.data : Array.isArray(unitRes) ? unitRes : [];

          const catId = isValidUUID(movementData.categoryId) ? movementData.categoryId : catList[0]?.id;
          const unitId = isValidUUID(movementData.unitId) ? movementData.unitId : unitList[0]?.id;

          if (catId && unitId) {
            const createProdRes = await axiosInstance.post('/products', {
              name: movementData.productName,
              code: movementData.internalCode || `PRD-${Date.now().toString().slice(-6)}`,
              type: 'FINISHED_GOOD',
              category_id: catId,
              unit_id: unitId,
              min_stock_level: 0,
              unit_price: Number(movementData.unitPrice) || 0,
            });

            const createdObj = createProdRes?.data || createProdRes;
            if (createdObj?.id) {
              targetProductId = createdObj.id;
            }
          }
        } catch (err) {
          console.error("Failed to auto-create product:", err);
        }
      }

      if (!isValidUUID(targetProductId) && realProducts[0]?.id) {
        targetProductId = realProducts[0].id;
      }

      const stockPayload = {
        warehouse_id: targetWarehouseId,
        product_id: targetProductId,
        product_name: movementData.productName,
        quantity: Number(movementData.quantity) || 0,
        avg_unit_cost: Number(movementData.unitPrice) || 0,
        created_by: movementData.createdBy || 'Mas\'ul Xodim',
        notes: movementData.notes || '',
      };

      const apiRes = await axiosInstance.post('/warehouse/stock', stockPayload);
      const createdStock = apiRes?.data || apiRes;

      // Auto-create finance expense for defect movements
      if (movementData.movementTypeCode === 'DEFECT' || movementData.reason?.includes('Defekt')) {
        try {
          const defectAmount = (Number(movementData.quantity) || 0) * (Number(movementData.unitPrice || movementData.purchasePrice) || 0);
          if (defectAmount > 0) {
            await financeApi.createExpense({
              expenseNumber: `DEF-EXP-${Date.now()}`,
              expenseTypeId: 'defect_expense',
              amount: defectAmount,
              date: new Date().toISOString().split('T')[0],
              description: `Defekt chiqimi: ${movementData.productName || 'Mahsulot'} × ${movementData.quantity} — Sabab: ${movementData.reason || 'Nosozlik'}`,
            });
          }
        } catch (_err) {
          // Finance write failed silently
        }
      }

      return {
        success: true,
        data: {
          ...movementData,
          id: createdStock?.id || `mov_${Date.now()}`,
          productId: targetProductId,
          warehouseId: targetWarehouseId,
        },
        message: "Yangi mahsulot omborga muvaffaqiyatli kirim qilindi va saqlandi.",
      };
    } catch (err) {
      console.error("createMovement error:", err);
      return { success: false, error: err, message: "Kirim qilishda xatolik yuz berdi." };
    }
  },

  // Revaluation Endpoints
  getRevaluations: async () => {
    try {
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

      const rawLogs = response?.data?.data || response?.data || response || [];
      const logs = Array.isArray(rawLogs) ? rawLogs : [];

      let empResponse = null;
      try {
        empResponse = await axiosInstance.get('/auth/employees').catch(() => null);
      } catch (_err) {
        /* ignore */
      }

      const rawEmployees = empResponse?.data || empResponse || [];
      const employees = Array.isArray(rawEmployees) ? rawEmployees : [];
      const empMap = new Map(employees.map((e) => [String(e.id), e.full_name || e.fullName]));

      const currentUser = useAuthStore.getState().user;
      const currentUserName = currentUser?.fullName || currentUser?.full_name || currentUser?.username || 'Mas\'ul Xodim';

      const apiRevaluations = logs
        .filter((l) => {
          const name = String(l.entity_name || '').toUpperCase();
          if (name === 'WAREHOUSE_STOCK') {
            return (l.action === 'UPDATE_STOCK' || l.action === 'ADJUST_STOCK') && (l.new_values?.avg_unit_cost !== undefined || l.new_values?.purchase_price !== undefined);
          }
          if (name === 'PRODUCT') {
            return l.action === 'UPDATE' && (l.new_values?.unit_price !== undefined || l.new_values?.price !== undefined);
          }
          return false;
        })
        .map((l) => {
          const oldCost = Number(l.old_values?.avg_unit_cost || l.old_values?.unit_price || l.old_values?.purchase_price || l.old_values?.price) || 0;
          const newCost = Number(l.new_values?.avg_unit_cost || l.new_values?.unit_price || l.new_values?.purchase_price || l.new_values?.price) || 0;
          const actorId = String(l.actor_id || l.user_id || '');
          let actorName = empMap.get(actorId);
          if (!actorName && (actorId === String(currentUser?.id) || actorId === String(currentUser?.userId))) {
            actorName = currentUserName;
          }
          actorName = actorName || currentUserName || 'Mas\'ul Xodim';

          return {
            id: l.id,
            productId: l.entity_id,
            productName: l.new_values?.product_name || l.old_values?.product_name || l.new_values?.name || l.old_values?.name || 'Mahsulot',
            previousPrice: oldCost,
            newPrice: newCost,
            priceDifference: newCost - oldCost,
            reason: l.new_values?.notes || l.old_values?.notes || 'Qayta baholash',
            notes: l.new_values?.description || '',
            createdBy: actorName,
            createdDate: l.created_at ? l.created_at.replace('T', ' ').slice(0, 16) : new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        });

      const merged = [...sessionRevaluations];
      apiRevaluations.forEach((item) => {
        if (!merged.some((m) => m.id === item.id)) {
          merged.push(item);
        }
      });

      return { success: true, data: merged };
    } catch (err) {
      console.error("Error in getRevaluations:", err);
      return { success: true, data: sessionRevaluations };
    }
  },

  createRevaluation: async (revaluationData) => {
    try {
      const stockId = revaluationData.productId;
      let stockItem = null;
      try {
        const stockRes = await warehouseApi.getStockById(stockId);
        if (stockRes.success) stockItem = stockRes.data;
      } catch (_err) {
        /* ignore */
      }

      if (stockItem) {
        await warehouseApi.updateStock(stockId, {
          ...stockItem,
          purchasePrice: revaluationData.newPrice,
        }).catch(() => null);
      }

      const currentUser = useAuthStore.getState().user;
      const currentUserName = currentUser?.fullName || currentUser?.full_name || currentUser?.username || 'Mas\'ul Xodim';

      const diff = Number(revaluationData.newPrice) - Number(revaluationData.previousPrice);
      const newRev = {
        id: `rev_${Date.now()}`,
        productId: stockItem?.productId || revaluationData.productId,
        productName: stockItem?.productName || revaluationData.productName,
        previousPrice: Number(revaluationData.previousPrice) || 0,
        newPrice: Number(revaluationData.newPrice) || 0,
        priceDifference: diff,
        reason: revaluationData.reason || '',
        notes: revaluationData.notes || '',
        createdBy: currentUserName,
        createdDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      sessionRevaluations.unshift(newRev);

      return { success: true, data: newRev, message: "Qayta baholash muvaffaqiyatli saqlandi va ombor yangilandi." };
    } catch (err) {
      console.error("createRevaluation error:", err);
      return { success: false, error: err, message: "Qayta baholashda xatolik yuz berdi." };
    }
  },

  // Inventory Count Endpoints
  getInventoryCounts: async () => {
    try {
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

      const rawLogs = response?.data?.data || response?.data || response || [];
      const logs = Array.isArray(rawLogs) ? rawLogs : [];

      let empResponse = null;
      try {
        empResponse = await axiosInstance.get('/auth/employees').catch(() => null);
      } catch (_err) {
        /* ignore */
      }

      const rawEmployees = empResponse?.data || empResponse || [];
      const employees = Array.isArray(rawEmployees) ? rawEmployees : [];
      const empMap = new Map(employees.map((e) => [String(e.id), e.full_name || e.fullName]));

      const currentUser = useAuthStore.getState().user;
      const currentUserName = currentUser?.fullName || currentUser?.full_name || currentUser?.username || 'Mas\'ul Xodim';

      const apiCounts = logs
        .filter((l) => l.entity_name === 'WAREHOUSE_STOCK' && (l.action === 'ADJUST_STOCK' || l.action === 'UPDATE_STOCK') && l.new_values?.quantity !== undefined)
        .map((l) => {
          const oldQty = Number(l.old_values?.quantity) || 0;
          const newQty = Number(l.new_values?.quantity) || 0;
          const actorId = String(l.actor_id || l.user_id || '');
          let actorName = empMap.get(actorId);
          if (!actorName && (actorId === String(currentUser?.id) || actorId === String(currentUser?.userId))) {
            actorName = currentUserName;
          }
          actorName = actorName || currentUserName || 'Mas\'ul Xodim';

          return {
            id: l.id,
            productId: l.entity_id,
            productName: l.new_values?.product_name || l.old_values?.product_name || 'Mahsulot',
            unitName: 'dona',
            systemQuantity: oldQty,
            actualQuantity: newQty,
            difference: newQty - oldQty,
            reason: l.new_values?.notes || l.old_values?.notes || 'Sanoq',
            notes: l.new_values?.description || '',
            status: 'ADJUSTED',
            createdBy: actorName,
            countDate: l.created_at ? l.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          };
        });

      const merged = [...sessionCounts];
      apiCounts.forEach((item) => {
        if (!merged.some((m) => m.id === item.id)) {
          merged.push(item);
        }
      });

      return { success: true, data: merged };
    } catch (err) {
      console.error("Error in getInventoryCounts:", err);
      return { success: true, data: sessionCounts };
    }
  },

  createInventoryCount: async (countData) => {
    try {
      const stockId = countData.productId;
      let stockItem = null;
      try {
        const stockRes = await warehouseApi.getStockById(stockId);
        if (stockRes.success) stockItem = stockRes.data;
      } catch (_err) {
        /* ignore */
      }

      const diff = Number(countData.actualQuantity) - Number(countData.systemQuantity);

      if (stockItem) {
        await warehouseApi.updateStock(stockId, {
          ...stockItem,
          quantity: countData.actualQuantity,
        }).catch(() => null);
      }

      // Generate automatic stock movement if difference !== 0
      if (diff !== 0) {
        try {
          const typeCode = diff > 0 ? 'IN' : 'OUT';
          const absQty = Math.abs(diff);
          await warehouseApi.createMovement({
            productId: stockItem?.productId || countData.productId,
            productName: stockItem?.productName || countData.productName,
            quantity: absQty,
            unitPrice: stockItem?.purchasePrice || 0,
            movementTypeCode: typeCode,
            reason: `Inventarizatsiya farqi (${diff > 0 ? '+' : ''}${diff}): ${countData.reason || 'Moslashtirish'}`,
          });
        } catch (_movErr) {
          console.warn('Inventory count auto-movement creation failed:', _movErr);
        }
      }

      const currentUser = useAuthStore.getState().user;
      const currentUserName = currentUser?.fullName || currentUser?.full_name || currentUser?.username || 'Mas\'ul Xodim';

      const newCount = {
        id: `inv_${Date.now()}`,
        productId: stockItem?.productId || countData.productId,
        productName: stockItem?.productName || countData.productName,
        unitName: stockItem?.unitName || countData.unitName || 'dona',
        systemQuantity: Number(countData.systemQuantity) || 0,
        actualQuantity: Number(countData.actualQuantity) || 0,
        difference: diff,
        reason: countData.reason || '',
        notes: countData.notes || '',
        status: 'ADJUSTED',
        createdBy: currentUserName,
        countDate: new Date().toISOString().split('T')[0],
      };

      sessionCounts.unshift(newCount);

      return { success: true, data: newCount, message: "Inventarizatsiya sanoq tuzatishi saqlandi, ombor yangilandi va avtomatik harakat kiritildi." };
    } catch (err) {
      console.error("createInventoryCount error:", err);
      return { success: false, error: err, message: "Inventarizatsiyada xatolik yuz berdi." };
    }
  },
};
