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

export const MaterialTypesSettingsPage = () => {
  const [materialTypes, setMaterialTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [deletingMat, setDeletingMat] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaterialTypes();
  }, []);

  const loadMaterialTypes = async () => {
    setIsLoading(true);
    const res = await settingsApi.getMaterialTypes();
    if (res.success && Array.isArray(res.data)) {
      setMaterialTypes(res.data);
      dynamicSettingsService.saveList('materialTypes', res.data);
    } else {
      setMaterialTypes(dynamicSettingsService.getMaterialTypes() || []);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (mat = null) => {
    setEditingMat(mat);
    if (mat) {
      setName(mat.name || '');
      setDescription(mat.description || '');
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
    if (editingMat) {
      const res = await settingsApi.updateMaterialType(editingMat.id, {
        name,
        description,
        status: editingMat.status || 'ACTIVE'
      });
      if (res.success) {
        notifySuccess("Material turi tahrirlandi.");
        await loadMaterialTypes();
      } else {
        notifyError("Material turini tahrirlashda xatolik yuz berdi.");
      }
    } else {
      const res = await settingsApi.createMaterialType({
        name,
        description,
        status: 'ACTIVE'
      });
      if (res.success) {
        notifySuccess("Yangi material turi qo'shildi.");
        await loadMaterialTypes();
      } else {
        notifyError("Material turi yaratishda xatolik yuz berdi.");
      }
    }

    setIsLoading(false);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingMat) {
      setIsLoading(true);
      const res = await settingsApi.deleteMaterialType(deletingMat.id);
      if (res.success) {
        notifySuccess("Material turi o'chirildi.");
        await loadMaterialTypes();
      } else {
        notifyError("Material turini o'chirishda xatolik yuz berdi.");
      }
      setIsLoading(false);
      setIsConfirmOpen(false);
      setDeletingMat(null);
    }
  };

  const columns = [
    {
      header: 'Material Turi Nomi',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7">{row.name}</strong>
          <small className="d-block text-muted-custom fs-8">{row.description}</small>
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
              setDeletingMat(row);
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
    <div className="material-types-settings-page animate-fade-in pb-5">
      <SettingsSubNav />

      <PageHeader
        title="Material Turlari Sozlamalari"
        subtitle="Xomashyo, yarim tayyor mahsulot va tayyor kotyollar turlari ma'lumotnomasi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sozlamalar', path: '/settings' },
          { label: 'Material Turlari' },
        ]}
        actions={
          <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
            <LuPlus className="me-1" /> Yangi Material Turi
          </Button>
        }
      />

      <Card title={`Material Turlari Ro'yxati (${materialTypes.length} ta)`}>
        <Table columns={columns} data={materialTypes} isLoading={isLoading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMat ? "Material Turini Tahrirlash" : "Yangi Material Turi Qo'shish"}
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
              label="Material Turi Nomi"
              placeholder="Xomashyo, Yarim Tayyor, Tayyor Mahsulot..."
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
              placeholder="Guruh turlari bo'yicha tavsif va qo'llanish sohasi..."
            ></textarea>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Material Turini O'chirish"
        message={`Haqiqatan ham '${deletingMat?.name}' material turi o'chirilsinmi?`}
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Yopish"
      />
    </div>
  );
};
