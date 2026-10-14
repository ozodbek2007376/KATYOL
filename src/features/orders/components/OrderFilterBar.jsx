import React from 'react';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Select/Select';

export const OrderFilterBar = ({
  search,
  onSearchChange,
  customerFilter,
  onCustomerChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  customers = [],
  statuses = [],
  priorities = [],
}) => {
  const customerOptions = [{ value: '', label: 'Barcha Mijozlar' }, ...customers.map((c) => ({ value: c.id, label: c.customerName }))];
  const statusOptions = [{ value: '', label: 'Barcha Statuslar' }, ...statuses.map((s) => ({ value: s.code, label: s.name }))];
  const priorityOptions = [{ value: '', label: 'Barcha Prioritetlar' }, ...priorities.map((p) => ({ value: p.code, label: p.name }))];

  return (
    <div className="row g-2 mb-4 align-items-center">
      <div className="col-12 col-md-5">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Buyurtma №, mijoz nomi yoki kotyol modeli bo'yicha..."
        />
      </div>
      <div className="col-12 col-md-3">
        <Select
          value={customerFilter}
          onChange={(e) => onCustomerChange(e.target.value)}
          options={customerOptions}
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-md-2">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
          containerClass="mb-0 text-start"
        />
      </div>
      <div className="col-12 col-md-2">
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
