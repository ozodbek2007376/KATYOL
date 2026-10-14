import React, { forwardRef } from 'react';

export const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      className = '',
      id,
      placeholder = 'Tanlang...',
      containerClass,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select_${Math.random().toString(36).substring(2, 7)}`;
    const finalContainerClass =
      containerClass !== undefined
        ? containerClass
        : label
          ? 'mb-3 text-start'
          : 'text-start';

    return (
      <div className={finalContainerClass}>
        {label && (
          <label htmlFor={selectId} className="form-label fw-medium fs-7 mb-1 text-main">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, idx) => {
            const val = typeof opt === 'object' ? (opt.value ?? opt.id ?? '') : opt;
            const lbl = typeof opt === 'object' ? (opt.label ?? opt.name ?? val) : opt;
            return (
              <option key={`${val}-${idx}`} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        {error && <div className="invalid-feedback">{error}</div>}
        {helperText && !error && <small className="text-muted-custom fs-8 mt-1 d-block">{helperText}</small>}
      </div>
    );
  }
);

Select.displayName = 'Select';
