import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { EntityPreviewCard } from '@/components/common/EntityPreviewCard/EntityPreviewCard';
import { CalculationBreakdown } from '@/components/common/CalculationBreakdown/CalculationBreakdown';
import { salesApi } from '../api/salesApi';
import { businessRulesService } from '@/services/businessRules.service';
import { documentNumberingService } from '@/services/documentNumbering.service';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency.utils';
import { LuPlus, LuTrash2, LuSave } from 'react-icons/lu';

export const SaleFormModal = ({ isOpen, onClose, sale, onSave }) => {
  const [customers, setCustomers] = useState([]);
  const [boilers, setBoilers] = useState([]);
  const [salesStatuses, setSalesStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    boilerId: '',
    quantity: 1,
    unitPrice: 0,
    discountAmount: 0,
    taxRate: 12,
    status: 'COMPLETED',
    saleDate: new Date().toISOString().split('T')[0],
    assignedEmployeeId: '',
    assignedEmployeeName: '',
    warrantyPeriod: '24 oy',
    warrantyStartDate: new Date().toISOString().split('T')[0],
    warrantyEndDate: '',
    deliveryLocation: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSelectData();
  }, []);

  useEffect(() => {
    if (sale) {
      setFormData({
        invoiceNumber: sale.invoiceNumber || '',
        customerId: sale.customerId || '',
        boilerId: sale.boilerId || '',
        quantity: sale.quantity || 1,
        unitPrice: sale.unitPrice || 0,
        discountAmount: sale.discountAmount || 0,
        taxRate: sale.taxRate || 12,
        status: sale.status || 'COMPLETED',
        saleDate: sale.saleDate || new Date().toISOString().split('T')[0],
        assignedEmployeeId: sale.assignedEmployeeId || '',
        assignedEmployeeName: sale.assignedEmployeeName || '',
        warrantyPeriod: sale.warrantyPeriod || '24 oy',
        warrantyStartDate: sale.warrantyStartDate || sale.saleDate || new Date().toISOString().split('T')[0],
        warrantyEndDate: sale.warrantyEndDate || '',
        deliveryLocation: sale.deliveryLocation || '',
        notes: sale.notes || '',
      });
    } else {
      const autoNumber = documentNumberingService.generateNumber('SALES');
      const today = new Date().toISOString().split('T')[0];
      const twoYearsLater = new Date();
      twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);
      const twoYearsLaterStr = twoYearsLater.toISOString().split('T')[0];

      setFormData({
        invoiceNumber: autoNumber,
        customerId: '',
        boilerId: '',
        quantity: 1,
        unitPrice: 0,
        discountAmount: 0,
        taxRate: 12,
        status: 'COMPLETED',
        saleDate: today,
        assignedEmployeeId: '',
        assignedEmployeeName: '',
        warrantyPeriod: '24 oy',
        warrantyStartDate: today,
        warrantyEndDate: twoYearsLaterStr,
        deliveryLocation: '',
        notes: '',
      });
    }
    setErrors({});
  }, [sale, isOpen]);

  const loadSelectData = async () => {
    const [custRes, boilRes, stRes, empRes] = await Promise.all([
      salesApi.getCustomersList(),
      salesApi.getBoilersList(),
      salesApi.getSalesStatuses(),
      salesApi.getEmployeesList(),
    ]);

    if (custRes.success) setCustomers(custRes.data);
    if (boilRes.success) setBoilers(boilRes.data);
    if (stRes.success) setSalesStatuses(stRes.data);
    if (empRes.success) setEmployees(empRes.data);
  };

  const selectedBoiler = boilers.find((b) => b.id === formData.boilerId);

  useEffect(() => {
    if (selectedBoiler && !sale) {
      setFormData((prev) => ({ ...prev, unitPrice: selectedBoiler.basePrice }));
    }
  }, [formData.boilerId, selectedBoiler, sale]);

  useEffect(() => {
    if (formData.customerId && customers.length > 0 && boilers.length > 0 && !sale) {
      const selectedCust = customers.find((c) => c.id === formData.customerId);
      if (selectedCust && selectedCust.boilerModelName) {
        const assignedNames = selectedCust.boilerModelName.split(', ').filter(Boolean);
        if (assignedNames.length > 0) {
          const matchingBoiler = boilers.find((b) =>
            assignedNames.some((name) => (b.name || b.modelName || '').toLowerCase().includes(name.toLowerCase()))
          );
          if (matchingBoiler) {
            setFormData((prev) => ({ 
              ...prev, 
              boilerId: matchingBoiler.id,
              unitPrice: matchingBoiler.basePrice || prev.unitPrice 
            }));
          }
        }
      }
    }
  }, [formData.customerId, customers, boilers, sale]);

  const selectedCustomerObj = customers.find((c) => c.id === formData.customerId);

  useEffect(() => {
    if (selectedCustomerObj && !sale) {
      setFormData((prev) => ({
        ...prev,
        deliveryLocation: selectedCustomerObj.address || selectedCustomerObj.region || prev.deliveryLocation,
      }));
    }
  }, [formData.customerId, selectedCustomerObj, sale]);

  const handleStartDateChange = (dateVal) => {
    setFormData((prev) => {
      const start = new Date(dateVal);
      let durationMonths = 24;
      if (prev.warrantyPeriod.toLowerCase().includes('12')) durationMonths = 12;
      else if (prev.warrantyPeriod.toLowerCase().includes('36')) durationMonths = 36;
      else if (prev.warrantyPeriod.toLowerCase().includes('6')) durationMonths = 6;
      
      const end = new Date(start);
      end.setMonth(end.getMonth() + durationMonths);
      return {
        ...prev,
        warrantyStartDate: dateVal,
        warrantyEndDate: end.toISOString().split('T')[0],
      };
    });
  };

  const handlePeriodChange = (periodVal) => {
    setFormData((prev) => {
      const start = prev.warrantyStartDate ? new Date(prev.warrantyStartDate) : new Date();
      let durationMonths = 24;
      if (periodVal.toLowerCase().includes('12')) durationMonths = 12;
      else if (periodVal.toLowerCase().includes('36')) durationMonths = 36;
      else if (periodVal.toLowerCase().includes('6')) durationMonths = 6;
      
      const end = new Date(start);
      end.setMonth(end.getMonth() + durationMonths);
      return {
        ...prev,
        warrantyPeriod: periodVal,
        warrantyEndDate: end.toISOString().split('T')[0],
      };
    });
  };

  const subtotal = formData.quantity * formData.unitPrice;
  const financialTotals = businessRulesService.calculateFinancialTotals({
    subtotal,
    discountAmount: Number(formData.discountAmount),
    taxRate: Number(formData.taxRate),
  });

  const validate = () => {
    const errs = {};
    if (!formData.customerId) errs.customerId = 'Mijoz korxonani tanlang';
    if (!formData.boilerId) errs.boilerId = 'Kotyol modelini tanlang';
    if (formData.quantity <= 0) errs.quantity = "Sotuv miqdori 0 dan katta bo'lishi kerak";
    if (formData.unitPrice <= 0) errs.unitPrice = 'Sotuv narxi 0 dan katta bo\'lishi kerak';
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

    if (sale) {
      await salesApi.updateSale(sale.id, payload);
    } else {
      await salesApi.createSale(payload);
    }

    onSave();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sale ? "Sotuv Hujjatini Tahrirlash" : "Yangi Sotuv Hujjatini Rasmiylashtirish"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div className="row g-2">
          <div className="col-12 col-md-4">
            <Input label="Schyot-Faktura №" value={formData.invoiceNumber} readOnly />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label="Sotuv Sanasi"
              type="date"
              value={formData.saleDate}
              onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={salesStatuses.map((s) => ({ value: s.code, label: s.name }))}
            />
          </div>
        </div>

          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Mijoz Korxona"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              error={errors.customerId}
              options={customers.map((c) => ({ value: c.id, label: c.customerName || c.name }))}
              placeholder="Mijozni tanlang"
              required
              managePath="/customers"
              entityType="Customer"
            />
          </div>

          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Kotyol Modeli"
              value={formData.boilerId}
              onChange={(e) => setFormData({ ...formData, boilerId: e.target.value })}
              error={errors.boilerId}
              options={(() => {
                const selectedCust = customers.find((c) => c.id === formData.customerId);
                const assignedNames = selectedCust?.boilerModelName?.split(', ').filter(Boolean) || [];
                const filtered = boilers.filter((b) => {
                  if (assignedNames.length === 0) return true;
                  return assignedNames.some((name) =>
                    (b.name || b.modelName || '').toLowerCase().includes(name.toLowerCase())
                  );
                });
                const finalBoilers = filtered.length > 0 ? filtered : boilers;
                return finalBoilers.map((b) => ({ value: b.id, label: b.name || b.modelName }));
              })()}
              placeholder="Kotyol modelini tanlang"
              required
              managePath="/boilers"
              entityType="Boiler"
            />
          </div>

        {selectedCustomerObj && (
          <EntityPreviewCard
            type="CUSTOMER"
            data={selectedCustomerObj}
          />
        )}

        <div className="row g-2">
          <div className="col-12 col-md-4">
            <Input
              label="Sotuv Miqdori"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              error={errors.quantity}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label={`Sotuv Narxi (${getCurrencySymbol()})`}
              type="number"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              error={errors.unitPrice}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label={`Chegirma (${getCurrencySymbol()})`}
              type="number"
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="row g-2 border-top border-custom pt-3 mt-2">
          <h6 className="fw-semibold text-main font-heading mb-1 col-12">Mas'ul va Kafolat Tafsilotlari</h6>
          
          <div className="col-12 col-md-6">
            <Select
              label="Sotuvga mas'ul xodim"
              value={formData.assignedEmployeeId}
              onChange={(e) => {
                const emp = employees.find((emp) => emp.id === e.target.value);
                setFormData({
                  ...formData,
                  assignedEmployeeId: e.target.value,
                  assignedEmployeeName: emp ? emp.fullName : '',
                });
              }}
              options={[
                { value: '', label: 'Xodimni tanlang' },
                ...employees.map((e) => ({ value: e.id, label: `${e.fullName} (${e.positionName})` }))
              ]}
            />
          </div>

          <div className="col-12 col-md-6">
            <Input
              label="Yetkazib berish manzili"
              value={formData.deliveryLocation}
              onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
              placeholder="Faktura bo'yicha manzil..."
            />
          </div>

          <div className="col-12 col-md-4">
            <Select
              label="Kafolat muddati"
              value={formData.warrantyPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              options={[
                { value: '6 oy', label: '6 oy' },
                { value: '12 oy', label: '12 oy (1 yil)' },
                { value: '24 oy', label: '24 oy (2 yil)' },
                { value: '36 oy', label: '36 oy (3 yil)' },
              ]}
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label="Kafolat boshlanish sanasi"
              type="date"
              value={formData.warrantyStartDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label="Kafolat tugash sanasi"
              type="date"
              value={formData.warrantyEndDate}
              onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
            />
          </div>

          <div className="col-12">
            <label className="form-label fs-7 fw-medium text-main">Sotuv bo'yicha maxsus izoh yoki shartlar</label>
            <textarea
              className="form-control fs-7"
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Shartnoma shartlari, to'lov rejasi yoki boshqa eslatmalar..."
            ></textarea>
          </div>
        </div>

        <hr className="border-custom my-2" />

        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-7">
            <CalculationBreakdown
              title="Sotuv Hisob-Kitobi va Soliq"
              formula="Jami = (Oraliq - Chegirma) + QQS (12%)"
              totalLabel="Jami Sotuv Summasi"
              totalValue={financialTotals.totalAmount}
              items={[
                { label: 'Boshlang\'ich Qiymat', value: formatCurrency(subtotal) },
                { label: 'Chegirma', value: `-${formatCurrency(formData.discountAmount)}` },
                { label: `Soliq (QQS ${formData.taxRate}%)`, value: formatCurrency(financialTotals.taxAmount) },
              ]}
            />
          </div>

          <div className="col-12 col-md-5 text-end">
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
