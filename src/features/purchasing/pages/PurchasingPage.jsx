import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuShoppingBag, LuPlus, LuEye, LuPencil, LuTrash2, LuCheck } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { PurchasingSubNav } from '../components/PurchasingSubNav';
import { PurchaseFormModal } from '../components/PurchaseFormModal';
import { purchasingApi } from '../api/purchasingApi';
import { formatCurrency } from '@/utils/currency.utils';
import { usePermission } from '@/hooks/usePermission';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { ROUTES } from '@/constants/routes.constants';
import { notifyError, notifySuccess } from '@/services/notification.service';

export const PurchasingPage = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermission();

  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [purchasingStatuses, setPurchasingStatuses] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadPurchasesData();
  }, [search, supplierFilter, statusFilter]);

  const loadPurchasesData = async () => {
    const [purRes, supRes, stRes] = await Promise.all([
      purchasingApi.getPurchases({ search, supplierId: supplierFilter, status: statusFilter }),
      purchasingApi.getSuppliersList(),
      purchasingApi.getPurchasingStatuses(),
    ]);

    if (purRes.success) setPurchases(purRes.data);
    if (supRes.success) setSuppliers(supRes.data);
    if (stRes.success) setPurchasingStatuses(stRes.data);
  };

  usePageAutoRefresh(loadPurchasesData, { intervalMs: 15000, isEditing: isModalOpen || isConfirmOpen });

  const handleOpenAddModal = () => {
    setSelectedPurchase(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, purchase) => {
    e.stopPropagation();
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (e, id) => {
    e.stopPropagation();
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleDeletePurchase = async () => {
    if (!deleteId) return;
    const res = await purchasingApi.deletePurchase(deleteId);
    if (res.success) {
      notifySuccess(res.message || "Xarid hujjati o'chirildi.");
    } else {
      notifyError(res.message || "Xarid hujjatini o'chirishda xatolik.");
    }
    setIsConfirmOpen(false);
    setDeleteId(null);
    loadPurchasesData();
  };

  const handleReceiveStock = async (e, id) => {
    e.stopPropagation();
    const res = await purchasingApi.receiveStock(id);
    if (res.success) {
      notifySuccess(res.message || 'Omborga kirim qilindi.');
    } else {
      notifyError(res.message || 'Omborga kirim qilishda xatolik.');
    }
    loadPurchasesData();
  };

  const supplierOptions = [
    { value: '', label: 'Barcha Ta\'minotchilar' },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ];

  const statusOptions = [
    { value: '', label: 'Barcha Statuslar' },
    ...purchasingStatuses.map((st) => ({ value: st.code, label: st.name })),
  ];

  const handleReset = () => {
    setSearch('');
    setSupplierFilter('');
    setStatusFilter('');
  };

  const columns = [
    {
      header: 'Xarid Nomeri va Hujjat',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7 d-block">{row.purchaseNumber}</strong>
          <small className="text-muted-custom fs-8">Hujjat: {row.invoiceNumber || '—'}</small>
        </div>
      ),
    },
    {
      header: 'Ta\'minotchi Korxona',
      cell: (row) => (
        <div>
          <span className="fw-semibold text-main fs-7 d-block">{row.supplierName}</span>
          <small className="text-secondary fs-8">Mas'ul: {row.createdBy}</small>
        </div>
      ),
    },
    {
      header: 'Kirim Ombori',
      cell: (row) => <span className="fw-medium text-main fs-7">{row.warehouseName}</span>,
    },
    {
      header: 'Sana',
      cell: (row) => <small className="text-muted-custom">{row.orderDate}</small>,
    },
    {
      header: 'Jami Summa',
      cell: (row) => <strong className="text-primary fs-7">{formatCurrency(row.totalAmount, row.currency)}</strong>,
    },
    {
      header: 'Status',
      cell: (row) => {
        const isReceived = row.status === 'RECEIVED';
        const isDraft = row.status === 'DRAFT';
        return (
          <span
            className={`badge ${
              isReceived ? 'bg-success' : isDraft ? 'bg-secondary' : 'bg-warning text-dark'
            } fs-8`}
          >
            {row.statusName}
          </span>
        );
      },
    },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <button
            className="btn btn-sm btn-outline-primary p-1 border-0"
            onClick={() => navigate(`${ROUTES.PROTECTED.PURCHASING}/${row.id}`)}
            title="Tafsilotini ko'rish"
          >
            <LuEye />
          </button>
          {row.status !== 'RECEIVED' && canEdit && (
            <button
              className="btn btn-sm btn-outline-success p-1 border-0"
              onClick={(e) => handleReceiveStock(e, row.id)}
              title="Omborga Kirim Qilish"
            >
              <LuCheck />
            </button>
          )}
          {row.status === 'DRAFT' && canEdit && (
            <button
              className="btn btn-sm btn-outline-warning p-1 border-0"
              onClick={(e) => handleOpenEditModal(e, row)}
              title="Tahrirlash"
            >
              <LuPencil />
            </button>
          )}
          {row.status === 'DRAFT' && canDelete && (
            <button
              className="btn btn-sm btn-outline-danger p-1 border-0"
              onClick={(e) => handleOpenDeleteConfirm(e, row.id)}
              title="O'chirish"
            >
              <LuTrash2 />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="purchasing-page animate-fade-in pb-5">
      <PageHeader
        title="Xaridlar va Ta'minot Moduli"
        subtitle="Ta'minotchi korxonalardan xomashyo va mahsulotlar xaridi hamda omborga kirim"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Xaridlar' },
        ]}
        actions={
          canCreate && (
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handleOpenAddModal}>
              <LuPlus />
              <span>Yangi Xarid</span>
            </button>
          )
        }
      />

      <PurchasingSubNav />

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Xarid №, hujjat yoki ta'minotchi bo'yicha qidiruv...",
        }}
        primarySelects={[
          { id: 'supplier', label: 'Ta\'minotchi', value: supplierFilter, onChange: setSupplierFilter, options: supplierOptions },
          { id: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: statusOptions },
        ]}
        onReset={handleReset}
      />

      <Card title={`Xarid Buyurtmalari Ro'yxati (${purchases.length} ta)`}>
        <Table columns={columns} data={purchases} tableKey="purchasing_list" />
      </Card>

      <PurchaseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        purchase={selectedPurchase}
        onSave={loadPurchasesData}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeletePurchase}
        title="Xarid Hujjatini O'chirish"
        message="Haqiqatan ham ushbu qoralama xarid hujjatini tizimdan o'chirmoqchimisiz?"
      />
    </div>
  );
};
