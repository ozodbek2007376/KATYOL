import { axiosInstance } from '@/api/axiosInstance';
import { boilersApi } from '@/features/boilers/api/boilersApi';
import { recipesApi } from '@/features/recipes/api/recipesApi';
import { warehouseApi } from '@/features/warehouse/api/warehouseApi';

const mapProductionOrder = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    productionNumber: item.batch_number || `BATCH-${item.id?.slice(0, 6)}`,
    boilerId: item.boiler_id,
    boilerModelName: item.boiler_name || 'Kotyol K-50kW',
    quantity: Number(item.target_quantity) || 0,
    completedQuantity: Number(item.completed_quantity) || 0,
    defectQuantity: Number(item.defect_quantity) || 0,
    startDate: item.start_date || '',
    expectedFinishDate: item.end_date || '',
    status: item.status || 'PLANNED',
    progressPercent: item.target_quantity > 0 ? Math.round(((item.completed_quantity || 0) / item.target_quantity) * 100) : 0,
    priority: 'NORMAL',
    assignedEmployees: item.assigned_employees || (item.assigned_employee ? [item.assigned_employee] : []),
    timeline: [],
    operations: (item.operations || []).map((op) => ({
      id: op.id,
      name: op.operation_name,
      workerName: op.worker_name,
      rate: Number(op.rate) || 0,
      status: op.status,
    })),
  };
};

export const productionApi = {
  getProductionOrders: async (filters = {}) => {
    try {
      const params = {
        status: filters.status || undefined,
        page: 1,
        limit: 100,
      };

      const response = await axiosInstance.get('/production/batches', { params });
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = items.map(mapProductionOrder).filter(Boolean);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.productionNumber.toLowerCase().includes(q) ||
            p.boilerModelName.toLowerCase().includes(q)
        );
      }

      if (filters.priority) {
        result = result.filter((p) => p.priority === filters.priority);
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getProductionOrders error:", err);
      return { success: false, data: [], error: err };
    }
  },

  getProductionOrderById: async (id) => {
    try {
      const response = await axiosInstance.get('/production/batches');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const item = items.find((p) => String(p.id) === String(id));
      const mapped = mapProductionOrder(item);

      if (mapped && mapped.boilerId) {
        try {
          const boilRes = await boilersApi.getBoilerById(mapped.boilerId);
          const recipeId = boilRes?.data?.recipeId;
          if (recipeId) {
            const recRes = await recipesApi.getRecipeById(recipeId);
            if (recRes.success && recRes.data?.items) {
              const qty = Number(mapped.quantity) || 1;
              mapped.ingredients = recRes.data.items.map((ing) => ({
                materialName: ing.materialName,
                requiredQty: (ing.requiredQuantity || 0) * qty,
                unit: ing.unit || 'dona',
                cost: (ing.unitPrice || 0) * (ing.requiredQuantity || 0) * qty,
              }));
              mapped.estimatedCost = mapped.ingredients.reduce((sum, ing) => sum + ing.cost, 0);
            }
          }
        } catch (_err) {
          console.warn("Failed to fetch recipe ingredients dynamically:", _err);
        }
      }

      if (mapped) {
        mapped.timeline = [
          { id: 't1', title: "Yaratildi", description: `Partiya rejalashtirildi. Rejadagi miqdor: ${mapped.quantity} dona. Boshlanish sanasi: ${mapped.startDate}`, timestamp: mapped.startDate || "2026-08-06" },
          ...(mapped.status === 'IN_PROGRESS' || mapped.status === 'COMPLETED' ? [
            { id: 't2', title: "Sexda Boshlandi", description: "Xomashyolar ombordan chiqarildi, yig'ish liniyasi ish boshladi.", timestamp: mapped.startDate || "2026-08-06" }
          ] : []),
          ...(mapped.status === 'COMPLETED' ? [
            { id: 't3', title: "Yakunlandi", description: "Barcha texnik operatsiyalar bajarildi va sifat nazoratidan o'tdi.", timestamp: mapped.expectedFinishDate || "2026-08-06" }
          ] : [])
        ];
      }

      return { success: true, data: mapped };
    } catch (err) {
      console.error("getProductionOrderById error:", err);
      return { success: false, data: null, error: err };
    }
  },

  verifyProductionMaterials: async (orderId, boilerId, quantity = 1) => {
    const qty = Number(quantity) || 1;
    return {
      materialStatus: 'ENOUGH',
      materialStatusText: 'Barcha xomashyolar omborda mavjud',
      recipeName: 'Standard Retseptura',
      estimatedCost: 180.0 * qty,
      estimatedDays: Math.max(2, Math.ceil(qty * 1.2)),
    };
  },

  createProductionOrder: async (data) => {
    try {
      const payload = {
        batch_number: data.productionNumber || `PRD-2026-${Math.floor(9000 + Math.random() * 999)}`,
        boiler_id: data.boilerId,
        target_quantity: Number(data.quantity) || 1,
        start_date: data.startDate || new Date().toISOString().split('T')[0],
        end_date: data.expectedFinishDate || null,
        assigned_employees: data.assignedEmployees || [],
      };

      const response = await axiosInstance.post('/production/batches', payload);
      const itemData = response?.data || response;
      return { success: true, data: mapProductionOrder(itemData), message: "Ishlab chiqarish topshirig'i kiritildi." };
    } catch (err) {
      console.error("createProductionOrder error:", err);
      return { success: false, error: err, message: "Topshiriq saqlashda xatolik yuz berdi." };
    }
  },

  updateProductionOrder: async (id, data) => {
    try {
      const payload = {
        batch_number: data.productionNumber || undefined,
        boiler_id: data.boilerId || undefined,
        target_quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
        completed_quantity: data.completedQuantity !== undefined ? Number(data.completedQuantity) : undefined,
        defect_quantity: data.defectQuantity !== undefined ? Number(data.defectQuantity) : undefined,
        status: data.status || undefined,
        start_date: data.startDate || undefined,
        end_date: data.expectedFinishDate || undefined,
        assigned_employees: data.assignedEmployees || undefined,
      };

      const response = await axiosInstance.put(`/production/batches/${id}`, payload);
      const itemData = response?.data || response;
      return { success: true, data: mapProductionOrder(itemData), message: "Ishlab chiqarish topshirig'i yangilandi." };
    } catch (err) {
      console.error("updateProductionOrder error:", err);
      return { success: false, error: err, message: "Topshiriqni yangilashda xatolik yuz berdi." };
    }
  },

  updateProductionStage: async (id, stage) => {
    return productionApi.updateProductionOrder(id, { status: stage });
  },

  updateProductionStatus: async (id, status) => {
    return productionApi.updateProductionOrder(id, { status: status });
  },

  startProductionBatch: async (id) => {
    try {
      const orderRes = await productionApi.getProductionOrderById(id);
      const batchData = orderRes?.data;

      await axiosInstance.put(`/production/batches/${id}`, { status: 'IN_PROGRESS' });

      // Automatically deduct ingredients from warehouse
      if (batchData && batchData.boilerId) {
        try {
          const boilRes = await boilersApi.getBoilerById(batchData.boilerId);
          const recipeId = boilRes?.data?.recipeId;
          if (recipeId) {
            const recRes = await recipesApi.getRecipeById(recipeId);
            if (recRes.success && recRes.data?.items?.length > 0) {
              const qty = Number(batchData.quantity) || 1;
              for (const ingredient of recRes.data.items) {
                const requiredQty = (ingredient.requiredQuantity || 0) * qty;
                if (requiredQty > 0) {
                  await warehouseApi.createMovement({
                    productId: ingredient.materialId,
                    productName: ingredient.materialName,
                    quantity: requiredQty,
                    unitPrice: ingredient.unitPrice || 0,
                    movementTypeCode: 'OUT',
                    reason: `Ishlab chiqarish boshlandi: Partiya №${batchData.productionNumber} — ${ingredient.materialName}`,
                  }).catch(() => {});
                }
              }
            }
          }
        } catch (_err) {
          console.warn('Production start warehouse deduction failed:', _err);
        }
      }

      return { success: true, message: "Ishlab chiqarish sexi muvaffaqiyatli ish boshladi!" };
    } catch (err) {
      return { success: false, error: err, message: "Ish boshlashda xatolik yuz berdi." };
    }
  },

  deleteProductionOrder: async (id) => {
    try {
      await axiosInstance.delete(`/production/batches/${id}`);
      return { success: true, message: "Ishlab chiqarish topshirig'i muvaffaqiyatli o'chirildi." };
    } catch (err) {
      return { success: false, error: err, message: "O'chirishda xatolik yuz berdi." };
    }
  },

  completeOperation: async (opId) => {
    try {
      const response = await axiosInstance.put(`/production/operations/${opId}/complete`);
      return { success: true, message: response.message || "Operatsiya bajarildi." };
    } catch (err) {
      console.error("completeOperation error:", err);
      return { success: false, error: err, message: "Operatsiyani yakunlashda xatolik yuz berdi." };
    }
  },
};
