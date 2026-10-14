import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const PurchaseFilterBar = ({
  search,
  onSearchChange,
  supplierFilter,
  onSupplierChange,
  warehouseFilter,
  onWarehouseChange,
  statusFilter,
  onStatusChange,
  suppliers = [],
  warehouses = [],
  statuses = [],
}) => {
  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-4">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="PO raqami, ta'minotchi yoki faktura № bo'yicha..."
        />
      </div>
      <div className="col-12 col-sm-6 col-md-3">
        <Select
          value={supplierFilter}
          onChange={(e) => onSupplierChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Ta\'minotchilar' },
            ...suppliers.map((s) => ({ value: s.id, label: s.companyName })),
          ]}
        />
      </div>
      <div className="col-12 col-sm-6 col-md-3">
        <Select
          value={warehouseFilter}
          onChange={(e) => onWarehouseChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Omborlar' },
            ...warehouses.map((w) => ({ value: w.id, label: w.name })),
          ]}
        />
      </div>
      <div className="col-12 col-sm-6 col-md-2">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Statuslar' },
            ...statuses.map((st) => ({ value: st.code, label: st.name })),
          ]}
        />
      </div>
    </div>
  );
};
