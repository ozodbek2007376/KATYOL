import React from 'react';

export const Skeleton = ({ height = '20px', width = '100%', borderRadius = 'var(--erp-radius-sm)', className = '' }) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        height,
        width,
        borderRadius,
      }}
    />
  );
};
