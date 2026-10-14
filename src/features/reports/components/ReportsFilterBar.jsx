import React from 'react';
import { FilterBar } from '@/components/common/FilterBar';

export const ReportsFilterBar = ({
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  warehouseFilter = '',
  onWarehouseChange,
  customerFilter = '',
  onCustomerChange,
  employeeFilter = '',
  onEmployeeChange,
  statusFilter = '',
  onStatusChange,
  warehouses = [],
  customers = [],
  employees = [],
  statuses = [],
}) => {
  const primarySelects = [];
  const advancedSelects = [];

  if (warehouses.length > 0) {
    primarySelects.push({
      id: 'warehouse',
      label: 'Omborxona',
      value: warehouseFilter,
      onChange: onWarehouseChange,
      options: [{ value: '', label: 'Barcha Omborlar' }, ...warehouses.map((w) => ({ value: w.id, label: w.name }))],
    });
  }

  if (customers.length > 0) {
    primarySelects.push({
      id: 'customer',
      label: 'Mijoz Korxona',
      value: customerFilter,
      onChange: onCustomerChange,
      options: [{ value: '', label: 'Barcha Mijozlar' }, ...customers.map((c) => ({ value: c.id, label: c.customerName }))],
    });
  }

  if (employees.length > 0) {
    advancedSelects.push({
      id: 'employee',
      label: "Mas'ul Xodim",
      value: employeeFilter,
      onChange: onEmployeeChange,
      options: [{ value: '', label: 'Barcha Xodimlar' }, ...employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))],
    });
  }

  if (statuses.length > 0) {
    advancedSelects.push({
      id: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: onStatusChange,
      options: [{ value: '', label: 'Barcha Statuslar' }, ...statuses.map((s) => ({ value: s.code || s.value, label: s.name || s.label }))],
    });
  }

  const handleReset = () => {
    onStartDateChange('');
    onEndDateChange('');
    if (onWarehouseChange) onWarehouseChange('');
    if (onCustomerChange) onCustomerChange('');
    if (onEmployeeChange) onEmployeeChange('');
    if (onStatusChange) onStatusChange('');
  };

  return (
    <FilterBar
      dateRange={{
        startDate,
        onStartDateChange,
        endDate,
        onEndDateChange,
      }}
      primarySelects={primarySelects}
      advancedSelects={advancedSelects}
      onReset={handleReset}
    />
  );
};
