import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const EmployeeFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  positionFilter,
  onPositionChange,
  positions = [],
}) => {
  const statusOptions = [
    { value: 'ACTIVE', label: 'Faol Xodimlar' },
    { value: 'INACTIVE', label: 'Arxiv (Nofaol)' },
    { value: 'ON_LEAVE', label: 'Ta\'tilda' },
    { value: 'SICK_LEAVE', label: 'Kasallik Ta\'tili' },
    { value: 'TERMINATED', label: 'Bo\'shatilgan' },
  ];

  const positionOptions = [
    { value: '', label: 'Barcha Lavozimlar' },
    ...positions.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-5">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Ism, familiya, telefon yoki pasport bo'yicha qidirish..."
        />
      </div>
      <div className="col-12 col-sm-6 col-md-3">
        <Select
          value={positionFilter}
          onChange={(e) => onPositionChange(e.target.value)}
          options={positionOptions}
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-sm-6 col-md-4">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
          containerClass="mb-0 text-start"
        />
      </div>
    </div>
  );
};
