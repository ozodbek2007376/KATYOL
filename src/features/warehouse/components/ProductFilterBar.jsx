import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const ProductFilterBar = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  materialFilter,
  onMaterialChange,
  supplierFilter,
  onSupplierChange,
  statusFilter,
  onStatusChange,
  categories = [],
  materialTypes = [],
  suppliers = [],
}) => {
  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-4">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Nomi yoki ichki kodi bo'yicha..."
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
          value={supplierFilter}
          onChange={(e) => onSupplierChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Ta\'minotchi' },
            ...suppliers.map((s) => ({ value: s.id, label: s.companyName })),
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
            { value: 'ACTIVE', label: 'Faol' },
            { value: 'INACTIVE', label: 'Nofaol' },
          ]}
          containerClass="mb-0 text-start"
        />
      </div>
    </div>
  );
};
