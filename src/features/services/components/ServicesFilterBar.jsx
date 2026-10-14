import React from 'react';
import { FilterBar } from '@/components/common/FilterBar';

export const ServicesFilterBar = ({
  search,
  onSearchChange,
  customerFilter,
  onCustomerChange,
  serviceTypeFilter,
  onServiceTypeChange,
  statusFilter,
  onStatusChange,
  customers = [],
  serviceTypes = [],
  serviceStatuses = [],
}) => {
  const customerOptions = [
    { value: '', label: 'Barcha Mijozlar' },
    ...customers.map((c) => ({ value: c.id, label: c.customerName })),
  ];

  const typeOptions = [
    { value: '', label: 'Barcha Xizmat Turlari' },
    ...serviceTypes.map((t) => ({ value: t.id, label: t.name })),
  ];

  const statusOptions = [
    { value: '', label: 'Barcha Statuslar' },
    ...serviceStatuses.map((s) => ({ value: s.code, label: s.name })),
  ];

  const primarySelects = [
    { id: 'customer', label: 'Mijoz Korxona', value: customerFilter, onChange: onCustomerChange, options: customerOptions },
  ];

  const advancedSelects = [
    { id: 'serviceType', label: 'Servis Xizmati Turi', value: serviceTypeFilter, onChange: onServiceTypeChange, options: typeOptions },
    { id: 'status', label: 'Servis Statusi', value: statusFilter, onChange: onStatusChange, options: statusOptions },
  ];

  const handleReset = () => {
    onSearchChange('');
    onCustomerChange('');
    onServiceTypeChange('');
    onStatusChange('');
  };

  return (
    <FilterBar
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: "Servis №, mijoz yoki usta bo'yicha qidiruv...",
      }}
      primarySelects={primarySelects}
      advancedSelects={advancedSelects}
      onReset={handleReset}
    />
  );
};
