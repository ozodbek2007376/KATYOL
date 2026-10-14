import { axiosInstance } from '@/api/axiosInstance';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';

const isValidUUID = (str) =>
  typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const mapProduct = (item) => {
  if (!item) return null;

  const categoryId = item.category_id || item.category?.id || '';
  const resolvedCategory = dynamicSettingsService.getItemById('productCategories', categoryId);
  const categoryName = item.category_name || item.category?.name || resolvedCategory?.name || '-';

  const materialTypeId = item.material_type_id || item.material_type?.id || '';
  const resolvedMaterial = dynamicSettingsService.getItemById('materialTypes', materialTypeId);
  const materialTypeName = item.material_type_name || item.material_type?.name || resolvedMaterial?.name || '-';

  const unitId = item.unit_id || item.unit?.id || '';
  const resolvedUnit = dynamicSettingsService.getItemById('units', unitId);
  const unitName = item.unit_name || item.unit?.name || resolvedUnit?.name || 'dona';

  const supplierId = item.supplier_id || item.supplier?.id || '';
  const resolvedSupplier = dynamicSettingsService.getItemById('suppliers', supplierId);
  const supplierName = item.supplier_name || item.supplier?.companyName || item.supplier?.name || resolvedSupplier?.companyName || resolvedSupplier?.name || '-';

  return {
    id: item.id,
    name: item.name,
    internalCode: item.code || item.internalCode || '',
    categoryId,
    categoryName,
    materialTypeId,
    materialTypeName,
    unitId,
    unitName,
    supplierId,
    supplierName,
    purchasePrice: Number(item.unit_price || item.purchasePrice || 0),
    currency: item.currency || 'USD',
    minStock: Number(item.min_stock_level || item.minStock || 0),
    currentStock: Number(item.current_stock || item.currentStock || 0),
    status: item.status || 'ACTIVE',
    description: (() => {
      let d = item.description || '';
      if (d.trim().startsWith('{')) {
        try {
          return JSON.parse(d).description || 'Sanoat mahsuloti xomashyosi.';
        } catch {
          return 'Sanoat mahsuloti xomashyosi.';
        }
      }
      return d || 'Sanoat mahsuloti xomashyosi.';
    })(),
    type: item.type || 'FINISHED_GOOD',
    image: null,
  };
};

export const productsApi = {
  getProducts: async (filters = {}) => {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 100,
        search: filters.search || undefined,
        category_id: filters.categoryId || undefined,
        status: filters.status || 'ACTIVE',
      };

      const [response, stockResponse] = await Promise.all([
        axiosInstance.get('/products', { params }),
        axiosInstance.get('/warehouse/stock').catch(() => null),
      ]);

      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const stockItems = Array.isArray(stockResponse?.data) ? stockResponse.data : Array.isArray(stockResponse) ? stockResponse : [];

      const stockMap = new Map(
        stockItems.map((s) => [String(s.product_id || s.product?.id), Number(s.quantity) || 0])
      );

      const mappedProducts = items.map((item) => {
        const prod = mapProduct(item);
        if (prod && stockMap.has(String(prod.id))) {
          prod.currentStock = stockMap.get(String(prod.id));
        }
        return prod;
      }).filter(Boolean);

      return { success: true, data: mappedProducts };
    } catch (err) {
      console.error("getProducts error:", err);
      return { success: false, data: [], error: err };
    }
  },

  getProductById: async (id) => {
    try {
      const [response, stockResponse] = await Promise.all([
        axiosInstance.get(`/products/${id}`),
        axiosInstance.get('/warehouse/stock').catch(() => null),
      ]);

      const itemData = response?.data || response;
      const stockItems = Array.isArray(stockResponse?.data) ? stockResponse.data : Array.isArray(stockResponse) ? stockResponse : [];

      const stockMap = new Map(
        stockItems.map((s) => [String(s.product_id || s.product?.id), Number(s.quantity) || 0])
      );

      const prod = mapProduct(itemData);
      if (prod && stockMap.has(String(prod.id))) {
        prod.currentStock = stockMap.get(String(prod.id));
      }

      return { success: true, data: prod };
    } catch (err) {
      console.error("getProductById error:", err);
      return { success: false, data: null, error: err };
    }
  },

  createProduct: async (productData) => {
    try {
      let catId = productData.categoryId;
      let unitId = productData.unitId;

      if (!isValidUUID(catId) || !isValidUUID(unitId)) {
        try {
          const [catRes, unitRes] = await Promise.all([
            axiosInstance.get('/master-data/product-categories').catch(() => null),
            axiosInstance.get('/master-data/units').catch(() => null),
          ]);

          const catList = Array.isArray(catRes?.data) ? catRes.data : Array.isArray(catRes) ? catRes : [];
          const unitList = Array.isArray(unitRes?.data) ? unitRes.data : Array.isArray(unitRes) ? unitRes : [];

          if (!isValidUUID(catId) && catList[0]?.id) catId = catList[0].id;
          if (!isValidUUID(unitId) && unitList[0]?.id) unitId = unitList[0].id;
        } catch {
          // keep original
        }
      }

      const payload = {
        code: productData.internalCode || `PRD-${Date.now().toString().slice(-6)}`,
        name: productData.name,
        category_id: catId,
        material_type_id: isValidUUID(productData.materialTypeId) ? productData.materialTypeId : null,
        unit_id: unitId,
        supplier_id: isValidUUID(productData.supplierId) ? productData.supplierId : null,
        type: productData.type || 'FINISHED_GOOD',
        min_stock_level: Number(productData.minStock) || 0,
        unit_price: Number(productData.purchasePrice) || 0,
        currency: productData.currency || 'USD',
      };

      const response = await axiosInstance.post('/products', payload)
        .catch(() => axiosInstance.post('/products/', payload));
      const itemData = response?.data || response;
      const newProductId = itemData?.id;

      // Create warehouse stock entry if quantity provided
      const qty = Number(productData.quantity);
      if (qty > 0 && newProductId) {
        try {
          await axiosInstance.post('/warehouse/stock', {
            product_id: newProductId,
            quantity: qty,
            unit_cost: Number(productData.purchasePrice) || 0,
            movement_type: 'PURCHASE',
          });
        } catch (stockErr) {
          console.error("Stock creation error:", stockErr);
        }
      }

      return { success: true, data: mapProduct(itemData), message: "Yangi xomashyo/mahsulot muvaffaqiyatli saqlandi." };
    } catch (err) {
      console.error("createProduct error:", err);
      return { success: false, error: err, message: "Mahsulot saqlashda xatolik yuz berdi." };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const payload = {
        name: productData.name,
        code: productData.code || productData.internalCode || undefined,
        category_id: isValidUUID(productData.categoryId) ? productData.categoryId : undefined,
        material_type_id: isValidUUID(productData.materialTypeId) ? productData.materialTypeId : undefined,
        unit_id: isValidUUID(productData.unitId) ? productData.unitId : undefined,
        supplier_id: isValidUUID(productData.supplierId) ? productData.supplierId : undefined,
        type: productData.type || undefined,
        min_stock_level: productData.minStock !== undefined ? Number(productData.minStock) : undefined,
        unit_price: productData.purchasePrice !== undefined ? Number(productData.purchasePrice) : undefined,
        currency: productData.currency || undefined,
        status: productData.status || undefined,
      };

      // Remove undefined keys so backend doesn't receive them
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      const response = await axiosInstance.put(`/products/${id}`, payload)
        .catch(() => axiosInstance.put(`/products/${id}/`, payload));
      const itemData = response?.data || response;

      // Update warehouse stock quantity if provided
      const qty = Number(productData.quantity);
      if (qty > 0) {
        try {
          const stockRes = await axiosInstance.get('/warehouse/stock');
          const stocks = Array.isArray(stockRes?.data) ? stockRes.data : Array.isArray(stockRes) ? stockRes : [];
          const stockEntry = stocks.find(s => String(s.product_id || s.product?.id) === String(id));
          if (stockEntry) {
            // Update existing stock
            await axiosInstance.put(`/warehouse/stock/${stockEntry.id}`, {
              quantity: qty,
              unit_cost: Number(productData.purchasePrice) || 0,
            });
          } else {
            // Create new stock entry via POST
            await axiosInstance.post('/warehouse/stock', {
              product_id: id,
              quantity: qty,
              unit_cost: Number(productData.purchasePrice) || 0,
              movement_type: 'ADJUSTMENT',
            });
          }
        } catch (stockErr) {
          console.error("Stock update error:", stockErr);
        }
      }

      return { success: true, data: mapProduct(itemData), message: "Mahsulot ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateProduct error:", err);
      return { success: false, error: err, message: "Mahsulotni yangilashda xatolik yuz berdi." };
    }
  },

  deleteProduct: async (id) => {
    try {
      await axiosInstance.delete(`/products/${id}`)
        .catch(() => axiosInstance.delete(`/products/${id}/`));
      return { success: true, message: "Mahsulot katalogdan o'chirildi." };
    } catch (err) {
      console.error("deleteProduct error:", err);
      return { success: false, error: err, message: "Mahsulotni o'chirishda xatolik yuz berdi." };
    }
  },

  getProductActivities: async (productId = null) => {
    try {
      const response = await axiosInstance.get('/audit/logs', { params: { target_type: 'PRODUCT', target_id: productId } })
        .catch(() => null);
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items };
    } catch (err) {
      return { success: true, data: [] };
    }
  },
};
