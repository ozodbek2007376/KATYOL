import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuTruck, LuPlus, LuEye, LuPencil, LuTrash2, LuPhone, LuMail } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SupplierFormModal } from '../components/SupplierFormModal';
import { suppliersApi } from '../api/suppliersApi';
import { usePermission } from '@/hooks/usePermission';
import { ROUTES } from '@/constants/routes.constants';
import { notifyError, notifySuccess } from '@/services/notification.service';

export const SuppliersPage = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermission();

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadSuppliersData();
  }, [search, categoryFilter, statusFilter]);

  const loadSuppliersData = async () => {
    const [supRes, catRes] = await Promise.all([
      suppliersApi.getSuppliers({ search, category: categoryFilter, status: statusFilter }),
      suppliersApi.getSupplierCategories(),
    ]);
    if (supRes.success) setSuppliers(supRes.data);
    if (catRes.success) setCategories(catRes.data);
  };

  const handleOpenAddModal = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, supplier) => {
    e.stopPropagation();
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (e, id) => {
    e.stopPropagation();
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteSupplier = async () => {
    if (!deleteId) return;
    const res = await suppliersApi.deleteSupplier(deleteId);
    if (res.success) {
      notifySuccess(res.message || "Ta'minotchi o'chirildi.");
    } else {
      notifyError(res.message || "Ta'minotchini o'chirishda xatolik.");
    }
    setIsConfirmOpen(false);
    setDeleteId(null);
    loadSuppliersData();
  };

  const categoryOptions = [
    { value: '', label: 'Barcha Kategoriyalar' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const statusOptions = [
    { value: '', label: 'Barcha Statuslar' },
    { value: 'ACTIVE', label: 'Faol' },
    { value: 'INACTIVE', label: 'Nofaol' },
  ];

  const handleReset = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const columns = [
    {
      header: 'Ta\'minotchi Korxona',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7 d-block">{row.name}</strong>
          <small className="text-muted-custom fs-8">Kategoriya: {row.categoryName}</small>
        </div>
      ),
    },
    {
      header: 'Mas\'ul Xodim va Kontakt',
      cell: (row) => (
        <div>
          <span className="fw-medium text-main fs-7 d-block">{row.contactPerson}</span>
          <small className="text-muted-custom d-flex align-items-center gap-1 fs-8">
            <LuPhone className="text-primary" /> {row.phone}
          </small>
        </div>
      ),
    },
    {
      header: 'E-mail va Manzil',
      cell: (row) => (
        <div>
          <small className="text-main d-flex align-items-center gap-1 fs-8">
            <LuMail className="text-warning" /> {row.email}
          </small>
          <small className="text-muted-custom fs-8 d-block">{row.address}</small>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={`badge ${
            row.status === 'ACTIVE' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'
          } fs-8`}
        >
          {row.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
        </span>
      ),
    },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <button
            className="btn btn-sm btn-outline-primary p-1 border-0"
            onClick={() => navigate(`${ROUTES.PROTECTED.SUPPLIERS}/${row.id}`)}
            title="Tafsilotini ko'rish"
          >
            <LuEye />
          </button>
          {canEdit && (
            <button
              className="btn btn-sm btn-outline-warning p-1 border-0"
              onClick={(e) => handleOpenEditModal(e, row)}
              title="Tahrirlash"
            >
              <LuPencil />
            </button>
          )}
          {canDelete && (
            <button
              className="btn btn-sm btn-outline-danger p-1 border-0"
              onClick={(e) => handleDeleteSupplier(e, row.id)}
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
    <div className="suppliers-page animate-fade-in pb-5">
      <PageHeader
        title="Ta'minotchilar Katalogi"
        subtitle="Xomashyo, metall va ehtiyot qismlar ta'minotchi korxonalari reyestri"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Ta\'minotchilar' },
        ]}
        actions={
          canCreate && (
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handleOpenAddModal}>
              <LuPlus />
              <span>Yangi Ta'minotchi</span>
            </button>
          )
        }
      />

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Ta'minotchi nomi, mas'ul xodim yoki telefon bo'yicha qidiruv...",
        }}
        primarySelects={[
          { id: 'category', label: 'Kategoriya', value: categoryFilter, onChange: setCategoryFilter, options: categoryOptions },
          { id: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: statusOptions },
        ]}
        onReset={handleReset}
      />

      <Card title={`Ta'minotchilar Ro'yxati (${suppliers.length} ta)`}>
        <Table columns={columns} data={suppliers} tableKey="suppliers_list" />
      </Card>

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={selectedSupplier}
        onSave={loadSuppliersData}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteSupplier}
        title="Ta'minotchini O'chirish"
        message="Haqiqatan ham ushbu ta'minotchi korxonani tizimdan o'chirmoqchimisiz?"
      />
    </div>
  );
};
