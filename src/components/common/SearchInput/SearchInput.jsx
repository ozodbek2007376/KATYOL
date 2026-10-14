import React from 'react';
import { ERP_ICONS } from '@/shared/icons';

export const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Search records...',
  className = '',
}) => {
  return (
    <div className={`position-relative ${className}`}>
      <i
        className={`bi ${ERP_ICONS.SEARCH} position-absolute top-50 translate-middle-y text-muted-custom`}
        style={{ left: '12px', pointerEvents: 'none' }}
      ></i>
      <input
        type="text"
        className="form-control pe-4 search-input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="btn btn-sm text-muted-custom position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
          onClick={() => onChange('')}
        >
          <i className={`bi ${ERP_ICONS.X_MARK}`}></i>
        </button>
      )}
    </div>
  );
};
