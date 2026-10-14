import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { Button } from '@/components/common/Button/Button';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const RevaluationFormModal = ({ isOpen, onClose, onSubmit, products = [] }) => {
  const [revaluationReasonOptions, setRevaluationReasonOptions] = useState(dynamicSettingsService.getRevaluationReasonOptions());
  const productOptions = products.map((p) => ({ value: p.id || p.productId, label: p.productName || p.name }));

  const [selectedProductId, setSelectedProductId] = useState(productOptions[0]?.value || '');
  const [previousPrice, setPreviousPrice] = useState(0);
  const [newPrice, setNewPrice] = useState('');
  const [reason, setReason] = useState(revaluationReasonOptions[0]?.value || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => (p.id || p.productId) === selectedProductId);
      if (prod) setPreviousPrice(prod.unitPrice || prod.purchasePrice || 0);
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    if (isOpen) {
      const firstProdId = productOptions[0]?.value || '';
      setSelectedProductId(firstProdId);
      const prod = products.find((p) => (p.id || p.productId) === firstProdId);
      setPreviousPrice(prod ? (prod.unitPrice || prod.purchasePrice || 0) : 0);
      setNewPrice('');
      setReason(revaluationReasonOptions[0]?.value || '');
      setNotes('');
    }
  }, [isOpen]);

  const handleAddNewReason = (newRecord) => {
    const newReas = { value: newRecord.name, label: newRecord.name };
    setRevaluationReasonOptions((prev) => [...prev, newReas]);
    setReason(newReas.value);
    return newReas;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prod = products.find((p) => (p.id || p.productId) === selectedProductId);

    onSubmit({
      productId: selectedProductId,
      productName: prod ? (prod.productName || prod.name) : '',
      previousPrice: parseFloat(previousPrice) || 0,
      newPrice: parseFloat(newPrice) || 0,
      reason,
      notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mahsulot Tannarxini Qayta Baholash"
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Narxni Yangilash
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <Select
              label="Qayta Baholanadigan Mahsulot"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={productOptions}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label={`Amaldagi Narx (${getCurrencySymbol()})`}
              value={formatCurrency(previousPrice)}
              disabled
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label={`Yangi Narx (${getCurrencySymbol()})`}
              placeholder="5.20"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />
          </div>

          {/* Dynamic Revaluation Reason Select */}
          <div className="col-12">
            <DynamicSelect
              label="Qayta Baholash Sababi"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={revaluationReasonOptions}
              managePath={ROUTES.PROTECTED.SETTINGS}
              onAddNew={handleAddNewReason}
              entityTitle="Qayta Baholash Sababi"
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label fs-7 fw-medium text-main">Asoslash va Izohlar</label>
            <textarea
              className="form-control fs-7"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Birja narxi o'zgarishi yoki import shartnomasi ma'lumoti..."
            ></textarea>
          </div>
        </div>
      </form>
    </Modal>
  );
};
