import React from 'react';
import { ERP_ICONS } from '@/shared/icons';

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected server error occurred while retrieving data.',
  onRetry,
}) => {
  return (
    <div className="text-center p-5 rounded-3 border-danger border-opacity-25 bg-card-custom animate-fade-in">
      <div className="mb-3">
        <i className={`bi ${ERP_ICONS.EXCLAMATION} text-danger`} style={{ fontSize: '3rem' }}></i>
      </div>
      <h5 className="fw-semibold text-danger mb-2">{title}</h5>
      <p className="text-muted-custom fs-7 mb-4 mx-auto" style={{ maxWidth: '450px' }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-outline-danger btn-sm" onClick={onRetry}>
          <i className={`bi ${ERP_ICONS.REFRESH} me-1`}></i> Retry Request
        </button>
      )}
    </div>
  );
};
