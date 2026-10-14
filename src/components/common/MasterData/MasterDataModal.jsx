import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';

export const MasterDataModal = ({
  isOpen,
  onClose,
  onSave,
  item = null,
  entityTitle = 'Element',
  fields = [{ name: 'name', label: 'Nomi', required: true }],
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({ ...item });
      } else {
        const initial = {};
        fields.forEach((f) => {
          initial[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
        });
        initial.status = 'ACTIVE';
        setFormData(initial);
      }
      setErrors({});
    }
  }, [isOpen, item, fields]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    fields.forEach((f) => {
      if (f.required && !formData[f.name]?.toString().trim()) {
        errs[f.name] = `${f.label} kiritilishi shart`;
      }
    });
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? `${entityTitle}ni Tahrirlash` : `Yangi ${entityTitle} Qo'shish`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        {fields.map((field) => (
          <div key={field.name}>
            {field.type === 'select' ? (
              <div className="mb-2">
                <label className="form-label fs-7 fw-medium text-main">
                  {field.label} {field.required && <span className="text-danger">*</span>}
                </label>
                <select
                  className={`form-select fs-7 ${errors[field.name] ? 'is-invalid' : ''}`}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  <option value="">Tanlang...</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors[field.name] && <div className="invalid-feedback fs-8">{errors[field.name]}</div>}
              </div>
            ) : field.type === 'textarea' ? (
              <div className="mb-2">
                <label className="form-label fs-7 fw-medium text-main">
                  {field.label} {field.required && <span className="text-danger">*</span>}
                </label>
                <textarea
                  className={`form-control fs-7 ${errors[field.name] ? 'is-invalid' : ''}`}
                  rows={3}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                />
                {errors[field.name] && <div className="invalid-feedback fs-8">{errors[field.name]}</div>}
              </div>
            ) : (
              <Input
                label={field.label}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder || ''}
                error={errors[field.name]}
              />
            )}
          </div>
        ))}

        <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
            Bekor qilish
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  );
};
