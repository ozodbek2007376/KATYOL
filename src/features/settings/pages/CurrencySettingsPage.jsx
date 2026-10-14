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

export const CurrencySettingsPage = () => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [rateToUSD, setRateToUSD] = useState('');
  const [deletingItem, setDeletingItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const res = await settingsApi.getCurrencies();
    if (res.success && Array.isArray(res.data)) setCurrencies(res.data);
    setIsLoading(false);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setCode(item?.code || '');
    setName(item?.name || '');
    setSymbol(item?.symbol || '');
    setRateToUSD(item?.rateToUSD || item?.rate_to_usd || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!code.trim()) return;
    setIsLoading(true);
    const payload = { code, name, symbol, rate_to_usd: rateToUSD, status: 'ACTIVE' };
    if (editingItem) {
      const res = await settingsApi.updateCurrency(editingItem.id, payload);
      if (res.success) { notifySuccess("Valyuta tahrirlandi."); await loadData(); }
      else { notifyError("Valyutani tahrirlashda xatolik yuz berdi."); }
    } else {
      const res = await settingsApi.createCurrency(payload);
      if (res.success) { notifySuccess("Yangi valyuta qo'shildi."); await loadData(); }
      else { notifyError("Valyuta yaratishda xatolik yuz berdi."); }
    }
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const handleSetDefault = async (id) => {
    const updated = currencies.map((c) => ({ ...c, isDefault: c.id === id }));
    setCurrencies(updated);
    notifySuccess("Standart hisob-kitob valyutasi o'zgartirildi.");
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsLoading(true);
    const res = await settingsApi.deleteCurrency(deletingItem.id);
    if (res.success) { notifySuccess("Valyuta o'chirildi."); await loadData(); }
    else { notifyError("Valyutani o'chirishda xatolik yuz berdi."); }
    setIsConfirmOpen(false);
    setDeletingItem(null);
    setIsLoading(false);
  };

  const columns = [
    { header: 'Valyuta Kodu', accessor: 'code' },
    { header: 'Valyuta Nomi', accessor: 'name' },
    { header: 'Simvol', accessor: 'symbol' },
    { header: 'USD Kursi', cell: (row) => row.rateToUSD || row.rate_to_usd || '-' },
    {
      header: 'Asosiy Valyuta',
      cell: (row) =>
        row.isDefault || row.is_default ? (
          <span className="badge bg-success bg-opacity-10 text-success fw-semibold">
            <i className="bi bi-star-fill me-1"></i> Asosiy Valyuta
          </span>
        ) : (
          <button className="btn btn-sm btn-outline-secondary py-0 px-2 fs-8" onClick={() => handleSetDefault(row.id)}>
            Asosiy qilish
          </button>
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
    <div className="currency-settings-page animate-fade-in pb-5">
      <SettingsSubNav />
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-main mb-1">Valyutalar va Kurslar Sozlamalari</h4>
          <p className="text-muted-custom fs-7 mb-0">Ko'p valyutali hisob-kitoblar va ayirboshlash kurslari</p>
        </div>
        <Button variant="primary" size="sm" icon={<LuPlus />} onClick={() => handleOpenModal()}>Yangi Valyuta Qo'shish</Button>
      </div>
      <Card title="Tizimdagi Valyutalar Ro'yxati" isLoading={isLoading}>
        <Table columns={columns} data={currencies} />
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Valyutani Tahrirlash" : "Yangi Valyuta Qo'shish"}
        footer={<div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isLoading || !code.trim()}>Saqlash</Button>
        </div>}>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Input label="Valyuta Kodu (masalan: UZS, USD)" placeholder="USD" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Input label="Valyuta Nomi" placeholder="AQSH Dollari" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Simvoli ($ / € / so'm)" placeholder="$" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          <Input label="USD ga nisbatan kursi" placeholder="1.0" value={rateToUSD} onChange={(e) => setRateToUSD(e.target.value)} />
        </form>
      </Modal>
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => { setIsConfirmOpen(false); setDeletingItem(null); }} onConfirm={handleConfirmDelete}
        title="Valyutani O'chirish" message={`Haqiqatan ham '${deletingItem?.name || deletingItem?.code}' valyutasini o'chirmoqchimisiz?`} isDanger confirmText="O'chirish" cancelText="Bekor qilish" />
    </div>
  );
};
