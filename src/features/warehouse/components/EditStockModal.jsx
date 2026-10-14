import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { Button } from '@/components/common/Button/Button';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { getCurrencySymbol } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const EditStockModal = ({ isOpen, onClose, onSubmit, stockItem = null }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);

  const [formData, setFormData] = useState({
    productName: '',
    internalCode: '',
    categoryId: '',
    materialTypeId: '',
    warehouseId: '',
    quantity: 0,
    unitName: 'dona',
    purchasePrice: 0,
    minQuantity: 10,
    status: 'ACTIVE',
    description: '',
  });

  useEffect(() => {
    const cats = dynamicSettingsService.getCategoryOptions();
    const mats = dynamicSettingsService.getMaterialTypeOptions();
    const whs = dynamicSettingsService.getWarehouseOptions();
    setCategoryOptions(cats);
    setMaterialOptions(mats);
    setWarehouseOptions(whs);

    if (stockItem) {
      const foundCat = cats.find(
        (c) => String(c.value) === String(stockItem.categoryId) || c.label === stockItem.categoryName
      );
      const foundMat = mats.find(
        (m) => String(m.value) === String(stockItem.materialTypeId) || m.label === stockItem.materialTypeName
      );
      const foundWH = whs.find(
        (w) => String(w.value) === String(stockItem.warehouseId) || w.label === stockItem.warehouseName
      );

      setFormData({
        productName: stockItem.productName || '',
        internalCode: stockItem.internalCode || '',
        categoryId: foundCat ? foundCat.value : (stockItem.categoryId || cats[0]?.value || ''),
        materialTypeId: foundMat ? foundMat.value : (stockItem.materialTypeId || mats[0]?.value || ''),
        warehouseId: foundWH ? foundWH.value : (stockItem.warehouseId || whs[0]?.value || ''),
        quantity: stockItem.quantity ?? 0,
        unitName: stockItem.unitName || 'dona',
        purchasePrice: stockItem.purchasePrice ?? stockItem.unitPrice ?? 0,
        minQuantity: stockItem.minQuantity ?? 10,
        status: stockItem.status || 'ACTIVE',
        description: stockItem.description || '',
      });
    }
  }, [stockItem, isOpen]);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const selectedCat = categoryOptions.find((c) => String(c.value) === String(formData.categoryId));
    const selectedMat = materialOptions.find((m) => String(m.value) === String(formData.materialTypeId));
    const selectedWH = warehouseOptions.find((w) => String(w.value) === String(formData.warehouseId));

    const units = dynamicSettingsService.getUnits() || [];
    const foundUnit = units.find((u) => u.name === formData.unitName || u.shortName === formData.unitName);
    const unitId = foundUnit ? foundUnit.id : (stockItem?.unitId || '');

    onSubmit({
      ...stockItem,
      productName: formData.productName,
      internalCode: formData.internalCode,
      categoryId: formData.categoryId,
      categoryName: selectedCat ? selectedCat.label : (stockItem?.categoryName || '-'),
      materialTypeId: formData.materialTypeId,
      materialTypeName: selectedMat ? selectedMat.label : '',
      warehouseId: formData.warehouseId,
      warehouseName: selectedWH ? selectedWH.label : (stockItem?.warehouseName || 'Asosiy Ombor'),
      quantity: Number(formData.quantity) || 0,
      unitName: formData.unitName || 'dona',
      unitId,
      purchasePrice: Number(formData.purchasePrice) || 0,
      unitPrice: Number(formData.purchasePrice) || 0,
      currentValue: (Number(formData.quantity) || 0) * (Number(formData.purchasePrice) || 0),
      minQuantity: Number(formData.minQuantity) || 10,
      status: formData.status,
      description: formData.description,
    });
  };

  if (!stockItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ombor Zaxirasini Tahrirlash: ${stockItem.productName}`}
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Saqlash
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-8">
            <Input
              label="Mahsulot / Xomashyo Nomi *"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              required
            />
          </div>
          <div className="col-12 col-md-4">
            <Input
              label="Ichki Kodi (SKU) *"
              value={formData.internalCode}
              onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Kategoriya"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categoryOptions}
              managePath={ROUTES.PROTECTED.SETTINGS_CATEGORIES}
              entityTitle="Kategoriya"
            />
          </div>

          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Material Turi"
              value={formData.materialTypeId}
              onChange={(e) => setFormData({ ...formData, materialTypeId: e.target.value })}
              options={materialOptions}
              managePath={ROUTES.PROTECTED.SETTINGS_MATERIAL_TYPES}
              entityTitle="Material Turi"
            />
          </div>

          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Joylashgan Ombor"
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              options={warehouseOptions}
              managePath={ROUTES.PROTECTED.SETTINGS_WAREHOUSE}
              entityTitle="Ombor"
            />
          </div>

          <div className="col-12 col-md-6">
            <Input
              label="O'lchov Birligi"
              value={formData.unitName}
              onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label="Mavjud Ombor Zaxirasi"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label={`Birlik Narxi (${getCurrencySymbol()})`}
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label="Minimal Chegara Miqdori"
              type="number"
              value={formData.minQuantity}
              onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-6">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Faol' },
                { value: 'INACTIVE', label: 'Nofaol' },
              ]}
            />
          </div>

          <div className="col-12">
            <label className="form-label fs-7 fw-medium text-main">Texnik Parametrlari va Tavsifi</label>
            <textarea
              className="form-control fs-7"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Markasi, GOST standarti va o'lchamlari..."
            ></textarea>
          </div>
        </div>
      </form>
    </Modal>
  );
};
