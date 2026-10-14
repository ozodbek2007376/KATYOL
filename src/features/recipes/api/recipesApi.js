import { axiosInstance } from '@/api/axiosInstance';
import { productsApi } from '@/features/warehouse/api/productsApi';

const mapRecipe = (item) => {
  if (!item) return null;
  const rawItems = Array.isArray(item.items) ? item.items : [];
  const mappedItems = rawItems.map((ing) => {
    const qty = Number(ing.required_quantity || ing.requiredQuantity || ing.quantity || 0) || 0;
    const price = Number(ing.unit_price || ing.unitPrice || ing.price || 0) || 0;
    const waste = Number(ing.waste_percent || ing.wastePercent || 0);
    const totalCost = qty * price * (1 + waste / 100);

    return {
      id: ing.id || `ing_${Date.now()}_${Math.random()}`,
      materialId: ing.material_id || ing.materialId,
      materialName: ing.material_name || ing.materialName || 'Xomashyo',
      materialTypeName: ing.material_type_name || ing.materialTypeName || '',
      unitName: ing.unit_name || ing.unitName || 'dona',
      requiredQuantity: qty,
      wastePercent: waste,
      unitPrice: price,
      totalCost: totalCost,
      notes: ing.notes || '',
    };
  });

  const baseMaterialCost = mappedItems.reduce((acc, row) => acc + row.requiredQuantity * row.unitPrice, 0);
  const estimatedWasteCost = mappedItems.reduce((acc, row) => acc + row.requiredQuantity * row.unitPrice * (row.wastePercent / 100), 0);
  const estimatedTotalCost = baseMaterialCost + estimatedWasteCost;

  return {
    id: item.id,
    recipeName: item.recipe_name || item.recipeName || 'Nomsiz Retseptura',
    productId: item.product_id || item.productId || null,
    productName: item.product_name || item.productName || '-',
    version: item.version || '1.0',
    status: item.status || 'ACTIVE',
    description: item.description || '',
    createdDate: item.created_date || item.createdDate || new Date().toISOString().split('T')[0],
    updatedDate: item.updated_date || item.updatedDate || new Date().toISOString().split('T')[0],
    items: mappedItems,
    totalMaterialCount: mappedItems.length,
    baseMaterialCost,
    estimatedWasteCost,
    estimatedTotalCost,
  };
};

export const recipesApi = {
  getRecipes: async (filters = {}) => {
    try {
      const params = {
        product_id: filters.productId || undefined,
        status: filters.status || undefined,
      };
      const response = await axiosInstance.get('/products/recipes', { params });
      let result = (response.data || []).map(mapRecipe).filter(Boolean);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (r) =>
            r.recipeName.toLowerCase().includes(q) ||
            r.productName.toLowerCase().includes(q)
        );
      }

      return { success: true, data: result };
    } catch {
      return { success: true, data: [] };
    }
  },

  getRecipeById: async (id) => {
    try {
      const response = await axiosInstance.get(`/products/recipes/${id}`);
      return { success: true, data: mapRecipe(response.data) };
    } catch {
      // Fallback for new empty finish goods without backend recipes yet
      try {
        const prodRes = await productsApi.getProductById(id);
        if (prodRes.success && prodRes.data) {
          if (prodRes.data.type !== 'FINISHED_GOOD') {
            return { success: true, data: null };
          }
          const defaultRecipe = {
            id: prodRes.data.id,
            recipeName: `${prodRes.data.name} Resepturasi`,
            productId: prodRes.data.id,
            productName: prodRes.data.name,
            version: '1.0',
            status: 'ACTIVE',
            description: 'Standart texnologik xarita.',
            createdDate: prodRes.data.createdDate || new Date().toISOString().split('T')[0],
            updatedDate: prodRes.data.updatedDate || new Date().toISOString().split('T')[0],
            items: [],
            totalMaterialCount: 0,
            baseMaterialCost: 0,
            estimatedWasteCost: 0,
            estimatedTotalCost: 0,
          };
          return { success: true, data: defaultRecipe };
        }
      } catch (_err) {
        /* ignore */
      }
      return { success: true, data: null };
    }
  },

  createRecipe: async (recipeData) => {
    try {
      const payload = {
        recipe_name: recipeData.recipeName,
        product_id: recipeData.productId || null,
        version: recipeData.version || '1.0',
        status: recipeData.status || 'ACTIVE',
        description: recipeData.description || '',
        items: (recipeData.items || [])
          .filter((ing) => ing.materialId)
          .map((ing) => ({
            material_product_id: ing.materialId,
            quantity: Number(ing.requiredQuantity) || 0,
            waste_percentage: Number(ing.wastePercent) || 0,
          })),
      };
      const response = await axiosInstance.post('/products/recipes', payload).catch(async () => {
        return await axiosInstance.post('/products/recipes/create', payload);
      });
      return { success: true, data: mapRecipe(response.data), message: "Yangi retseptur muvaffaqiyatli saqlandi." };
    } catch {
      return { success: false, message: "Retseptni saqlashda xatolik." };
    }
  },

  updateRecipe: async (id, recipeData) => {
    try {
      const payload = {
        recipe_name: recipeData.recipeName,
        product_id: recipeData.productId || null,
        version: recipeData.version || '1.0',
        status: recipeData.status || 'ACTIVE',
        description: recipeData.description || '',
        items: (recipeData.items || [])
          .filter((ing) => ing.materialId)
          .map((ing) => ({
            material_product_id: ing.materialId,
            quantity: Number(ing.requiredQuantity) || 0,
            waste_percentage: Number(ing.wastePercent) || 0,
          })),
      };
      const response = await axiosInstance.put(`/products/recipes/${id}`, payload);
      return { success: true, data: mapRecipe(response.data), message: "Retsept ma'lumotlari yangilandi." };
    } catch {
      return { success: false, message: "Retseptni yangilashda xatolik." };
    }
  },

  activateVersion: async (id) => {
    try {
      const resById = await recipesApi.getRecipeById(id);
      if (resById.success && resById.data) {
        const recipe = resById.data;
        recipe.status = 'ACTIVE';
        await recipesApi.updateRecipe(id, recipe);
        return { success: true, message: "Retsept versiyasi faollashtirildi." };
      }
      return { success: false, message: "Retsept topilmadi." };
    } catch {
      return { success: false, message: "Retsept faollashtirishda xatolik." };
    }
  },

  deleteRecipe: async (id) => {
    try {
      await axiosInstance.delete(`/products/recipes/${id}`).catch(async () => {
        await axiosInstance.delete(`/products/recipes/${id}/delete`);
      });
      return { success: true, message: "Retsept o'chirildi." };
    } catch {
      return { success: false, message: "Retseptni o'chirishda xatolik." };
    }
  },
};
