import { recipesApi } from '@/features/recipes/api/recipesApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { axiosInstance } from '@/api/axiosInstance';

const mapBoiler = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    modelName: item.modelName || item.name || 'Kotyol Turi',
    internalCode: item.internalCode || item.code || '',
    recipeId: item.recipe_id || item.recipeId || '',
    recipeName: item.recipe_name || item.recipeName || 'Biriktirilmagan',
    warrantyTypeId: item.warranty_type_id || item.warrantyTypeId || '',
    warrantyTypeName: item.warranty_type_name || item.warrantyTypeName || 'Kafolatsiz',
    warrantyDuration: item.warranty_duration || item.warrantyDuration || 12,
    insuranceTypeId: item.insurance_type_id || item.insuranceTypeId || '',
    insuranceTypeName: item.insurance_type_name || item.insuranceTypeName || 'Sug\'urtasiz',
    selectedStageIds: item.selected_stage_ids || item.selectedStageIds || [],
    costBreakdown: item.cost_breakdown || item.costBreakdown || {
      materialCost: 0,
      stageCost: 0,
      laborCost: 0,
      totalCost: Number(item.unit_price) || 0
    },
    status: item.status || 'ACTIVE',
    description: item.description || item.notes || '',
    createdDate: item.created_at || item.createdDate || '',
    updatedDate: item.updated_at || item.updatedDate || '',
  };
};

export const boilersApi = {
  getBoilers: async (filters = {}) => {
    const response = await axiosInstance.get('/master-data/boilers');
    let list = (response.data || []).map(mapBoiler).filter(Boolean);

    try {
      const recRes = await recipesApi.getRecipes().catch(() => null);
      const recipes = recRes?.success ? (recRes.data || []) : [];
      const allStages = dynamicSettingsService.getProductionStages();

      list = list.map((boiler) => {
        const recipe = recipes.find(
          (r) =>
            (boiler.recipeId && String(r.id) === String(boiler.recipeId)) ||
            String(r.productId) === String(boiler.id) ||
            r.productName?.toLowerCase() === boiler.modelName?.toLowerCase()
        );

        if (recipe) {
          const materialCost = Number(recipe.estimatedTotalCost || recipe.baseMaterialCost || 0);
          const stageCost = (boiler.selectedStageIds || []).reduce((acc, stgId) => {
            const stg = allStages.find((s) => s.id === stgId);
            return acc + (stg ? (stg.defaultPrice || 0) : 0);
          }, 0);

          const laborCost = stageCost * 0.10;
          const overheadCost = (materialCost + stageCost) * 0.05;
          const totalCost = materialCost + stageCost + laborCost + overheadCost;

          return {
            ...boiler,
            recipeId: recipe.id,
            recipeName: recipe.recipeName,
            costBreakdown: {
              materialCost,
              stageCost,
              laborCost,
              overheadCost,
              totalCost,
            },
          };
        }
        return boiler;
      });
    } catch (_err) {
      console.warn("Failed to dynamically compute boiler costs on load:", _err);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.modelName.toLowerCase().includes(q) ||
          (b.internalCode && b.internalCode.toLowerCase().includes(q))
      );
    }

    if (filters.status) {
      list = list.filter((b) => b.status === filters.status);
    }

    return { success: true, data: list };
  },

  getBoilerById: async (id) => {
    const response = await axiosInstance.get(`/master-data/boilers/${id}`);
    const b = mapBoiler(response.data);
    
    if (b) {
      try {
        const recRes = await recipesApi.getRecipes().catch(() => null);
        const recipes = recRes?.success ? (recRes.data || []) : [];
        const recipe = recipes.find(
          (r) =>
            (b.recipeId && String(r.id) === String(b.recipeId)) ||
            String(r.productId) === String(b.id) ||
            r.productName?.toLowerCase() === b.modelName?.toLowerCase()
        );

        if (recipe) {
          const allStages = dynamicSettingsService.getProductionStages();
          const materialCost = Number(recipe.estimatedTotalCost || recipe.baseMaterialCost || 0);
          const stageCost = (b.selectedStageIds || []).reduce((acc, stgId) => {
            const stg = allStages.find((s) => s.id === stgId);
            return acc + (stg ? (stg.defaultPrice || 0) : 0);
          }, 0);

          const laborCost = stageCost * 0.10;
          const overheadCost = (materialCost + stageCost) * 0.05;
          const totalCost = materialCost + stageCost + laborCost + overheadCost;

          b.recipeId = recipe.id;
          b.recipeName = recipe.recipeName;
          b.costBreakdown = {
            materialCost,
            stageCost,
            laborCost,
            overheadCost,
            totalCost,
          };
        }
      } catch (_err) {
        // ignore
      }
    }

    return { success: true, data: b };
  },

  calculateBoilerCost: async (recipeId, selectedStageIds = []) => {
    let materialCost = 0;
    if (recipeId) {
      const recRes = await recipesApi.getRecipeById(recipeId);
      if (recRes.success && recRes.data.items) {
        materialCost = recRes.data.items.reduce((acc, row) => acc + (row.totalCost || 0), 0);
      }
    }

    const allStages = dynamicSettingsService.getProductionStages();
    const stageCost = (selectedStageIds || []).reduce((acc, stgId) => {
      const stg = allStages.find((s) => s.id === stgId);
      return acc + (stg ? (stg.defaultPrice || 0) : 0);
    }, 0);

    const laborCost = stageCost * 0.10;
    const overheadCost = (materialCost + stageCost) * 0.05;
    const totalCost = materialCost + stageCost + laborCost + overheadCost;

    return { materialCost, stageCost, laborCost, overheadCost, overheadRatePercent: 5, formula: 'Tannarx = Xomashyo + Bosqichlar + Mehnat (10%) + Sex xarajatlari (5%)', totalCost };
  },

  createBoiler: async (boilerData) => {
    const boilersList = await boilersApi.getBoilers();
    const duplicateSKU = (boilersList.data || []).some(
      (b) => b.internalCode && b.internalCode.toLowerCase() === boilerData.internalCode.toLowerCase()
    );
    if (duplicateSKU) {
      return { success: false, message: `Ushbu '${boilerData.internalCode}' ichki kodi allaqachon mavjud!` };
    }

    if (boilerData.recipeId) {
      const recRes = await recipesApi.getRecipeById(boilerData.recipeId);
      if (recRes.success && recRes.data.status !== 'ACTIVE') {
        return { success: false, message: "Tanlangan retseptura NOFAOL (Inactive)! Faqat faol retseptlarni biriktirish mumkin." };
      }
    }

    const costBreakdown = await boilersApi.calculateBoilerCost(boilerData.recipeId, boilerData.selectedStageIds);

    const payload = {
      name: boilerData.modelName,
      code: boilerData.internalCode,
      status: boilerData.status || 'ACTIVE',
      type: 'FINISHED_GOOD',
      unit_price: Number(costBreakdown.totalCost) || 0,
      description: boilerData.description || '',
      recipe_id: boilerData.recipeId || null,
      warranty_type_id: boilerData.warrantyTypeId || null,
      warranty_duration: Number(boilerData.warrantyDuration) || 12,
      insurance_type_id: boilerData.insuranceTypeId || null,
      selected_stage_ids: boilerData.selectedStageIds || [],
      cost_breakdown: costBreakdown,
    };

    const response = await axiosInstance.post('/master-data/boilers', payload).catch(async () => {
      return await axiosInstance.post('/master-data/boilers/create', payload);
    });
    return { success: true, data: mapBoiler(response.data), message: "Kotyol modeli muvaffaqiyatli saqlandi." };
  },

  updateBoiler: async (id, boilerData) => {
    const costBreakdown = await boilersApi.calculateBoilerCost(boilerData.recipeId, boilerData.selectedStageIds);

    const payload = {
      name: boilerData.modelName,
      code: boilerData.internalCode,
      status: boilerData.status || 'ACTIVE',
      type: 'FINISHED_GOOD',
      unit_price: Number(costBreakdown.totalCost) || 0,
      description: boilerData.description || '',
      recipe_id: boilerData.recipeId || null,
      warranty_type_id: boilerData.warrantyTypeId || null,
      warranty_duration: Number(boilerData.warrantyDuration) || 12,
      insurance_type_id: boilerData.insuranceTypeId || null,
      selected_stage_ids: boilerData.selectedStageIds || [],
      cost_breakdown: costBreakdown,
    };

    const response = await axiosInstance.put(`/master-data/boilers/${id}`, payload);
    return { success: true, data: mapBoiler(response.data), message: "Kotyol modeli ma'lumotlari yangilandi." };
  },

  deleteBoiler: async (id) => {
    await axiosInstance.delete(`/master-data/boilers/${id}`).catch(async () => {
      return await axiosInstance.delete(`/master-data/boilers/${id}/delete`);
    });
    return { success: true, message: "Kotyol modeli katalogdan o'chirildi." };
  },
};
