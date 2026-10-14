import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const CustomerFilterBar = ({
  search,
  onSearchChange,
  customerTypeFilter,
  onCustomerTypeChange,
  regionFilter,
  onRegionChange,
  statusFilter,
  onStatusChange,
  customerTypes = [],
  regions = [],
}) => {
  const typeOptions = [{ value: '', label: 'Barcha Mijoz Turlari' }, ...customerTypes.map((ct) => ({ value: ct.id, label: ct.name }))];
  const regionOptions = [{ value: '', label: 'Barcha Viloyatlar' }, ...regions.map((r) => ({ value: r.name, label: r.name }))];

  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-5">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Mijoz nomi, telefon yoki STIR bo'yicha..."
        />
      </div>
      <div className="col-12 col-md-3">
        <Select
          value={customerTypeFilter}
          onChange={(e) => onCustomerTypeChange(e.target.value)}
          options={typeOptions}
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-md-2">
        <Select
          value={regionFilter}
          onChange={(e) => onRegionChange(e.target.value)}
          options={regionOptions}
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-md-2">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'Barcha Statuslar' },
            { value: 'ACTIVE', label: 'Faol' },
            { value: 'INACTIVE', label: 'Nofaol' },
          ]}
          containerClass="mb-0 text-start"
        />
      </div>
    </div>
  );
};
