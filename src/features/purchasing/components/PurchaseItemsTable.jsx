import React from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const PurchaseItemsTable = ({
  items = [],
  onItemsChange,
  products = [],
  onAddNewProduct = null,
}) => {
  const productOptions = products.map((p) => ({ value: p.id || p.productId, label: p.name || p.productName }));

  const handleProductSelect = (index, productId) => {
    const selectedProd = products.find((p) => (p.id || p.productId) === productId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId,
      productName: selectedProd ? (selectedProd.name || selectedProd.productName) : '',
      unitName: selectedProd ? (selectedProd.unit || selectedProd.unitName || '') : '',
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
    const qty = parseFloat(row.quantity) || 0;
    const price = parseFloat(row.unitPrice) || 0;
    const disc = parseFloat(row.discountPercent) || 0;
    const tax = parseFloat(row.taxPercent) || 0;

    const baseSubtotal = qty * price;
    const discountAmount = baseSubtotal * (disc / 100);
    const taxableBase = baseSubtotal - discountAmount;
    const taxAmount = taxableBase * (tax / 100);
    const rowTotal = taxableBase + taxAmount;

    updatedItems[index].total = Math.max(0, rowTotal);
    onItemsChange(updatedItems);
  };

  const addRow = () => {
    const firstProd = products[0];
    const newRow = {
      id: `pitem_${Date.now()}`,
      productId: firstProd ? (firstProd.id || firstProd.productId) : '',
      productName: firstProd ? (firstProd.name || firstProd.productName) : '',
      quantity: 1,
      unitName: firstProd ? (firstProd.unit || firstProd.unitName || '') : '',
      unitPrice: firstProd ? (firstProd.purchasePrice || firstProd.unitPrice || 0) : 0,
      discountPercent: 0,
      taxPercent: 12,
      total: 0,
      notes: '',
    };
    const updated = [...items, newRow];
    calculateRowTotal(updated, updated.length - 1);
  };

  const removeRow = (index) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onItemsChange(updated);
  };

  return (
    <div className="purchase-items-table-wrapper mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="fw-bold text-main mb-0 font-heading fs-7">Xarid Qilinadigan Mahsulotlar Ro'yxati</h6>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm px-2 py-1 fs-8 d-flex align-items-center gap-1"
          onClick={addRow}
        >
          <LuPlus /> <span>+ Qator Qo'shish</span>
        </button>
      </div>

      <div className="table-responsive border-custom rounded-3">
        <table className="table table-hover align-middle mb-0 fs-7">
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: '220px' }}>Mahsulot</th>
              <th style={{ width: '100px' }}>Miqdor</th>
              <th style={{ width: '80px' }}>Birlik</th>
              <th style={{ width: '120px' }}>Narx ({getCurrencySymbol()})</th>
              <th style={{ width: '100px' }}>Chegirma (%)</th>
              <th style={{ width: '90px' }}>Soliq (%)</th>
              <th style={{ width: '130px' }}>Jami ({getCurrencySymbol()})</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={row.id || index}>
                <td>
                  <DynamicSelect
                    value={row.productId}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    options={productOptions}
                    managePath={ROUTES.PROTECTED.PRODUCTS}
                    onAddNew={onAddNewProduct}
                    entityTitle="Mahsulot"
                    compact={true}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={row.quantity}
                    onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                    required
                  />
                </td>
                <td>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">{row.unitName}</span>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={row.unitPrice}
                    onChange={(e) => handleFieldChange(index, 'unitPrice', e.target.value)}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={row.discountPercent}
                    onChange={(e) => handleFieldChange(index, 'discountPercent', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={row.taxPercent}
                    onChange={(e) => handleFieldChange(index, 'taxPercent', e.target.value)}
                  />
                </td>
                <td>
                  <strong className="text-primary fs-7">{formatCurrency(row.total || 0)}</strong>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger p-1 border-0"
                    onClick={() => removeRow(index)}
                    disabled={items.length <= 1}
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
