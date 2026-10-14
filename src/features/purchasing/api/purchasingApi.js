import { axiosInstance } from '@/api/axiosInstance';

const isValidUUID = (str) =>
  typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const mapPurchase = (item) => {
  if (!item) return null;
  const itemsList = Array.isArray(item.items) ? item.items : [];
  return {
    id: item.id,
    purchaseNumber: item.purchase_number || `PO-${item.id?.slice(0, 8)}`,
    supplierId: item.supplier_id,
    supplierName: item.supplier_name || '',
    warehouseId: item.warehouse_id,
    warehouseName: item.warehouse_name || '',
    invoiceNumber: item.invoice_number || '',
    orderDate: item.order_date || new Date().toISOString().split('T')[0],
    taxAmount: Number(item.tax_amount) || 0,
    exchangeRate: Number(item.exchange_rate_at_creation) || 1,
    subtotal: Number(item.subtotal) || 0,
    totalAmount: Number(item.total_amount) || 0,
    status: item.status || 'PENDING',
    items: itemsList.map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name || '',
      internalCode: i.product_code || '',
      quantity: Number(i.quantity) || 0,
      unitPrice: Number(i.unit_price) || 0,
      purchasePrice: Number(i.unit_price) || 0,
      totalPrice: Number(i.total_price) || 0,
      unitName: i.unit_name || i.unit_symbol || '',
    })),
    timeline: [],
  };
};

export const purchasingApi = {
  getPurchases: async (filters = {}) => {
    try {
      const params = {
        status: filters.status || undefined,
        page: 1,
        limit: 100,
      };

      const response = await axiosInstance.get('/purchasing', { params });
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = items.map(mapPurchase).filter(Boolean);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.purchaseNumber.toLowerCase().includes(q) ||
            p.supplierName.toLowerCase().includes(q) ||
            p.invoiceNumber.toLowerCase().includes(q)
        );
      }

      if (filters.supplierId) {
        result = result.filter((p) => p.supplierId === filters.supplierId);
      }

      if (filters.warehouseId) {
        result = result.filter((p) => p.warehouseId === filters.warehouseId);
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getPurchases error:", err);
      return { success: false, data: [], error: err };
    }
  },

  getPurchaseById: async (id) => {
    try {
      const response = await axiosInstance.get('/purchasing');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const item = items.find((p) => String(p.id) === String(id));
      return { success: true, data: mapPurchase(item) };
    } catch (err) {
      console.error("getPurchaseById error:", err);
      return { success: false, data: null, error: err };
    }
  },

  createPurchase: async (purchaseData) => {
    try {
      let targetSupplierId = purchaseData.supplierId;
      let targetWarehouseId = purchaseData.warehouseId;

      if (!isValidUUID(targetSupplierId)) {
        const supRes = await axiosInstance.get('/master-data/suppliers').catch(() => null);
        const sups = Array.isArray(supRes?.data) ? supRes.data : Array.isArray(supRes) ? supRes : [];
        if (sups[0]?.id) targetSupplierId = sups[0].id;
      }

      if (!isValidUUID(targetWarehouseId)) {
        const whRes = await axiosInstance.get('/master-data/warehouses').catch(() => null);
        const whs = Array.isArray(whRes?.data) ? whRes.data : Array.isArray(whRes) ? whRes : [];
        if (whs[0]?.id) targetWarehouseId = whs[0].id;
      }

      let realProducts = [];
      try {
        const prodRes = await axiosInstance.get('/products').catch(() => null);
        realProducts = Array.isArray(prodRes?.data) ? prodRes.data : Array.isArray(prodRes) ? prodRes : [];
      } catch {
        realProducts = [];
      }

      const itemsPayload = (purchaseData.items || [])
        .map((i) => {
          let pId = i.productId;
          if (!isValidUUID(pId)) {
            const foundP = realProducts.find((p) => p.name?.toLowerCase() === i.productName?.toLowerCase());
            pId = foundP?.id || realProducts[0]?.id || null;
          }
          return {
            product_id: pId,
            quantity: Number(i.quantity) || 1,
            unit_price: Number(i.unitPrice || i.purchasePrice) || 0,
            avg_unit_cost: Number(i.unitPrice || i.purchasePrice) || 0,
          };
        })
        .filter((i) => isValidUUID(i.product_id));

      const payload = {
        purchase_number: purchaseData.purchaseNumber || `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
        supplier_id: targetSupplierId,
        warehouse_id: targetWarehouseId,
        invoice_number: purchaseData.invoiceNumber || null,
        order_date: purchaseData.orderDate || new Date().toISOString().split('T')[0],
        tax_amount: Number(purchaseData.taxAmount) || 0.0,
        exchange_rate_at_creation: Number(purchaseData.exchangeRate) || 1.0,
        items: itemsPayload,
      };

      const response = await axiosInstance.post('/purchasing', payload);
      const itemData = response?.data || response;
      return { success: true, data: mapPurchase(itemData), message: "Xarid buyurtmasi muvaffaqiyatli saqlandi." };
    } catch (err) {
      console.error("createPurchase error:", err);
      return { success: false, error: err, message: "Xarid buyurtmasini saqlashda xatolik yuz berdi." };
    }
  },

  updatePurchase: async (id, purchaseData) => {
    try {
      let targetSupplierId = purchaseData.supplierId;
      let targetWarehouseId = purchaseData.warehouseId;

      let realProducts = [];
      try {
        const prodRes = await axiosInstance.get('/products').catch(() => null);
        realProducts = Array.isArray(prodRes?.data) ? prodRes.data : Array.isArray(prodRes) ? prodRes : [];
      } catch {
        realProducts = [];
      }

      const itemsPayload = (purchaseData.items || [])
        .map((i) => {
          let pId = i.productId;
          if (!isValidUUID(pId)) {
            const foundP = realProducts.find((p) => p.name?.toLowerCase() === i.productName?.toLowerCase());
            pId = foundP?.id || realProducts[0]?.id || null;
          }
          return {
            product_id: pId,
            quantity: Number(i.quantity) || 1,
            unit_price: Number(i.unitPrice || i.purchasePrice) || 0,
            avg_unit_cost: Number(i.unitPrice || i.purchasePrice) || 0,
          };
        })
        .filter((i) => isValidUUID(i.product_id));

      const payload = {
        purchase_number: purchaseData.purchaseNumber,
        supplier_id: targetSupplierId,
        warehouse_id: targetWarehouseId,
        invoice_number: purchaseData.invoiceNumber || null,
        order_date: purchaseData.orderDate || new Date().toISOString().split('T')[0],
        tax_amount: Number(purchaseData.taxAmount) || 0.0,
        exchange_rate_at_creation: Number(purchaseData.exchangeRate) || 1.0,
        items: itemsPayload,
      };

      const response = await axiosInstance.put(`/purchasing/${id}`, payload);
      const itemData = response?.data || response;
      return { success: true, data: mapPurchase(itemData), message: "Xarid buyurtmasi muvaffaqiyatli yangilandi." };
    } catch (err) {
      console.error("updatePurchase error:", err);
      return { success: false, error: err, message: "Xarid buyurtmasini yangilashda xatolik yuz berdi." };
    }
  },

  updatePurchaseStatus: async (id, newStatus) => {
    try {
      const response = await axiosInstance.put(`/purchasing/${id}/status`, { status: newStatus });
      const itemData = response?.data || response;
      return {
        success: true,
        data: mapPurchase(itemData),
        message: `Xarid statusi '${newStatus}' ga o'zgartirildi.`,
      };
    } catch (err) {
      console.error("updatePurchaseStatus error:", err);
      return { success: false, error: err, message: "Statusni yangilashda xatolik yuz berdi." };
    }
  },

  deletePurchase: async (id) => {
    try {
      await axiosInstance.delete(`/purchasing/${id}`);
      return { success: true, message: "Xarid buyurtmasi o'chirildi." };
    } catch (err) {
      console.error("deletePurchase error:", err);
      return { success: false, error: err, message: "Xarid buyurtmasini o'chirishda xatolik yuz berdi." };
    }
  },

  getSuppliersList: async () => {
    try {
      const response = await axiosInstance.get('/master-data/suppliers');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items.map((s) => ({ id: s.id, name: s.name })) };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  getWarehousesList: async () => {
    try {
      const response = await axiosInstance.get('/master-data/warehouses');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items.map((w) => ({ id: w.id, name: w.name })) };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  getProductsList: async () => {
    try {
      const response = await axiosInstance.get('/products');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items.map((p) => ({ id: p.id, name: p.name, unit: p.unit_symbol || 'dona' })) };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  getPurchasingStatuses: async () => {
    return {
      success: true,
      data: [
        { value: 'PENDING', label: 'Kutilmoqda' },
        { value: 'APPROVED', label: 'Tasdiqlangan' },
        { value: 'ORDERED', label: 'Buyurtma qilingan' },
        { value: 'RECEIVED', label: 'Qabul qilingan' },
        { value: 'CANCELLED', label: 'Bekor qilingan' },
      ],
    };
  },

  receiveStock: async (id) => {
    try {
      const response = await axiosInstance.put(`/purchasing/${id}/status`, { status: 'RECEIVED' });
      const itemData = response?.data || response;
      return { success: true, data: mapPurchase(itemData), message: "Xarid buyurtmasi omborga qabul qilindi." };
    } catch (err) {
      console.error("receiveStock error:", err);
      return { success: false, error: err, message: "Qabul qilishda xatolik yuz berdi." };
    }
  },
};
