import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SettingsSubNav } from '../components/SettingsSubNav';
import { settingsApi } from '../api/settingsApi';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';

export const InsuranceTypesSettingsPage = () => {
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const [deletingItem, setDeletingItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    loadInsuranceTypes();
  }, []);

  const loadInsuranceTypes = async () => {
    setIsLoading(true);
    const res = await settingsApi.getInsuranceTypes();
    if (res.success && Array.isArray(res.data)) {
      setInsuranceTypes(res.data);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setStatus(item.status || 'ACTIVE');
    } else {
      setName('');
      setDescription('');
      setStatus('ACTIVE');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    if (editingItem) {
      const res = await settingsApi.updateInsuranceType(editingItem.id, {
        name,
        description,
        status,
      });
      if (res.success) {
        notifySuccess("Sug'urta turi tahrirlandi.");
        await loadInsuranceTypes();
      } else {
        notifyError("Sug'urta turini tahrirlashda xatolik yuz berdi.");
      }
    } else {
      const res = await settingsApi.createInsuranceType({
        name,
        description,
        status,
      });
      if (res.success) {
        notifySuccess("Yangi sug'urta turi yaratildi.");
        await loadInsuranceTypes();
      } else {
        notifyError("Sug'urta turi yaratishda xatolik yuz berdi.");
      }
    }
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsLoading(true);
    const res = await settingsApi.deleteInsuranceType(deletingItem.id);
    if (res.success) {
      notifySuccess("Sug'urta turi o'chirildi.");
      await loadInsuranceTypes();
    } else {
      notifyError("Sug'urta turini o'chirishda xatolik yuz berdi.");
    }
    setIsConfirmOpen(false);
    setDeletingItem(null);
    setIsLoading(false);
  };

  const columns = [
    { header: 'Sug\'urta Turi Nomi', accessor: 'name' },
    { header: 'Tavsifi va Qamrovi', accessor: 'description' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-primary"
            size="xs"
            onClick={() => handleOpenModal(row)}
          >
            <LuPencil size={13} />
          </Button>
          <Button
            variant="outline-danger"
            size="xs"
            onClick={() => handleDeleteClick(row)}
          >
            <LuTrash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="insurance-types-settings-page animate-fade-in pb-5">
      <SettingsSubNav />

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-main mb-1">Sug'urta Turlari</h4>
          <p className="text-muted-custom fs-7 mb-0">Zavod mulki, yuklar va xavflarni sug'urtalash kategoriyalari</p>
        </div>
        <Button variant="primary" size="sm" icon={<LuPlus />} onClick={() => handleOpenModal()}>
          Yangi Sug'urta Turi Yaratish
        </Button>
      </div>

      <Card title="Sug'urta Kategoriyalari Reyestri" isLoading={isLoading}>
        <Table columns={columns} data={insuranceTypes} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Sug'urta Turini Tahrirlash" : "Yangi Sug'urta Turi Yaratish"}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || !name.trim()}
            >
              Saqlash
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Input
            label="Sug'urta Nomi"
            placeholder="Xodimlar Baxtsiz Hodisalari Sug'urtasi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Tavsifi va Polis Shartlari"
            placeholder="Sex ishchilarini baxtsiz hodisalardan sug'urtalash"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {editingItem && (
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'ACTIVE', label: 'Faol' },
                { value: 'INACTIVE', label: 'Nofaol' },
              ]}
            />
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Sug'urta Turini O'chirish"
        message={`Haqiqatan ham '${deletingItem?.name}' sug'urta turini o'chirmoqchimisiz?`}
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
};
