import React from 'react';

export const Loader = ({ size = 'md', label = 'Loading...', fullScreen = false }) => {
  const sizeClass = size === 'sm' ? 'spinner-border-sm' : size === 'lg' ? 'spinner-border-lg' : '';

  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {label && <small className="mt-2 text-muted-custom fw-medium">{label}</small>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center erp-glass z-3">
        {content}
      </div>
    );
  }

  return content;
};
