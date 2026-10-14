import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const ProductionFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  priorities = [],
}) => {
  const statusOptions = [
    { value: '', label: 'Barcha Statuslar' },
    { value: 'SCHEDULED', label: 'Rejalashtirilgan' },
    { value: 'IN_PROGRESS', label: 'Jarayonda' },
    { value: 'QUALITY_CHECK', label: 'Sifat Nazoratida' },
    { value: 'COMPLETED', label: 'Yakunlangan' },
    { value: 'CANCELLED', label: 'Bekor Qilingan' },
  ];

  const priorityOptions = [{ value: '', label: 'Barcha Prioritetlar' }, ...priorities.map((p) => ({ value: p.code, label: p.name }))];

  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-6">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Ishlab chiqarish №, buyurtma № yoki mahsulot nomi bo'yicha..."
        />
      </div>
      <div className="col-12 col-md-3">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-md-3">
        <Select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          options={priorityOptions}
          containerClass="mb-0 text-start"
        />
      </div>
    </div>
  );
};
