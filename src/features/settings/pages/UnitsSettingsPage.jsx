import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SettingsSubNav } from '../components/SettingsSubNav';
import { settingsApi } from '../api/settingsApi';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';

export const UnitsSettingsPage = () => {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [deletingItem, setDeletingItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const res = await settingsApi.getUnits();
    if (res.success && Array.isArray(res.data)) setUnits(res.data);
    setIsLoading(false);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setName(item?.name || '');
    setShortName(item?.shortName || item?.short_name || '');
    setDescription(item?.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    const payload = { name, short_name: shortName, description, status: 'ACTIVE' };
    if (editingItem) {
      const res = await settingsApi.updateUnit(editingItem.id, payload);
      if (res.success) { notifySuccess("O'lchov birligi tahrirlandi."); await loadData(); }
      else { notifyError("O'lchov birligini tahrirlashda xatolik yuz berdi."); }
    } else {
      const res = await settingsApi.createUnit(payload);
      if (res.success) { notifySuccess("O'lchov birligi yaratildi."); await loadData(); }
      else { notifyError("O'lchov birligi yaratishda xatolik yuz berdi."); }
    }
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsLoading(true);
    const res = await settingsApi.deleteUnit(deletingItem.id);
    if (res.success) { notifySuccess("O'lchov birligi o'chirildi."); await loadData(); }
    else { notifyError("O'lchov birligini o'chirishda xatolik yuz berdi."); }
    setIsConfirmOpen(false);
    setDeletingItem(null);
    setIsLoading(false);
  };

  const columns = [
    { header: 'Birlik Nomi', accessor: 'name' },
    { header: 'Qisqa Belgisi', cell: (row) => <span className="badge bg-secondary bg-opacity-10 text-secondary fw-bold">{row.shortName || row.short_name || '-'}</span> },
    { header: 'Tavsifi', accessor: 'description' },
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
    <div className="units-settings-page animate-fade-in pb-5">
      <SettingsSubNav />
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-main mb-1">O'lchov Birliklari</h4>
          <p className="text-muted-custom fs-7 mb-0">Omborxona va ishlab chiqarishda qo'llaniladigan standart o'lchov birliklari</p>
        </div>
        <Button variant="primary" size="sm" icon={<LuPlus />} onClick={() => handleOpenModal()}>Yangi Birlik Qo'shish</Button>
      </div>
      <Card title="Standart O'lchov Birliklari Reyestri" isLoading={isLoading}>
        <Table columns={columns} data={units} />
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "O'lchov Birligini Tahrirlash" : "Yangi O'lchov Birligi Qo'shish"}
        footer={<div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading || !name.trim()}>Saqlash</Button>
        </div>}>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Input label="Birlik Nomi (masalan: Tonna)" placeholder="Tonna" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Qisqa Belgisi (t)" placeholder="t" value={shortName} onChange={(e) => setShortName(e.target.value)} />
          <Input label="Tavsifi" placeholder="Og'ir yuklar uchun tonna o'lchovi" value={description} onChange={(e) => setDescription(e.target.value)} />
        </form>
      </Modal>
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => { setIsConfirmOpen(false); setDeletingItem(null); }} onConfirm={handleConfirmDelete}
        title="O'lchov Birligini O'chirish" message={`Haqiqatan ham '${deletingItem?.name}' birligini o'chirmoqchimisiz?`} isDanger confirmText="O'chirish" cancelText="Bekor qilish" />
    </div>
  );
};
