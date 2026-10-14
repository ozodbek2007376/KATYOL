import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  footer,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="card-header d-flex align-items-center justify-content-between">
          <div>
            {title && <h6 className="card-title mb-0">{title}</h6>}
            {subtitle && <small className="text-muted-custom fs-8">{subtitle}</small>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};
