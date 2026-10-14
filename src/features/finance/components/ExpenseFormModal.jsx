import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { Button } from '@/components/common/Button/Button';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { documentNumberingService } from '@/services/documentNumbering.service';
import { useFormDraftStore } from '@/store/useFormDraftStore';
import { ROUTES } from '@/constants/routes.constants';
import { LuChevronDown, LuChevronUp, LuSlidersHorizontal, LuFileCheck } from 'react-icons/lu';

import { getActiveCurrency } from '@/utils/currency.utils';

export const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  expenseRecord = null,
}) => {
  const FORM_KEY = expenseRecord ? `draft_expense_${expenseRecord.id}` : 'draft_expense_new';
  const { saveDraft, getDraft, clearDraft } = useFormDraftStore();

  const [expenseTypeOptions, setExpenseTypeOptions] = useState(dynamicSettingsService.getExpenseTypeOptions());
  const [currencyOptions, setCurrencyOptions] = useState(dynamicSettingsService.getCurrencyOptions());

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  const [formData, setFormData] = useState({
    expenseNumber: '',
    expenseTypeId: expenseTypeOptions[0]?.value || '',
    amount: 1000,
    currency: getActiveCurrency(),
    paymentMethod: 'Bank O\'tkazmasi',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    if (expenseRecord) {
      setFormData({
        expenseNumber: expenseRecord.expenseNumber || '',
        expenseTypeId: expenseRecord.expenseTypeId || (expenseTypeOptions[0]?.value || ''),
        amount: expenseRecord.amount || 1000,
        currency: expenseRecord.currency || getActiveCurrency(),
        paymentMethod: expenseRecord.paymentMethod || 'Bank O\'tkazmasi',
        date: expenseRecord.date || new Date().toISOString().split('T')[0],
        description: expenseRecord.description || '',
      });
      setIsDraftRestored(false);
    } else if (isOpen) {
      const savedDraft = getDraft(FORM_KEY);
      if (savedDraft) {
        setFormData(savedDraft);
        setIsDraftRestored(true);
      } else {
        setFormData({
          expenseNumber: documentNumberingService.generateNumber('FINANCE'),
          expenseTypeId: expenseTypeOptions[0]?.value || '',
          amount: 1000,
          currency: getActiveCurrency(),
          paymentMethod: 'Bank O\'tkazmasi',
          date: new Date().toISOString().split('T')[0],
          description: '',
        });
        setIsDraftRestored(false);
      }
      setShowAdvanced(false);
    }
  }, [expenseRecord, isOpen]);

  const handleFieldChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (!expenseRecord) {
      saveDraft(FORM_KEY, updated);
    }
  };

  const handleAddNewExpenseType = (newRecord) => {
    const newET = { value: `et_${Date.now()}`, label: newRecord.name };
    setExpenseTypeOptions((prev) => [...prev, newET]);
    handleFieldChange('expenseTypeId', newET.value);
    return newET;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedType = expenseTypeOptions.find((t) => t.value === formData.expenseTypeId);

    clearDraft(FORM_KEY);
    onSubmit({
      ...formData,
      expenseTypeName: selectedType ? selectedType.label : '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2">
          <span>{expenseRecord ? "Xarajat Hujjatini Tahrirlash" : "Yangi Operatsion Xarajat Kiritish"}</span>
          {isDraftRestored && (
            <span className="badge bg-success bg-opacity-10 text-success fs-8 d-flex align-items-center gap-1">
              <LuFileCheck /> Qoralama tiklandi
            </span>
          )}
        </div>
      }
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {expenseRecord ? 'Saqlash' : "Xarajatni Rasmiylashtirish"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Core Header Fields */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <Input
              label="Xarajat Hujjati №"
              placeholder="EXP-2026-000801"
              value={formData.expenseNumber}
              onChange={(e) => handleFieldChange('expenseNumber', e.target.value)}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Xarajat Turi (Expense Type)"
              value={formData.expenseTypeId}
              onChange={(e) => handleFieldChange('expenseTypeId', e.target.value)}
              options={expenseTypeOptions}
              managePath={ROUTES.PROTECTED.SETTINGS_EXPENSE_TYPES}
              onAddNew={handleAddNewExpenseType}
              entityTitle="Xarajat Turi"
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <Input
              label="Xarajat Summasi"
              type="number"
              min="0"
              value={formData.amount}
              onChange={(e) => handleFieldChange('amount', e.target.value)}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <Select
              label="Valyuta"
              value={formData.currency}
              onChange={(e) => handleFieldChange('currency', e.target.value)}
              options={currencyOptions}
            />
          </div>
        </div>

        {/* Collapsible Section for Progressive Disclosure */}
        <div className="border-custom rounded-3 p-2 mb-3 bg-body-custom">
          <button
            type="button"
            className="btn btn-link text-decoration-none text-main fs-7 fw-semibold d-flex align-items-center justify-content-between w-100 p-1"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="d-flex align-items-center gap-2">
              <LuSlidersHorizontal className="text-primary" />
              <span>To'lov Usuli, Sana, Tavsif va Schyot-Fakturalar</span>
            </div>
            {showAdvanced ? <LuChevronUp /> : <LuChevronDown />}
          </button>

          {showAdvanced && (
            <div className="row g-3 pt-3 border-top border-custom mt-2">
              <div className="col-12 col-md-6">
                <Input
                  label="To'lov Usuli va Manbai"
                  placeholder="Bank o'tkazmasi / Korxona hisob-raqami..."
                  value={formData.paymentMethod}
                  onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <Input
                  label="Xarajat Bajarilgan Sana"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Xarajat Maqsadi va Tavsifi</label>
                <textarea
                  className="form-control fs-7"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Sex uskunalari elektr to'lovi yoki vedomost izohi..."
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Chek va Schyot-Fakturalarni Yuklash</label>
                <FileUpload label="To'lov topshiriqnomasi va cheklarni yuklash" maxSizeMB={5} />
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
