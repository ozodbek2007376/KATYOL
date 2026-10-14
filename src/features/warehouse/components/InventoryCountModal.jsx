import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { Button } from '@/components/common/Button/Button';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { ROUTES } from '@/constants/routes.constants';

export const InventoryCountModal = ({ isOpen, onClose, onSubmit, products = [] }) => {
  const [inventoryReasonOptions, setInventoryReasonOptions] = useState(dynamicSettingsService.getInventoryReasonOptions());
  const productOptions = products.map((p) => ({ value: p.id || p.productId, label: p.productName || p.name }));

  const [selectedProductId, setSelectedProductId] = useState(productOptions[0]?.value || '');
  const [systemQuantity, setSystemQuantity] = useState(0);
  const [actualQuantity, setActualQuantity] = useState('');
  const [reason, setReason] = useState(inventoryReasonOptions[0]?.value || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => (p.id || p.productId) === selectedProductId);
      if (prod) setSystemQuantity(prod.quantity || prod.currentStock || 0);
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    if (isOpen) {
      const firstProdId = productOptions[0]?.value || '';
      setSelectedProductId(firstProdId);
      const prod = products.find((p) => (p.id || p.productId) === firstProdId);
      setSystemQuantity(prod ? (prod.quantity || prod.currentStock || 0) : 0);
      setActualQuantity('');
      setReason(inventoryReasonOptions[0]?.value || '');
      setNotes('');
    }
  }, [isOpen]);

  const handleAddNewReason = (newRecord) => {
    const newReas = { value: newRecord.name, label: newRecord.name };
    setInventoryReasonOptions((prev) => [...prev, newReas]);
    setReason(newReas.value);
    return newReas;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prod = products.find((p) => (p.id || p.productId) === selectedProductId);

    onSubmit({
      productId: selectedProductId,
      productName: prod ? (prod.productName || prod.name) : '',
      unitName: prod ? prod.unitName : 'dona',
      systemQuantity: parseFloat(systemQuantity) || 0,
      actualQuantity: parseFloat(actualQuantity) || 0,
      reason,
      notes,
    });
  };

  const diff = actualQuantity !== '' ? parseFloat(actualQuantity) - systemQuantity : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inventarizatsiya Sanoq Natijasini Kiritish"
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Sanoqni Saqlash
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <Select
              label="Inventarizatsiya Qilingan Mahsulot"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={productOptions}
            />
          </div>
          <div className="col-12 col-md-4">
            <Input
              label="Tizimdagi Miqdor"
              value={systemQuantity}
              disabled
            />
          </div>
          <div className="col-12 col-md-4">
            <Input
              label="Haqiqiy Sanoq Miqdori"
              placeholder="8500"
              type="number"
              value={actualQuantity}
              onChange={(e) => setActualQuantity(e.target.value)}
              required
            />
          </div>
          <div className="col-12 col-md-4">
            <div className="mb-3">
              <label className="form-label fs-7 fw-medium text-main d-block">Hisoblangan Farq</label>
              <div
                className={`form-control fs-7 fw-bold read-only ${
                  diff < 0 ? 'text-danger bg-danger bg-opacity-10' : diff > 0 ? 'text-success bg-success bg-opacity-10' : 'text-main'
                }`}
              >
                {diff > 0 ? `+${diff}` : diff}
              </div>
            </div>
          </div>

          {/* Dynamic Inventory Reason Select */}
          <div className="col-12">
            <DynamicSelect
              label="Inventarizatsiya Sababi"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={inventoryReasonOptions}
              managePath={ROUTES.PROTECTED.SETTINGS}
              onAddNew={handleAddNewReason}
              entityTitle="Inventarizatsiya Sababi"
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label fs-7 fw-medium text-main">Tekshiruv Izohi</label>
            <textarea
              className="form-control fs-7"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fizik sanoq dalolatnomasi va sabablari..."
            ></textarea>
          </div>
        </div>
      </form>
    </Modal>
  );
};
