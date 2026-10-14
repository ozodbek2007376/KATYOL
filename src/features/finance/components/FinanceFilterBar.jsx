import React from 'react';
import { FilterBar } from '@/components/common/FilterBar';

export const FinanceFilterBar = ({
  search,
  onSearchChange,
  expenseTypeFilter,
  onExpenseTypeChange,
  expenseTypes = [],
}) => {
  const typeOptions = [
    { value: '', label: 'Barcha Xarajat Turlari' },
    ...expenseTypes.map((t) => ({ value: t.id, label: t.name })),
  ];

  const primarySelects = [
    { id: 'expenseType', label: 'Xarajat Turi', value: expenseTypeFilter, onChange: onExpenseTypeChange, options: typeOptions },
  ];

  const handleReset = () => {
    onSearchChange('');
    onExpenseTypeChange('');
  };

  return (
    <FilterBar
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: "Hujjat №, xarajat turi yoki mas'ul bo'yicha qidiruv...",
      }}
      primarySelects={primarySelects}
      onReset={handleReset}
    />
  );
};
