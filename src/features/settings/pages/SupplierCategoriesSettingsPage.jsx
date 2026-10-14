import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Modal } from '@/components/common/Modal/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SettingsSubNav } from '../components/SettingsSubNav';
import { settingsApi } from '../api/settingsApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';

export const SupplierCategoriesSettingsPage = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [deletingCat, setDeletingCat] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const res = await settingsApi.getSupplierCategories();
    if (res.success && Array.isArray(res.data)) {
      setCategories(res.data);
      dynamicSettingsService.saveList('supplierCategories', res.data);
    } else {
      setCategories(dynamicSettingsService.getSupplierCategories() || []);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (cat = null) => {
    setEditingCat(cat);
    if (cat) {
      setName(cat.name || '');
      setDescription(cat.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    if (editingCat) {
      const res = await settingsApi.updateSupplierCategory(editingCat.id, {
        name,
        description,
        status: editingCat.status || 'ACTIVE',
      });
      if (res.success) {
        notifySuccess("Ta'minotchi kategoriyasi tahrirlandi.");
        await loadCategories();
      } else {
        notifyError("Kategoriyani tahrirlashda xatolik yuz berdi.");
      }
    } else {
      const res = await settingsApi.createSupplierCategory({
        name,
        description,
        status: 'ACTIVE',
      });
      if (res.success) {
        notifySuccess("Yangi ta'minotchi kategoriyasi qo'shildi.");
        await loadCategories();
      } else {
        notifyError("Kategoriya yaratishda xatolik yuz berdi.");
      }
    }

    setIsLoading(false);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingCat) {
      setIsLoading(true);
      const res = await settingsApi.deleteSupplierCategory(deletingCat.id);
      if (res.success) {
        notifySuccess("Ta'minotchi kategoriyasi o'chirildi.");
        await loadCategories();
      } else {
        notifyError("Kategoriyani o'chirishda xatolik yuz berdi.");
      }
      setIsLoading(false);
      setIsConfirmOpen(false);
      setDeletingCat(null);
    }
  };

  const columns = [
    {
      header: 'Kategoriya Nomi',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7">{row.name}</strong>
          {row.description && <small className="d-block text-muted-custom fs-8">{row.description}</small>}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`badge ${row.status === 'INACTIVE' ? 'bg-secondary' : 'bg-success'} fs-8`}>
          {row.status === 'INACTIVE' ? 'Nofaol' : 'Faol'}
        </span>
      ),
    },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <button
            className="btn btn-sm btn-outline-secondary p-1 border-0"
            onClick={() => handleOpenModal(row)}
            title="Tahrirlash"
          >
            <LuPencil />
          </button>
          <button
            className="btn btn-sm btn-outline-danger p-1 border-0"
            onClick={() => {
              setDeletingCat(row);
              setIsConfirmOpen(true);
            }}
            title="O'chirish"
          >
            <LuTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="supplier-categories-settings-page animate-fade-in pb-5">
      <SettingsSubNav />

      <PageHeader
        title="Ta'minotchi Kategoriyalari Sozlamalari"
        subtitle="Ta'minotchi va butlovchi qismlar etkazib beruvchilar kategoriyalari ma'lumotnomasi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sozlamalar', path: '/settings' },
          { label: 'Ta\'minotchi Kategoriyalari' },
        ]}
        actions={
          <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
            <LuPlus className="me-1" /> Yangi Kategoriya
          </Button>
        }
      />

      <Card title={`Ta'minotchi Kategoriyalari Ro'yxati (${categories.length} ta)`}>
        <Table columns={columns} data={categories} isLoading={isLoading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCat ? "Kategoriyani Tahrirlash" : "Yangi Kategoriya Qo'shish"}
        size="md"
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              Saqlash
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Input
              label="Kategoriya Nomi"
              placeholder="Xomashyo, Ehtiyot qismlar, Logistika..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fs-7 fw-medium text-main">Tavsifi</label>
            <textarea
              className="form-control fs-7"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kategoriya bo'yicha tavsif..."
            ></textarea>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Kategoriyani O'chirish"
        message={`Haqiqatan ham '${deletingCat?.name}' ta'minotchi kategoriyasi o'chirilsinmi?`}
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Yopish"
      />
    </div>
  );
};
