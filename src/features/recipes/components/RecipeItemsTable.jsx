import React, { useState } from 'react';
import { LuPlus, LuTrash2, LuCircleAlert } from 'react-icons/lu';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const RecipeItemsTable = ({
  items = [],
  onItemsChange,
  products = [],
  onAddNewMaterial = null,
}) => {
  const [duplicateError, setDuplicateError] = useState(null);
  const materialOptions = products.map((p) => ({ value: p.id || p.productId, label: p.name || p.productName }));

  const handleMaterialSelect = (index, materialId) => {
    // Duplicate Validation
    const isDuplicate = items.some((item, i) => i !== index && item.materialId === materialId);
    if (isDuplicate) {
      setDuplicateError("Ushbu xomashyo retsept tarkibiga allaqachon qo'shilgan!");
      setTimeout(() => setDuplicateError(null), 4000);
      return;
    }
    setDuplicateError(null);

    const selectedProd = products.find((p) => (p.id || p.productId) === materialId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      materialId,
      materialName: selectedProd ? (selectedProd.name || selectedProd.productName) : '',
      materialTypeName: selectedProd ? (selectedProd.materialTypeName || 'Po\'lat') : 'Po\'lat',
      unitName: selectedProd ? (selectedProd.unitName || 'dona') : 'dona',
      unitPrice: selectedProd ? (selectedProd.purchasePrice || selectedProd.unitPrice || 0) : updated[index].unitPrice,
    };
    calculateRowTotal(updated, index);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    calculateRowTotal(updated, index);
  };

  const calculateRowTotal = (updatedItems, index) => {
    const row = updatedItems[index];
    const qty = Math.max(0, parseFloat(row.requiredQuantity) || 0);
    const price = parseFloat(row.unitPrice) || 0;
    const waste = Math.max(0, parseFloat(row.wastePercent) || 0);

    const baseCost = qty * price;
    const wasteAmount = baseCost * (waste / 100);
    const rowTotal = baseCost + wasteAmount;

    updatedItems[index].totalCost = Math.max(0, rowTotal);
    onItemsChange(updatedItems);
  };

  const addRow = () => {
    const unusedProd = products.find((p) => !items.some((it) => it.materialId === (p.id || p.productId))) || products[0];
    const newRow = {
      id: `ritem_${Date.now()}`,
      materialId: unusedProd ? (unusedProd.id || unusedProd.productId) : '',
      materialName: unusedProd ? (unusedProd.name || unusedProd.productName) : '',
      materialTypeName: unusedProd ? (unusedProd.materialTypeName || 'Po\'lat') : 'Po\'lat',
      unitName: unusedProd ? (unusedProd.unitName || 'dona') : 'dona',
      requiredQuantity: 1,
      wastePercent: 2,
      unitPrice: unusedProd ? (unusedProd.purchasePrice || unusedProd.unitPrice || 0) : 0,
      totalCost: 0,
      notes: '',
    };
    const updated = [...items, newRow];
    calculateRowTotal(updated, updated.length - 1);
  };

  const removeRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onItemsChange(updated);
  };

  return (
    <div className="recipe-items-table-wrapper mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="fw-bold text-main mb-0 font-heading fs-7">Retsept Tarkibiy Masalliqlar Ro'yxati</h6>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm px-2 py-1 fs-8 d-flex align-items-center gap-1"
          onClick={addRow}
        >
          <LuPlus /> <span>Masalliq Qo'shish</span>
        </button>
      </div>

      {duplicateError && (
        <div className="alert alert-danger p-2 fs-8 mb-2 d-flex align-items-center gap-2">
          <LuCircleAlert className="fs-6" /> <span>{duplicateError}</span>
        </div>
      )}

      <div className="table-responsive border-custom rounded-3">
        <table className="table table-hover align-middle mb-0 fs-7">
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: '220px' }}>Material / Xomashyo</th>
              <th style={{ width: '130px' }}>Material Turi</th>
              <th style={{ width: '80px' }}>Birlik</th>
              <th style={{ width: '110px' }}>Sarf Miqdori</th>
              <th style={{ width: '100px' }}>Isrofo / Chiqindi (%)</th>
              <th style={{ width: '110px' }}>Birlik Narxi ({getCurrencySymbol()})</th>
              <th style={{ width: '130px' }}>Xarajat ({getCurrencySymbol()})</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={row.id || index}>
                <td>
                  <DynamicSelect
                    value={row.materialId}
                    onChange={(e) => handleMaterialSelect(index, e.target.value)}
                    options={materialOptions}
                    managePath={ROUTES.PROTECTED.PRODUCTS}
                    onAddNew={onAddNewMaterial}
                    entityTitle="Material"
                  />
                </td>
                <td>
                  <span className="badge bg-info bg-opacity-10 text-info fs-8">{row.materialTypeName}</span>
                </td>
                <td>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">{row.unitName}</span>
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control form-control-sm"
                    value={row.requiredQuantity}
                    onChange={(e) => handleFieldChange(index, 'requiredQuantity', e.target.value)}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-control form-control-sm"
                    value={row.wastePercent}
                    onChange={(e) => handleFieldChange(index, 'wastePercent', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control form-control-sm"
                    value={row.unitPrice}
                    onChange={(e) => handleFieldChange(index, 'unitPrice', e.target.value)}
                  />
                </td>
                <td>
                  <strong className="text-primary fs-7">{formatCurrency(row.totalCost || 0)}</strong>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger p-1 border-0"
                    onClick={() => removeRow(index)}
                    title="Qatorni o'chirish"
                  >
                    <LuTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
