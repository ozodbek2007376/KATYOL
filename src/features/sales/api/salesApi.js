import { axiosInstance } from '@/api/axiosInstance';
import { getActiveCurrency } from '@/utils/currency.utils';
import { warehouseApi } from '@/features/warehouse/api/warehouseApi';
import { recipesApi } from '@/features/recipes/api/recipesApi';
import { boilersApi } from '@/features/boilers/api/boilersApi';
import { customersApi } from '@/features/customers/api/customersApi';

const isValidUUID = (str) =>
  typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const mapSale = (item) => {
  if (!item) return null;
  const qty = Number(item.quantity || 1);
  const price = Number(item.unit_price || 0);
  const sub = item.subtotal ? Number(item.subtotal) : qty * price;
  const disc = Number(item.discount_amount || 0);
  const tax = Number(item.tax_amount || 0);
  const total = item.total_amount ? Number(item.total_amount) : sub - disc + tax;

  return {
    id: item.id,
    invoiceNumber: item.invoice_number || `DOC-${item.id?.slice(0, 6)}`,
    customerId: item.customer_id || '',
    customerName: item.customer_name || 'Xaridor',
    boilerId: item.boiler_id || '',
    boilerModelName: item.boiler_model_name || item.product_name || 'Kotyol Modeli',
    quantity: qty,
    unitPrice: price,
    totalAmount: total,
    subtotal: sub,
    discountPercent: sub > 0 ? Math.round((disc / sub) * 100) : 0,
    discountAmount: disc,
    taxPercent: 12,
    taxAmount: tax,
    grandTotal: total,
    actualCost: Number(item.cost_price || item.actual_cost) || (total * 0.65),
    profit: total - (Number(item.cost_price || item.actual_cost) || (total * 0.65)),
    profitMarginPercent: total > 0 ? Math.round(((total - (Number(item.cost_price || item.actual_cost) || (total * 0.65))) / total) * 100) : 0,
    saleDate: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    paymentStatus: item.payment_status || 'UNPAID',
    deliveryStatus: item.delivery_status || 'PENDING',
    paymentMethod: 'Naqd / Bank',
    currency: getActiveCurrency(),
    status: item.status || 'ACTIVE',
    assignedEmployeeId: item.assigned_employee_id || '',
    assignedEmployeeName: item.assigned_employee_name || '',
    warrantyPeriod: item.warranty_period || '',
    warrantyStartDate: item.warranty_start_date || '',
    warrantyEndDate: item.warranty_end_date || '',
    deliveryLocation: item.delivery_location || '',
    notes: item.notes || '',
    timeline: [],
  };
};

export const salesApi = {
  async getSales(params = {}) {
    try {
      const response = await axiosInstance.get('/sales');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = items.map(mapSale).filter(Boolean);

      if (params.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (s) =>
            s.invoiceNumber.toLowerCase().includes(q) ||
            s.customerName.toLowerCase().includes(q)
        );
      }

      if (params.customerId) {
        result = result.filter((s) => s.customerId === params.customerId);
      }

      if (params.paymentStatus) {
        result = result.filter((s) => s.paymentStatus === params.paymentStatus);
      }

      if (params.deliveryStatus) {
        result = result.filter((s) => s.deliveryStatus === params.deliveryStatus);
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getSales error:", err);
      return { success: false, data: [], error: err };
    }
  },

  async getSaleById(id) {
    try {
      const response = await axiosInstance.get('/sales');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const sale = items.find((s) => String(s.id) === String(id));
      if (!sale) return { success: false, message: 'Sotuv hujjati topilmadi' };
      return { success: true, data: mapSale(sale) };
    } catch (err) {
      console.error("getSaleById error:", err);
      return { success: false, data: null, error: err, message: 'Sotuv hujjati topilmadi' };
    }
  },

  async createSale(saleData) {
    try {
      let targetCustomerId = saleData.customerId;
      let targetProductId = saleData.productId || saleData.boilerId;

      if (!isValidUUID(targetCustomerId)) {
        const custRes = await axiosInstance.get('/master-data/customers').catch(() => null);
        const custs = Array.isArray(custRes?.data) ? custRes.data : Array.isArray(custRes) ? custRes : [];
        if (custs[0]?.id) targetCustomerId = custs[0].id;
      }

      if (!isValidUUID(targetProductId)) {
        const prodRes = await axiosInstance.get('/products').catch(() => null);
        const prods = Array.isArray(prodRes?.data) ? prodRes.data : Array.isArray(prodRes) ? prodRes : [];
        if (prods[0]?.id) targetProductId = prods[0].id;
      }

      const payload = {
        invoice_number: saleData.invoiceNumber || `INV-2026-${Math.floor(7000 + Math.random() * 1000)}`,
        customer_id: targetCustomerId,
        boiler_id: targetProductId || null,
        product_id: targetProductId || null,
        quantity: Number(saleData.quantity) || 1,
        unit_price: Number(saleData.unitPrice || saleData.salePrice) || 0,
        discount_amount: Number(saleData.discountAmount) || 0.0,
        tax_amount: Number(saleData.taxAmount) || 0.0,
        exchange_rate_at_creation: 1.0,
        assigned_employee_id: saleData.assignedEmployeeId || null,
        assigned_employee_name: saleData.assignedEmployeeName || null,
        warranty_period: saleData.warrantyPeriod || null,
        warranty_start_date: saleData.warrantyStartDate || null,
        warranty_end_date: saleData.warrantyEndDate || null,
        delivery_location: saleData.deliveryLocation || null,
        notes: saleData.notes || '',
      };

      const response = await axiosInstance.post('/sales', payload);
      const itemData = response?.data || response;

      // Sotilganda ombordan avtomatik ayrilish
      try {
        const boilerId = targetProductId;
        if (boilerId) {
          const boilRes = await boilersApi.getBoilerById(boilerId);
          const recipeId = boilRes?.data?.recipeId;
          if (recipeId) {
            const recRes = await recipesApi.getRecipeById(recipeId);
            if (recRes.success && recRes.data?.items?.length > 0) {
              const qty = Number(saleData.quantity) || 1;
              for (const ingredient of recRes.data.items) {
                const requiredQty = (ingredient.requiredQuantity || 0) * qty;
                if (requiredQty > 0) {
                  await warehouseApi.createMovement({
                    productId: ingredient.materialId,
                    productName: ingredient.materialName,
                    quantity: requiredQty,
                    unitPrice: ingredient.unitPrice || 0,
                    movementTypeCode: 'OUT',
                    reason: `Sotuv: ${payload.invoice_number} — ${ingredient.materialName}`,
                  }).catch(() => {});
                }
              }
            }
          }
        }
      } catch (_err) {
        // Ombor ayrilishi xatolik bo'lsa ham sotuv saqlangan
        console.warn('Ombordan avtomatik ayirishda xatolik:', _err);
      }

      return { success: true, data: mapSale(itemData), message: 'Sotuv hujjati muvaffaqiyatli rasmiylashtirildi va ombordan mahsulot chiqarildi!' };
    } catch (err) {
      console.error("createSale error:", err);
      return { success: false, error: err, message: "Sotuv hujjatini saqlashda xatolik yuz berdi." };
    }
  },

  async updateSale(id, updatedData) {
    try {
      let targetCustomerId = updatedData.customerId;
      let targetProductId = updatedData.productId || updatedData.boilerId;

      const payload = {
        invoice_number: updatedData.invoiceNumber,
        customer_id: targetCustomerId,
        boiler_id: targetProductId || null,
        product_id: targetProductId || null,
        quantity: Number(updatedData.quantity) || 1,
        unit_price: Number(updatedData.unitPrice || updatedData.salePrice) || 0,
        discount_amount: Number(updatedData.discountAmount) || 0.0,
        tax_amount: Number(updatedData.taxAmount) || 0.0,
        exchange_rate_at_creation: 1.0,
        status: updatedData.status || undefined,
        assigned_employee_id: updatedData.assignedEmployeeId || null,
        assigned_employee_name: updatedData.assignedEmployeeName || null,
        warranty_period: updatedData.warrantyPeriod || null,
        warranty_start_date: updatedData.warrantyStartDate || null,
        warranty_end_date: updatedData.warrantyEndDate || null,
        delivery_location: updatedData.deliveryLocation || null,
        notes: updatedData.notes || '',
      };

      const response = await axiosInstance.put(`/sales/${id}`, payload);
      return { success: true, data: mapSale(response.data || response), message: "Sotuv ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateSale error:", err);
      return { success: false, error: err, message: "Sotuv hujjatini yangilashda xatolik yuz berdi." };
    }
  },

  async deleteSale(id) {
    try {
      await axiosInstance.delete(`/sales/${id}`);
      return { success: true, message: "Sotuv hujjati bekor qilindi." };
    } catch (err) {
      console.error("deleteSale error:", err);
      return { success: false, error: err, message: "Sotuv hujjatini bekor qilishda xatolik yuz berdi." };
    }
  },

  async getCustomersList() {
    try {
      const res = await customersApi.getCustomers();
      if (res.success) {
        return { success: true, data: res.data };
      }
      return { success: false, data: [] };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  async getBoilersList() {
    try {
      const res = await boilersApi.getBoilers();
      if (res.success) {
        return {
          success: true,
          data: (res.data || []).map((b) => ({
            id: b.id,
            name: b.modelName,
            modelName: b.modelName,
            basePrice: b.basePrice || b.costBreakdown?.totalCost || 0,
          })),
        };
      }
      return { success: false, data: [] };
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
          fullName: e.full_name || '',
          positionName: e.position_name || e.role || 'Xodim',
        })),
      };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  async getSalesStatuses() {
    return {
      success: true,
      data: [
        { value: 'COMPLETED', label: 'Yakunlangan' },
        { value: 'PENDING', label: 'Kutilmoqda' },
        { value: 'CANCELLED', label: 'Bekor qilingan' },
      ],
    };
  },

  async getSaleReceipt(id) {
    try {
      const response = await axiosInstance.get(`/sales/${id}/receipt/`).catch(async () => {
        return await axiosInstance.get(`/sales/${id}/receipt`);
      });
      return { success: true, data: response?.data || response };
    } catch (err) {
      console.error("getSaleReceipt error:", err);
      return { success: false, message: "Chek ma'lumotlarini yuklashda xatolik yuz berdi.", error: err };
    }
  },

  async getSaleEscpos(id) {
    try {
      const response = await axiosInstance.get(`/sales/${id}/escpos/`).catch(async () => {
        return await axiosInstance.get(`/sales/${id}/escpos`);
      });
      return { success: true, data: response?.data || response };
    } catch (err) {
      console.error("getSaleEscpos error:", err);
      return { success: false, message: "ESC/POS ma'lumotlarini yuklashda xatolik yuz berdi.", error: err };
    }
  },
};
