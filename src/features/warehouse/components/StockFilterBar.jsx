import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const StockFilterBar = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  warehouseFilter,
  onWarehouseChange,
  materialFilter,
  onMaterialChange,
  statusFilter,
  onStatusChange,
  categories = [],
  warehouses = [],
  materialTypes = [],
}) => {
  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-3">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Nomi yoki kodi bo'yicha..."
        />
      </div>
      <div className="col-12 col-sm-6 col-md-2">
        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Kategoriya' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          containerClass="mb-0 text-start"
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
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-sm-6 col-md-2">
        <Select
          value={materialFilter}
          onChange={(e) => onMaterialChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Materiallar' },
            ...materialTypes.map((m) => ({ value: m.id, label: m.name })),
          ]}
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-sm-6 col-md-2">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Status' },
            { value: 'ACTIVE', label: 'Mavjud' },
            { value: 'LOW_STOCK', label: 'Kam Qolgan' },
            { value: 'OUT_OF_STOCK', label: 'Tugagan' },
          ]}
          containerClass="mb-0 text-start"
        />
      </div>
    </div>
  );
};
