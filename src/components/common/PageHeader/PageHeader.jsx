import React from 'react';
import { Link } from 'react-router-dom';

export const PageHeader = ({ title, subtitle, breadcrumbs = [], actions = null }) => {
  return (
    <div className="page-header mb-4">
      {/* Breadcrumb Trail */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb fs-8 mb-0">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return isLast ? (
                <li key={idx} className="breadcrumb-item active text-muted-custom fw-medium" aria-current="page">
                  {crumb.label}
                </li>
              ) : (
                <li key={idx} className="breadcrumb-item">
                  <Link to={crumb.path} className="text-decoration-none text-primary">
                    {crumb.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Main Header Content */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
        <div>
          <h4 className="fw-bold text-main mb-1 font-heading">{title}</h4>
          {subtitle && <p className="text-muted-custom fs-7 mb-0">{subtitle}</p>}
        </div>

        {/* Action Buttons */}
        {actions && <div className="d-flex align-items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
