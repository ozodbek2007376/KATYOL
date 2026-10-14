import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const BoilerFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-6">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Model nomi yoki ichki kodi bo'yicha..."
        />
      </div>
      <div className="col-12 col-md-4">
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
