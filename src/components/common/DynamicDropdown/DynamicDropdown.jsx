import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuChevronDown, LuSearch, LuPlus, LuPencil, LuArchive, LuCheck, LuSettings } from 'react-icons/lu';
import { QuickAddModal } from '../DynamicSelect/QuickAddModal';
import { ArchiveManagementModal } from './ArchiveManagementModal';
import { ROUTES } from '@/constants/routes.constants';

const ENTITY_PATH_MAP = {
  positions: ROUTES.PROTECTED.EMPLOYEES_POSITIONS || '/employees/positions',
  salaryTypes: ROUTES.PROTECTED.EMPLOYEES_SALARY_TYPES || '/employees/salary-types',
  warehouses: ROUTES.PROTECTED.WAREHOUSE_LIST || '/warehouse/list',
  products: ROUTES.PROTECTED.PRODUCTS || '/products',
  categories: ROUTES.PROTECTED.SETTINGS_CATEGORIES || '/settings/categories',
  units: ROUTES.PROTECTED.SETTINGS_UNITS || '/settings/units',
  suppliers: ROUTES.PROTECTED.SUPPLIERS || '/suppliers',
  customers: ROUTES.PROTECTED.CUSTOMERS || '/customers',
  expenseTypes: ROUTES.PROTECTED.SETTINGS_EXPENSE_TYPES || '/settings/expense-types',
  serviceTypes: ROUTES.PROTECTED.SETTINGS_SERVICE_TYPES || '/settings/service-types',
  warrantyTypes: ROUTES.PROTECTED.SETTINGS_WARRANTY_TYPES || '/settings/warranty-types',
  roles: ROUTES.PROTECTED.SETTINGS_ROLES || '/settings/roles',
};

export const DynamicDropdown = ({
  label,
  value,
  onChange,
  options = [],
  onAddNew = null,
  onEdit = null,
  onRefresh = null,
  entityKey = null,
  entityTitle = 'Element',
  placeholder = 'Tanlang...',
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  canCreate = true,
  canEdit = true,
  canArchive = true,
  managePath = null,
  manageUrl = null,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const containerRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value || opt.id === value);

  const filteredOptions = options.filter((opt) =>
    opt.label ? opt.label.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleSelectOption = (opt) => {
    const val = opt.value !== undefined ? opt.value : opt.id;
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setIsOpen(false);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    const targetPath = managePath || manageUrl || (entityKey ? ENTITY_PATH_MAP[entityKey] : null);
    if (targetPath) {
      navigate(targetPath);
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleManageClick = (e) => {
    e.stopPropagation();
    const targetPath = managePath || manageUrl || (entityKey ? ENTITY_PATH_MAP[entityKey] : null);
    if (targetPath) {
      navigate(targetPath);
    } else {
      setIsArchiveModalOpen(true);
    }
  };

  const handleAddSubmit = (newRecord) => {
    if (onAddNew) {
      const added = onAddNew(newRecord);
      if (added && (added.value || added.id)) {
        const val = added.value || added.id;
        if (onChange) {
          onChange({ target: { value: val } });
        }
      }
    }
    setIsAddModalOpen(false);
  };

  const handleRestored = (restoredId) => {
    if (onRefresh) {
      onRefresh();
    }
    if (onChange && restoredId) {
      onChange({ target: { value: restoredId } });
    }
  };

  return (
    <div ref={containerRef} className={`dynamic-dropdown-wrapper position-relative ${compact ? '' : 'mb-3'}`}>
      {/* Label Area Header Row */}
      {!compact && (
        <div className="dynamic-dropdown-label-row d-flex align-items-center justify-content-between mb-1">
          {label && (
            <label className="form-label fs-7 fw-medium text-main mb-0">
              {label} {required && <span className="text-danger">*</span>}
            </label>
          )}
          <div className="d-flex align-items-center gap-1">
            {canCreate && (
              <button
                type="button"
                className="btn btn-link p-0 text-primary text-decoration-none fs-7 p-1 d-inline-flex align-items-center justify-content-center rounded-2 hover-bg-light"
                onClick={handleAddClick}
                title="Sahifada yangi qo'shish"
              >
                <LuPlus className="fs-6" />
              </button>
            )}
            {canArchive && (
              <button
                type="button"
                className="btn btn-link p-0 text-muted-custom text-decoration-none fs-7 p-1 d-inline-flex align-items-center justify-content-center rounded-2 hover-bg-light"
                onClick={handleManageClick}
                title="Boshqarish sahifasiga o'tish"
              >
                <LuSettings className="fs-6" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Trigger Button (Closed State) - Fixed 40px Height */}
      <button
        type="button"
        className={`form-control text-start fs-7 d-flex align-items-center justify-content-between border-custom bg-body-custom text-main ${
          error ? 'is-invalid' : ''
        }`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        style={{
          height: '40px !important',
          minHeight: '40px !important',
          maxHeight: '40px !important',
          paddingLeft: '0.85rem',
          paddingRight: '0.85rem',
          paddingTop: 0,
          paddingBottom: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span className={`text-truncate ${selectedOption ? 'text-main fw-medium' : 'text-muted-custom'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <LuChevronDown className="fs-6 text-muted-custom flex-shrink-0 ms-2" />
      </button>

      {error && <div className="invalid-feedback fs-8 d-block mt-1">{error}</div>}
      {helperText && !error && <small className="text-muted-custom fs-8 d-block mt-1">{helperText}</small>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="dropdown-menu show w-100 p-2 shadow-lg border-custom bg-body-custom animate-fade-in"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1070,
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {/* Search Bar */}
          <div className="input-group input-group-sm mb-2">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <LuSearch className="fs-7" />
            </span>
            <input
              type="text"
              className="form-control bg-body-custom text-main border-custom fs-8"
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const optVal = opt.value !== undefined ? opt.value : opt.id;
                const isSelected = optVal === value;
                return (
                  <button
                    key={optVal}
                    type="button"
                    className={`dropdown-item rounded-2 py-2 px-3 fs-7 d-flex align-items-center justify-content-between mb-1 ${
                      isSelected ? 'active bg-primary text-white fw-bold' : 'text-main'
                    }`}
                    onClick={() => handleSelectOption(opt)}
                  >
                    <span className="text-truncate">{opt.label || opt.name}</span>
                    {isSelected && <LuCheck className="fs-6 ms-2 flex-shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-3 text-muted-custom fs-8">
                Ma'lumot topilmadi
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <QuickAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSubmit}
          entityTitle={entityTitle}
        />
      )}

      {isArchiveModalOpen && (
        <ArchiveManagementModal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          entityKey={entityKey}
          entityTitle={entityTitle}
          onRestored={handleRestored}
        />
      )}
    </div>
  );
};
