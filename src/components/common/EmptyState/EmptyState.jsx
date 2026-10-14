import React from 'react';
import { ERP_ICONS } from '@/shared/icons';

export const EmptyState = ({
  icon = ERP_ICONS.WAREHOUSE,
  title = 'No Data Found',
  description = 'There are no records matching your current filter criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center p-5 rounded-3 border-custom bg-card-custom animate-fade-in">
      <div className="mb-3">
        <i className={`bi ${icon} text-muted-custom`} style={{ fontSize: '3rem' }}></i>
      </div>
      <h5 className="fw-semibold text-main mb-2">{title}</h5>
      <p className="text-muted-custom fs-7 mb-4 mx-auto" style={{ maxWidth: '400px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          <i className={`bi ${ERP_ICONS.PLUS} me-1`}></i> {actionLabel}
        </button>
      )}
    </div>
  );
};
