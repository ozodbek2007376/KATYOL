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

export const WarrantyTypesSettingsPage = () => {
  const [warrantyTypes, setWarrantyTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [deletingItem, setDeletingItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const res = await settingsApi.getWarrantyTypes();
    if (res.success && Array.isArray(res.data)) setWarrantyTypes(res.data);
    setIsLoading(false);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setName(item?.name || '');
    setDuration(item?.duration || item?.duration_months || '');
    setDescription(item?.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    const payload = { name, duration_months: Number(duration) || 0, description, status: 'ACTIVE' };
    if (editingItem) {
      const res = await settingsApi.updateWarrantyType(editingItem.id, payload);
      if (res.success) { notifySuccess("Kafolat turi tahrirlandi."); await loadData(); }
      else { notifyError("Kafolat turini tahrirlashda xatolik yuz berdi."); }
    } else {
      const res = await settingsApi.createWarrantyType(payload);
      if (res.success) { notifySuccess("Kafolat turi yaratildi."); await loadData(); }
      else { notifyError("Kafolat turi yaratishda xatolik yuz berdi."); }
    }
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsLoading(true);
    const res = await settingsApi.deleteWarrantyType(deletingItem.id);
    if (res.success) { notifySuccess("Kafolat turi o'chirildi."); await loadData(); }
    else { notifyError("Kafolat turini o'chirishda xatolik yuz berdi."); }
    setIsConfirmOpen(false);
    setDeletingItem(null);
    setIsLoading(false);
  };

  const columns = [
    { header: 'Kafolat Turi Nomi', accessor: 'name' },
    { header: 'Muddati', cell: (row) => <span className="fw-bold text-main">{row.duration || row.duration_months || 0} oy</span> },
    { header: 'Kafolat Shartlari Tavsifi', accessor: 'description' },
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
    <div className="warranty-types-settings-page animate-fade-in pb-5">
      <SettingsSubNav />
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-main mb-1">Kafolat Turlari va Muddatlari</h4>
          <p className="text-muted-custom fs-7 mb-0">Mahsulotlar va uskunalarga beriladigan kafolat turlari</p>
        </div>
        <Button variant="primary" size="sm" icon={<LuPlus />} onClick={() => handleOpenModal()}>Yangi Kafolat Turi Yaratish</Button>
      </div>
      <Card title="Kafolat Shartlari Katalogi" isLoading={isLoading}>
        <Table columns={columns} data={warrantyTypes} />
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Kafolat Turini Tahrirlash" : "Yangi Kafolat Turi Yaratish"}
        footer={<div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading || !name.trim()}>Saqlash</Button>
        </div>}>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Input label="Kafolat Nomi" placeholder="6 Oylik Sinov Kafolati" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Muddati" placeholder="6" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <Input label="Tavsifi" placeholder="Ehtiyot qismlarga 6 oylik almashtirish kafolati" value={description} onChange={(e) => setDescription(e.target.value)} />
        </form>
      </Modal>
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => { setIsConfirmOpen(false); setDeletingItem(null); }} onConfirm={handleConfirmDelete}
        title="Kafolat Turini O'chirish" message={`Haqiqatan ham '${deletingItem?.name}' kafolat turini o'chirmoqchimisiz?`} isDanger confirmText="O'chirish" cancelText="Bekor qilish" />
    </div>
  );
};
