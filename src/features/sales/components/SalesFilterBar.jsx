import React from 'react';
import { FilterBar } from '@/components/common/FilterBar';

export const SalesFilterBar = ({
  search,
  onSearchChange,
  customerFilter,
  onCustomerChange,
  boilerFilter,
  onBoilerChange,
  statusFilter,
  onStatusChange,
  customers = [],
  boilers = [],
  saleStatuses = [],
}) => {
  const customerOptions = [
    { value: '', label: 'Barcha Mijozlar' },
    ...customers.map((c) => ({ value: c.id, label: c.customerName })),
  ];

  const boilerOptions = [
    { value: '', label: 'Barcha Pech Modellari' },
    ...boilers.map((b) => ({ value: b.id, label: b.modelName })),
  ];

  const statusOptions = [
    { value: '', label: 'Barcha Statuslar' },
    ...saleStatuses.map((s) => ({ value: s.code, label: s.name })),
  ];

  const primarySelects = [
    { id: 'customer', label: 'Mijoz Korxona', value: customerFilter, onChange: onCustomerChange, options: customerOptions },
  ];

  const advancedSelects = [
    { id: 'boiler', label: 'Kotyol Modeli', value: boilerFilter, onChange: onBoilerChange, options: boilerOptions },
    { id: 'status', label: 'Sotuv Statusi', value: statusFilter, onChange: onStatusChange, options: statusOptions },
  ];

  const handleReset = () => {
    onSearchChange('');
    onCustomerChange('');
    onBoilerChange('');
    onStatusChange('');
  };

  return (
    <FilterBar
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: "Invoys №, mijoz yoki model bo'yicha qidiruv...",
      }}
      primarySelects={primarySelects}
      advancedSelects={advancedSelects}
      onReset={handleReset}
    />
  );
};
