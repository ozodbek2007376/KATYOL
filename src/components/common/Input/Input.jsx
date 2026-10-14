import React, { forwardRef } from 'react';

export const formatNumberWithSpaces = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).replace(/\s/g, '').replace(/,/g, '.');
  if (isNaN(str) && str !== '-' && str !== '.') return String(val);
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('.');
};

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      className = '',
      id,
      containerClass,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input_${Math.random().toString(36).substring(2, 7)}`;
    const isNumberType = type === 'number';
    const isTelType = type === 'tel';
    const finalContainerClass =
      containerClass !== undefined
        ? containerClass
        : label
          ? 'mb-3 text-start'
          : 'text-start';

    const handleNumberChange = (e) => {
      if (!onChange) return;
      const rawInput = e.target.value;
      // Strip spaces and normalize commas to dots
      const cleanValue = rawInput.replace(/\s/g, '').replace(/,/g, '.');

      // Allow empty string, negative sign, or valid decimal pattern
      if (cleanValue === '' || cleanValue === '-' || cleanValue === '.' || !isNaN(cleanValue)) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            name: props.name,
            value: cleanValue,
          },
        };
        onChange(syntheticEvent);
      }
    };

    const handleTelChange = (e) => {
      if (!onChange) return;
      const rawInput = e.target.value;
      // Allow only digits and '+'
      let cleanValue = rawInput.replace(/[^\d+]/g, '');
      // Ensure '+' is only at the beginning
      if (cleanValue.includes('+')) {
        const hasLeading = cleanValue.startsWith('+');
        cleanValue = (hasLeading ? '+' : '') + cleanValue.replace(/\+/g, '');
      }

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name: props.name,
          value: cleanValue,
        },
      };
      onChange(syntheticEvent);
    };

    const displayValue = isNumberType
      ? formatNumberWithSpaces(value)
      : value !== undefined && value !== null
        ? value
        : '';

    return (
      <div className={finalContainerClass}>
        {label && (
          <label htmlFor={inputId} className="form-label fw-medium fs-7 mb-1 text-main">
            {label}
          </label>
        )}
        <div className="input-group">
          {leftIcon && (
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className={`bi ${leftIcon}`}></i>
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            type={isNumberType ? 'text' : type}
            inputMode={isNumberType ? 'decimal' : (isTelType ? 'tel' : undefined)}
            value={displayValue}
            onChange={isNumberType ? handleNumberChange : (isTelType ? handleTelChange : onChange)}
            className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className={`bi ${rightIcon}`}></i>
            </span>
          )}
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
        {helperText && !error && (
          <small className="text-muted-custom fs-8 mt-1 d-block">{helperText}</small>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
