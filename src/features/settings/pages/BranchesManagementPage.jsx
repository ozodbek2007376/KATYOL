import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { branchesApi } from '../api/branchesApi';
import { notifySuccess } from '@/services/notification.service';
import { ERP_ICONS } from '@/shared/icons';

export const BranchesManagementPage = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal and editing states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setIsLoading(false);
    try {
      const res = await branchesApi.getBranches();
      if (res.success) {
        setBranches(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setCode(branch.code);
    setAddress(branch.address || '');
    setPhone(branch.phone || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { name, code, address, phone };
    try {
      if (editingBranch) {
        const res = await branchesApi.updateBranch(editingBranch.id, payload);
        if (res.success) {
          notifySuccess("Filial ma'lumotlari tahrirlandi.");
        }
      } else {
        const res = await branchesApi.createBranch(payload);
        if (res.success) {
          notifySuccess("Yangi filial muvaffaqiyatli qo'shildi.");
        }
      }
      setIsModalOpen(false);
      loadBranches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await branchesApi.deleteBranch(deletingId);
      if (res.success) {
        notifySuccess("Filial muvaffaqiyatli arxivlandi.");
        setDeletingId(null);
        loadBranches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Filial Nomi', accessor: 'name' },
    { header: 'Filial Kodi', accessor: 'code' },
    { header: 'Manzil', accessor: (row) => row.address || '—' },
    { header: 'Telefon', accessor: (row) => row.phone || '—' },
    {
      header: 'Holat',
      cell: (row) => (
        <span className={`badge bg-${row.status === 'ACTIVE' ? 'success' : 'secondary'} bg-opacity-10 text-${row.status === 'ACTIVE' ? 'success' : 'secondary'} fw-semibold`}>
          {row.status === 'ACTIVE' ? 'Faol' : 'Arxivlangan'}
        </span>
      ),
    },
    {
      header: 'Amal',
      cell: (row) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm btn-outline-warning p-1 border-0"
            onClick={() => handleOpenEdit(row)}
            title="Tahrirlash"
          >
            <i className={`bi ${ERP_ICONS.EDIT}`}></i>
          </button>
          {row.status === 'ACTIVE' && (
            <button
              className="btn btn-sm btn-outline-danger p-1 border-0"
              onClick={() => setDeletingId(row.id)}
              title="O'chirish"
            >
              <i className={`bi ${ERP_ICONS.TRASH}`}></i>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="branches-page animate-fade-in pb-5">
      <PageHeader
        title="Filiallar Boshqaruvi"
        subtitle="Kompaniyaning barcha mustaqil va hududiy filiallari ro'yxati"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sozlamalar', path: '/settings' },
          { label: 'Filiallar' },
        ]}
        actions={
          <Button variant="primary" size="sm" icon={ERP_ICONS.PLUS} onClick={handleOpenAdd}>
            Yangi Filial Qo'shish
          </Button>
        }
      />

      <Card title={`Mavjud filiallar (${branches.length} ta)`}>
        <Table columns={columns} data={branches} loading={isLoading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? "Filialni Tahrirlash" : "Yangi Filial Qo'shish"}
      >
        <form onSubmit={handleSave} className="d-flex flex-column gap-3">
          <Input
            label="Filial Nomi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Masalan, Samarqand Filiali"
          />
          <Input
            label="Filial Kodi"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Masalan, BR-SAM"
          />
          <Input
            label="Telefon Raqami"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Masalan, +998931234567"
          />
          <Input
            label="Manzil"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Masalan, Samarqand shahri, Dahbed ko'chasi, 12-uy"
          />
          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button variant="outline-secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" type="submit">
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Filialni Arxivlash"
        message="Haqiqatan ham ushbu filialni arxivlamoqchimisiz? Arxivlashdan keyin ushbu filial ma'lumotlari hisobotlarda ishtirok etmaydi."
        isDanger={true}
        confirmText="Arxivlash"
        cancelText="Bekor qilish"
      />
    </div>
  );
};
