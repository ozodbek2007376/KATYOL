import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const RecipeFilterBar = ({
  search,
  onSearchChange,
  productFilter,
  onProductChange,
  statusFilter,
  onStatusChange,
  products = [],
}) => {
  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-5">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Retsept nomi yoki mahsulot bo'yicha..."
        />
      </div>
      <div className="col-12 col-sm-6 col-md-4">
        <Select
          value={productFilter}
          onChange={(e) => onProductChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Tayyor Mahsulotlar' },
            ...products.map((p) => ({ value: p.id || p.productId, label: p.name || p.productName })),
          ]}
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-sm-6 col-md-3">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Statuslar' },
            { value: 'ACTIVE', label: 'Faol Versiya' },
            { value: 'INACTIVE', label: 'Nofaol Versiya' },
          ]}
          containerClass="mb-0 text-start"
        />
      </div>
    </div>
  );
};
