import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { ROUTES } from '@/constants/routes.constants';
import { suppliersApi } from '../api/suppliersApi';

export const SupplierFormModal = ({ isOpen, onClose, supplier, onSave }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        categoryId: supplier.categoryId || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        status: supplier.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        categoryId: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        status: 'ACTIVE',
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  const loadCategories = async () => {
    const res = await suppliersApi.getSupplierCategories();
    if (res.success) setCategories(res.data);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Ta'minotchi korxona nomini kiriting";
    if (!formData.categoryId) errs.categoryId = 'Kategoriyani tanlang';
    if (!formData.contactPerson.trim()) errs.contactPerson = "Mas'ul shaxs ismini kiriting";
    if (!formData.phone.trim()) errs.phone = 'Telefon raqamini kiriting';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (supplier) {
      await suppliersApi.updateSupplier(supplier.id, formData);
    } else {
      await suppliersApi.createSupplier(formData);
    }

    onSave();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? "Ta'minotchi Korxonani Tahrirlash" : "Yangi Ta'minotchi Korxona Qo'shish"}
    >
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <Input
          label="Korxona Nomi"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Masalan: Steel Supply MChJ"
          required
        />

        <DynamicSelect
          label="Ta'minot Kategoriya Turi"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          error={errors.categoryId}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          managePath={ROUTES.PROTECTED.SETTINGS_SUPPLIER_CATEGORIES}
          entityTitle="Kategoriya"
          required
        />

        <div className="row g-2">
          <div className="col-12 col-md-6">
            <Input
              label="Mas'ul Shaxs"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              error={errors.contactPerson}
              placeholder="Ism Familiya"
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <Input
              label="Telefon Raqami"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              placeholder="+998 90 123 45 67"
              required
            />
          </div>
        </div>

        <div className="row g-2">
          <div className="col-12 col-md-6">
            <Input
              label="Elektron Pochta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@steelsupply.uz"
            />
          </div>

          <div className="col-12 col-md-6">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Faol' },
                { value: 'INACTIVE', label: 'Nofaol' },
              ]}
            />
          </div>
        </div>

        <Input
          label="Yuridik va Pochta Manzili"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Shahar, tuman, ko'cha nomi"
        />

        <div className="d-flex justify-content-end gap-2 pt-3 border-top border-custom mt-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
            Bekor Qilish
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  );
};
