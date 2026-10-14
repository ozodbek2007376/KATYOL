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

export const DefectReasonsSettingsPage = () => {
  const [defectReasons, setDefectReasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [affectsFinance, setAffectsFinance] = useState('false');
  const [deletingItem, setDeletingItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const res = await settingsApi.getDefectReasons();
    if (res.success && Array.isArray(res.data)) setDefectReasons(res.data);
    setIsLoading(false);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setName(item?.name || '');
    setDescription(item?.description || '');
    setAffectsFinance(String(item?.affectsFinance || item?.affects_finance || false));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    const payload = { name, description, affects_finance: affectsFinance === 'true', status: 'ACTIVE' };
    if (editingItem) {
      const res = await settingsApi.updateDefectReason(editingItem.id, payload);
      if (res.success) { notifySuccess("Defekt sababi tahrirlandi."); await loadData(); }
      else { notifyError("Defekt sababini tahrirlashda xatolik yuz berdi."); }
    } else {
      const res = await settingsApi.createDefectReason(payload);
      if (res.success) { notifySuccess("Defekt sababi yaratildi."); await loadData(); }
      else { notifyError("Defekt sababini yaratishda xatolik yuz berdi."); }
    }
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsLoading(true);
    const res = await settingsApi.deleteDefectReason(deletingItem.id);
    if (res.success) { notifySuccess("Defekt sababi o'chirildi."); await loadData(); }
    else { notifyError("Defekt sababini o'chirishda xatolik yuz berdi."); }
    setIsConfirmOpen(false);
    setDeletingItem(null);
    setIsLoading(false);
  };

  const columns = [
    { header: 'Nuqson / Defekt Sababi Nomi', accessor: 'name' },
    { header: 'Tavsifi', accessor: 'description' },
    {
      header: 'Moliyaga Ta\'siri',
      cell: (row) =>
        (row.affectsFinance || row.affects_finance) ? (
          <span className="badge bg-danger bg-opacity-10 text-danger fw-semibold">Ha — Chiqim qilinadi</span>
        ) : (
          <span className="badge bg-secondary bg-opacity-10 text-secondary fw-semibold">Yo'q — Qayta ishlanadi</span>
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
    <div className="defect-reasons-settings-page animate-fade-in pb-5">
      <SettingsSubNav />
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-main mb-1">Defekt va Nuqson Sabablari</h4>
          <p className="text-muted-custom fs-7 mb-0">Omborxona brak hisobi va ishlab chiqarish sifat nazorati sabablari</p>
        </div>
        <Button variant="primary" size="sm" icon={<LuPlus />} onClick={() => handleOpenModal()}>Yangi Sabab Qo'shish</Button>
      </div>
      <Card title="Defekt Sabablari Katalogi" isLoading={isLoading}>
        <Table columns={columns} data={defectReasons} />
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Defekt Sababini Tahrirlash" : "Yangi Defekt Sababini Yaratish"}
        footer={<div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading || !name.trim()}>Saqlash</Button>
        </div>}>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Input label="Sabab Nomi" placeholder="Harorat me'yori buzilishi" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Tavsifi" placeholder="Pech harorati pastligi sababli to'liq pishmaslik" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select label="Moliyaviy Chiqimga Ta'siri" value={affectsFinance} onChange={(e) => setAffectsFinance(e.target.value)}
            options={[{ value: 'true', label: "Ha — Chiqim hisoblanadi" }, { value: 'false', label: "Yo'q — Qayta ishlanadi" }]} />
        </form>
      </Modal>
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => { setIsConfirmOpen(false); setDeletingItem(null); }} onConfirm={handleConfirmDelete}
        title="Defekt Sababini O'chirish" message={`Haqiqatan ham '${deletingItem?.name}' sababini o'chirmoqchimisiz?`} isDanger confirmText="O'chirish" cancelText="Bekor qilish" />
    </div>
  );
};
