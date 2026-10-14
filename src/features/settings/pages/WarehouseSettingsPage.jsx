import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SettingsSubNav } from '../components/SettingsSubNav';
import { settingsApi } from '../api/settingsApi';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';

export const WarehouseSettingsPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deletingItem, setDeletingItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const res = await settingsApi.getWarehouses();
    if (res.success && Array.isArray(res.data)) setWarehouses(res.data);
    setIsLoading(false);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setName(item?.name || '');
    setDescription(item?.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    const payload = { name, description, status: 'ACTIVE' };
    if (editingItem) {
      const res = await settingsApi.updateWarehouse(editingItem.id, payload);
      if (res.success) { notifySuccess("Ombor tahrirlandi."); await loadData(); }
      else { notifyError("Omborni tahrirlashda xatolik yuz berdi."); }
    } else {
      const res = await settingsApi.createWarehouse(payload);
      if (res.success) { notifySuccess("Yangi ombor yaratildi."); await loadData(); }
      else { notifyError("Ombor yaratishda xatolik yuz berdi."); }
    }
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsLoading(true);
    const res = await settingsApi.deleteWarehouse(deletingItem.id);
    if (res.success) { notifySuccess("Ombor o'chirildi."); await loadData(); }
    else { notifyError("Omborni o'chirishda xatolik yuz berdi."); }
    setIsConfirmOpen(false);
    setDeletingItem(null);
    setIsLoading(false);
  };

  const columns = [
    { header: 'Ombor Nomi', accessor: 'name' },
    { header: 'Tavsifi', accessor: 'description' },
    {
      header: 'Standart Ombor',
      cell: (row) =>
        row.isDefault || row.is_default ? (
          <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">Asosiy Ombor</span>
        ) : (
          <span className="text-muted-custom fs-8">Qo'shimcha</span>
        ),
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline-primary" size="xs" onClick={() => handleOpenModal(row)}><LuPencil size={13} /></Button>
          <Button variant="outline-danger" size="xs" onClick={() => { setDeletingItem(row); setIsConfirmOpen(true); }}><LuTrash2 size={13} /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="warehouse-settings-page animate-fade-in pb-5">
      <SettingsSubNav />
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-main mb-1">Omborlar Sozlamalari</h4>
          <p className="text-muted-custom fs-7 mb-0">Xomashyo va tayyor mahsulot omborlari ro'yxati</p>
        </div>
        <Button variant="primary" size="sm" icon={<LuPlus />} onClick={() => handleOpenModal()}>Yangi Ombor Yaratish</Button>
      </div>
      <Card title="Korxona Omborlari Reyestri" isLoading={isLoading}>
        <Table columns={columns} data={warehouses} />
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Omborni Tahrirlash" : "Yangi Ombor Yaratish"}
        footer={<div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading || !name.trim()}>Saqlash</Button>
        </div>}>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Input label="Ombor Nomi" placeholder="Elektrotexnika Qismlari Ombori" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Tavsif va Sex Biriktiruvi" placeholder="B-sexdagi omborxona" value={description} onChange={(e) => setDescription(e.target.value)} />
        </form>
      </Modal>
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => { setIsConfirmOpen(false); setDeletingItem(null); }} onConfirm={handleConfirmDelete}
        title="Omborni O'chirish" message={`Haqiqatan ham '${deletingItem?.name}' omborini o'chirmoqchimisiz?`} isDanger confirmText="O'chirish" cancelText="Bekor qilish" />
    </div>
  );
};
