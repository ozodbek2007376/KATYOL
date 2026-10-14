import { axiosInstance } from '@/api/axiosInstance';
import { boilersApi } from '@/features/boilers/api/boilersApi';
import { warehouseApi } from '@/features/warehouse/api/warehouseApi';
import { recipesApi } from '@/features/recipes/api/recipesApi';

const mapOrder = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    orderNumber: item.order_number || item.orderNumber || `ORD-${item.id?.slice(0, 8)}`,
    orderName: item.order_name || item.orderName || '',
    customerId: item.customer_id || item.customerId || '',
    customerName: item.customer_name || item.customerName || 'Mijoz',
    boilerId: item.boiler_id || item.boilerId || '',
    boilerModelName: item.boiler_model_name || item.boilerModelName || 'Sanoat Kotyoli',
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unit_price || item.unitPrice) || 0,
    totalAmount: Number(item.total_amount || item.totalAmount) || 0,
    depositAmount: Number(item.deposit_amount || item.depositAmount) || 5000000,
    expectedDeliveryDate: item.expected_delivery_date || item.expectedDeliveryDate || '',
    autoDiscountOnLate: item.auto_discount_on_late !== undefined ? Boolean(item.auto_discount_on_late) : (item.autoDiscountOnLate !== undefined ? Boolean(item.autoDiscountOnLate) : true),
    lateDiscountRate: Number(item.late_discount_rate || item.lateDiscountRate) || 0.5,
    assignedEmployeeId: item.assigned_employee_id || item.assignedEmployeeId || '',
    assignedEmployeeName: item.assigned_employee_name || item.assignedEmployeeName || '',
    priority: item.priority || 'NORMAL',
    status: item.status || 'NEW',
    productionStatus: item.production_status || item.productionStatus || 'PENDING',
    paymentStatus: item.payment_status || item.paymentStatus || 'UNPAID',
    notes: item.notes || '',
    createdDate: item.created_at ? item.created_at.split('T')[0] : (item.createdDate || ''),
    updatedDate: item.updated_at ? item.updated_at.split('T')[0] : (item.updatedDate || ''),
    attachments: item.attachments || [],
    timeline: item.timeline || [],
  };
};

export const ordersApi = {
  getOrders: async (filters = {}) => {
    try {
      const params = {
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        customer_id: filters.customerId || undefined,
      };
      const response = await axiosInstance.get('/orders', { params });
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const result = items.map(mapOrder).filter(Boolean);
      return { success: true, data: result };
    } catch (err) {
      console.error("getOrders error:", err);
      return { success: false, data: [], error: err };
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await axiosInstance.get(`/orders/${id}`);
      const itemData = response?.data || response;
      return { success: true, data: mapOrder(itemData) };
    } catch (err) {
      console.error("getOrderById error:", err);
      return { success: false, data: null, error: err };
    }
  },

  checkBoilerOrderAvailability: async (boilerId, quantity = 1) => {
    const qty = parseFloat(quantity) || 1;
    const boilRes = await boilersApi.getBoilerById(boilerId);
    if (!boilRes.success || !boilRes.data) {
      return {
        recipeVersion: '1.0',
        unitPrice: 100,
        totalAmount: 100 * qty,
        estimatedProductionDays: 5,
        materialAvailabilityStatus: 'AVAILABLE',
        currentStockStatus: 'Yetarli zaxira',
        missingIngredients: [],
      };
    }

    const boiler = boilRes.data;
    const unitPrice = boiler.costBreakdown?.totalCost || 200.0;
    const totalAmount = unitPrice * qty;
    const estimatedDays = Math.max(3, 3 + Math.ceil(qty * 1.5));

    let materialAvailabilityStatus = 'AVAILABLE';
    let currentStockStatus = 'Omborda barcha kerakli xomashyolar mavjud';
    const missingIngredients = [];

    if (boiler.recipeId) {
      try {
        const recRes = await recipesApi.getRecipeById(boiler.recipeId);
        const stockRes = await warehouseApi.getCurrentStock();
        
        if (recRes.success && recRes.data?.items && stockRes.success) {
          const stocks = stockRes.data || [];
          
          for (const ingredient of recRes.data.items) {
            const required = (ingredient.requiredQuantity || 0) * qty;
            const matchedStock = stocks.find(
              (s) => String(s.productId) === String(ingredient.materialId)
            );
            const availableStock = matchedStock ? (matchedStock.availableQuantity || matchedStock.quantity || 0) : 0;
            
            if (availableStock < required) {
              materialAvailabilityStatus = 'PARTIAL';
              missingIngredients.push({
                materialName: ingredient.materialName || 'Xomashyo',
                required,
                available: availableStock,
                missing: required - availableStock,
              });
            }
          }

          if (missingIngredients.length > 0) {
            currentStockStatus = `Xomashyolardan ${missingIngredients.length} tasi kamchiligi mavjud`;
          }
        }
      } catch (_err) {
        /* silent */
      }
    }

    return {
      recipeVersion: boiler.version || '1.0',
      recipeName: boiler.recipeName || '',
      unitPrice,
      totalAmount,
      estimatedProductionDays: estimatedDays,
      materialAvailabilityStatus,
      currentStockStatus,
      missingIngredients,
    };
  },

  createOrder: async (orderData) => {
    try {
      const boilRes = await boilersApi.getBoilerById(orderData.boilerId);
      if (boilRes.success && boilRes.data && boilRes.data.status !== 'ACTIVE') {
        return { success: false, message: "Tanlangan kotyol modeli NOFAOL! Faqat faol modellarga buyurtma berish mumkin." };
      }

      const checkResult = await ordersApi.checkBoilerOrderAvailability(orderData.boilerId, orderData.quantity);
      const payload = {
        order_number: orderData.orderNumber || undefined,
        order_name: orderData.orderName || '',
        customer_id: orderData.customerId,
        customer_name: orderData.customerName,
        boiler_id: orderData.boilerId,
        boiler_model_name: orderData.boilerModelName,
        quantity: Number(orderData.quantity) || 1,
        unit_price: checkResult.unitPrice,
        total_amount: checkResult.totalAmount,
        deposit_amount: Number(orderData.depositAmount) || 5000000,
        expected_delivery_date: orderData.expectedDeliveryDate || null,
        auto_discount_on_late: orderData.autoDiscountOnLate !== undefined ? Boolean(orderData.autoDiscountOnLate) : true,
        late_discount_rate: Number(orderData.lateDiscountRate) || 0.5,
        assigned_employee_id: orderData.assignedEmployeeId || '',
        assigned_employee_name: orderData.assignedEmployeeName || '',
        priority: orderData.priority || 'NORMAL',
        status: orderData.isReserved ? 'RESERVED' : 'NEW',
        notes: orderData.notes || '',
      };

      const response = await axiosInstance.post('/orders', payload).catch(async () => {
        return await axiosInstance.post('/orders/create', payload);
      });
      const itemData = response?.data || response;
      return { success: true, data: mapOrder(itemData), message: "Buyurtma muvaffaqiyatli rasmiylashtirildi." };
    } catch (err) {
      console.error("createOrder error:", err);
      return { success: false, error: err, message: "Buyurtma saqlashda xatolik yuz berdi." };
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      const payload = {
        order_name: orderData.orderName,
        customer_id: orderData.customerId,
        boiler_id: orderData.boilerId,
        quantity: orderData.quantity ? Number(orderData.quantity) : undefined,
        deposit_amount: orderData.depositAmount !== undefined ? Number(orderData.depositAmount) : undefined,
        expected_delivery_date: orderData.expectedDeliveryDate !== undefined ? orderData.expectedDeliveryDate : undefined,
        auto_discount_on_late: orderData.autoDiscountOnLate !== undefined ? Boolean(orderData.autoDiscountOnLate) : undefined,
        late_discount_rate: orderData.lateDiscountRate !== undefined ? Number(orderData.lateDiscountRate) : undefined,
        assigned_employee_id: orderData.assignedEmployeeId !== undefined ? orderData.assignedEmployeeId : undefined,
        assigned_employee_name: orderData.assignedEmployeeName !== undefined ? orderData.assignedEmployeeName : undefined,
        priority: orderData.priority,
        status: orderData.status,
        notes: orderData.notes,
      };

      const response = await axiosInstance.put(`/orders/${id}`, payload);
      const itemData = response?.data || response;
      return { success: true, data: mapOrder(itemData), message: "Buyurtma ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateOrder error:", err);
      return { success: false, error: err, message: "Buyurtmani yangilashda xatolik yuz berdi." };
    }
  },

  startProductionOrder: async (id) => {
    try {
      await axiosInstance.put(`/orders/${id}/start-production`);
      return { success: true, message: "Buyurtma bo'yicha ishlab chiqarish boshlandi va sex liniyasiga topshirildi!" };
    } catch (err) {
      return { success: false, error: err, message: "Ishlab chiqarishni boshlashda xatolik yuz berdi." };
    }
  },

  deleteOrder: async (id) => {
    try {
      await axiosInstance.delete(`/orders/${id}`).catch(async () => {
        await axiosInstance.delete(`/orders/${id}/delete`);
      });
      return { success: true, message: "Buyurtma bekor qilindi va o'chirildi." };
    } catch (err) {
      return { success: false, error: err, message: "Buyurtmani bekor qilishda xatolik yuz berdi." };
    }
  },
};
