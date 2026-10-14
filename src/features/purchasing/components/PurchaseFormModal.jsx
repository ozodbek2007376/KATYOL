import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { PurchaseItemsTable } from './PurchaseItemsTable';
import { EntityPreviewCard } from '@/components/common/EntityPreviewCard/EntityPreviewCard';
import { CalculationBreakdown } from '@/components/common/CalculationBreakdown/CalculationBreakdown';
import { purchasingApi } from '../api/purchasingApi';
import { businessRulesService } from '@/services/businessRules.service';
import { documentNumberingService } from '@/services/documentNumbering.service';
import { formatCurrency, getActiveCurrency } from '@/utils/currency.utils';
import { LuPlus, LuSave } from 'react-icons/lu';

export const PurchaseFormModal = ({ isOpen, onClose, purchase, onSave }) => {

  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [purchasingStatuses, setPurchasingStatuses] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    purchaseNumber: '',
    supplierId: '',
    warehouseId: '',
    invoiceNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    currency: getActiveCurrency(),
    taxRate: 12,
    status: 'DRAFT',
    items: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSelectData();
  }, []);

  useEffect(() => {
    if (purchase) {
      setFormData({
        purchaseNumber: purchase.purchaseNumber || '',
        supplierId: purchase.supplierId || '',
        warehouseId: purchase.warehouseId || '',
        invoiceNumber: purchase.invoiceNumber || '',
        orderDate: purchase.orderDate || new Date().toISOString().split('T')[0],
        currency: purchase.currency || getActiveCurrency(),
        taxRate: purchase.taxRate || 12,
        status: purchase.status || 'DRAFT',
        items: purchase.items ? [...purchase.items] : [],
      });
    } else if (isOpen) {
      const autoNumber = documentNumberingService.generateNumber('PURCHASING');
      const autoInvoiceNumber = documentNumberingService.generateNumber('INVOICE');
      setFormData({
        purchaseNumber: autoNumber,
        supplierId: '',
        warehouseId: '',
        invoiceNumber: autoInvoiceNumber,
        orderDate: new Date().toISOString().split('T')[0],
        currency: getActiveCurrency(),
        taxRate: 12,
        status: 'DRAFT',
        items: [{ productId: '', quantity: 1, unitPrice: 0 }],
      });
    }
    setErrors({});
  }, [purchase, isOpen]);

  const loadSelectData = async () => {
    const [supRes, whRes, stRes, prodRes] = await Promise.all([
      purchasingApi.getSuppliersList(),
      purchasingApi.getWarehousesList(),
      purchasingApi.getPurchasingStatuses(),
      purchasingApi.getProductsList(),
    ]);

    if (supRes.success) setSuppliers(supRes.data);
    if (whRes.success) setWarehouses(whRes.data);
    if (stRes.success) setPurchasingStatuses(stRes.data);
    if (prodRes.success) setProducts(prodRes.data);
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculatedSubtotal = businessRulesService.calculateItemsSubtotal(formData.items);
  const financialTotals = businessRulesService.calculateFinancialTotals({
    subtotal: calculatedSubtotal,
    discountAmount: 0,
    taxRate: formData.taxRate,
  });

  const validate = () => {
    const errs = {};
    if (!formData.supplierId) errs.supplierId = "Ta'minotchi korxonan tanlang";
    if (!formData.warehouseId) errs.warehouseId = 'Kirim omborini tanlang';
    if (formData.items.length === 0) errs.items = 'Kamida 1 ta mahsulot kiriting';
    formData.items.forEach((item, i) => {
      if (!item.productId) errs[`item_${i}_product`] = 'Mahsulotni tanlang';
      if (item.quantity <= 0) errs[`item_${i}_qty`] = "Miqdor 0 dan katta bo'lishi kerak";
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...formData,
      subtotal: financialTotals.subtotal,
      taxAmount: financialTotals.taxAmount,
      totalAmount: financialTotals.totalAmount,
    };

    try {
      if (purchase) {
        await purchasingApi.updatePurchase(purchase.id, payload);
      } else {
        await purchasingApi.createPurchase(payload);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedSupplierObj = suppliers.find((s) => s.id === formData.supplierId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={purchase ? "Xarid Hujjatini Tahrirlash" : "Yangi Xarid Buyurtmasini Rasmiylashtirish"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Ta'minotchi Korxona"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              error={errors.supplierId}
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Ta'minotchini tanlang"
              required
              managePath="/suppliers"
              entityType="Supplier"
            />
          </div>

          <div className="col-12 col-md-6">
            <Select
              label="Kirim Qilinadigan Ombor"
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              error={errors.warehouseId}
              options={[
                { value: '', label: 'Omborni Tanlang' },
                ...warehouses.map((w) => ({ value: w.id, label: w.name })),
              ]}
              required
            />
          </div>
        </div>

        {selectedSupplierObj && (
          <EntityPreviewCard
            type="SUPPLIER"
            data={{
              companyName: selectedSupplierObj.name,
              phone: selectedSupplierObj.phone,
              contactPerson: selectedSupplierObj.contactPerson,
              address: selectedSupplierObj.address
            }}
          />
        )}

        <div className="row g-2">
          <div className="col-12 col-md-6">
            <Input
              label="Buyurtma Sanasi"
              type="date"
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <Select
              label="Hujjat Statusi"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={purchasingStatuses}
            />
          </div>
        </div>

        {errors.items && <small className="text-danger d-block">{errors.items}</small>}

        <PurchaseItemsTable
          items={formData.items}
          products={products}
          currency={formData.currency}
          onItemsChange={(items) => setFormData({ ...formData, items })}
        />

        <hr className="border-custom my-2" />

        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6">
            <CalculationBreakdown
              title="Xarid Hisob-Kitob Formulalari va Soliq"
              formula="Jami = Oraliq Summa + QQS (12%)"
              totalLabel="Jami Xarid Qiymati"
              totalValue={financialTotals.totalAmount}
              currency={formData.currency}
              items={[
                { label: 'Oraliq Summa', value: formatCurrency(financialTotals.subtotal, formData.currency) },
                { label: `Soliq (QQS ${formData.taxRate}%)`, value: formatCurrency(financialTotals.taxAmount, formData.currency) },
              ]}
            />
          </div>

          <div className="col-12 col-md-6 text-end">
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                Bekor Qilish
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <LuSave className="me-1" /> Saqlash
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
