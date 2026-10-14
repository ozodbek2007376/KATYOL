import React from 'react';
import { formatPercentage } from '@/utils/formatters.utils';

export const StatCard = ({
  title,
  value,
  trendPercentage,
  trendLabel = 'vs last month',
  icon,
  iconBgColor = 'var(--erp-primary-light)',
  iconColor = 'var(--erp-primary)',
}) => {
  const isPositive = Number(trendPercentage) >= 0;

  return (
    <div className="card h-100 p-3 border-custom">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-muted-custom fs-7 fw-medium">{title}</span>
        {icon && (
          <div
            className="d-flex align-items-center justify-content-center rounded-3 p-2"
            style={{ width: '40px', height: '40px', backgroundColor: iconBgColor, color: iconColor }}
          >
            <i className={`bi ${icon} fs-5`}></i>
          </div>
        )}
      </div>

      <div className="d-flex align-items-baseline justify-content-between mt-1">
        <h4 className="fw-bold text-main mb-0">{value}</h4>
        {trendPercentage !== undefined && (
          <span className={`trend-badge ${isPositive ? 'up' : 'down'}`}>
            <i className={`bi bi-arrow-${isPositive ? 'up' : 'down'}-short`}></i>
            {formatPercentage(trendPercentage)}
          </span>
        )}
      </div>
      {trendLabel && <small className="text-muted-custom fs-8 mt-2 d-block">{trendLabel}</small>}
    </div>
  );
};
