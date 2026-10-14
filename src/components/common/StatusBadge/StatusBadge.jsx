import React from 'react';
import { formatStatusName } from '@/utils/formatters.utils';

export const StatusBadge = ({ status = '', type }) => {
  let badgeClass = 'bg-secondary bg-opacity-10 text-secondary';

  const normalized = status.toUpperCase();

  if (type === 'success' || ['APPROVED', 'COMPLETED', 'DELIVERED', 'ACTIVE', 'IN_STOCK'].includes(normalized)) {
    badgeClass = 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
  } else if (type === 'warning' || ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'QUALITY_CHECK', 'LOW_STOCK'].includes(normalized)) {
    badgeClass = 'bg-warning bg-opacity-15 text-warning-emphasis border border-warning border-opacity-25';
  } else if (type === 'danger' || ['CANCELLED', 'REJECTED', 'OUT_OF_STOCK', 'ERROR'].includes(normalized)) {
    badgeClass = 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
  } else if (type === 'info' || ['PROCESSING', 'SHIPPED', 'DRAFT'].includes(normalized)) {
    badgeClass = 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
  }

  return <span className={`badge ${badgeClass} fw-semibold`}>{formatStatusName(status)}</span>;
};
