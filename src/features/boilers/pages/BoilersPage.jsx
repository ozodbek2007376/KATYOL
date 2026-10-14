import { formatCurrency, getCurrencySymbol } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuFlame } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { BoilersSubNav } from '../components/BoilersSubNav';
import { BoilerFilterBar } from '../components/BoilerFilterBar';
import { BoilerFormModal } from '../components/BoilerFormModal';
import { boilersApi } from '../api/boilersApi';
import { recipesApi } from '@/features/recipes/api/recipesApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const BoilersPage = () => {
  const [boilers, setBoilers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoiler, setEditingBoiler] = useState(null);
  const [deletingBoiler, setDeletingBoiler] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    loadBoilersData();
  }, [search, statusFilter]);

  const loadBoilersData = async () => {
    const [boilRes, recRes] = await Promise.all([
      boilersApi.getBoilers({ search, status: statusFilter }),
      recipesApi.getRecipes(),
    ]);
    if (boilRes.success) setBoilers(boilRes.data);
    if (recRes.success) setRecipes(recRes.data);
  };

  // Background Auto-Refresh every 15s (Pauses while modal is open)
  usePageAutoRefresh(loadBoilersData, { intervalMs: 15000, isEditing: isModalOpen || isConfirmOpen });

  const handleCreateOrUpdate = async (formData) => {
    if (editingBoiler) {
      const res = await boilersApi.updateBoiler(editingBoiler.id, formData);
      notifySuccess(res.message);
    } else {
      const res = await boilersApi.createBoiler(formData);
      if (!res.success) {
        notifySuccess(res.message);
        return;
      }
      notifySuccess(res.message);
    }
    setIsModalOpen(false);
    setEditingBoiler(null);
    loadBoilersData();
  };

  const handleDelete = async () => {
    if (deletingBoiler) {
      const res = await boilersApi.deleteBoiler(deletingBoiler.id);
      notifySuccess(res.message);
      setIsConfirmOpen(false);
      setDeletingBoiler(null);
      loadBoilersData();
    }
  };

  const columns = [
    {
      header: 'Model Nomi',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <LuFlame className="fs-5" />
          </div>
          <div>
            <Link to={`${ROUTES.PROTECTED.BOILERS}/${row.id}`} className="fw-bold text-primary text-decoration-none fs-7">
              {row.modelName}
            </Link>
            <small className="d-block text-muted-custom fs-8">SKU: {row.internalCode}</small>
          </div>
        </div>
      ),
    },
    { header: 'Biriktirilgan Retsept', accessor: 'recipeName' },
    { header: 'Kafolat Turi', accessor: 'warrantyTypeName' },
    { header: 'Sug\'urta Turi', accessor: 'insuranceTypeName' },
    {
      header: `Taxminiy Tannarx (${getCurrencySymbol()})`,
      cell: (row) => <strong className="text-primary fs-7">{formatCurrency(row.costBreakdown?.totalCost || 0)}</strong>,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={`${ROUTES.PROTECTED.BOILERS}/${row.id}`}
            className="btn btn-sm btn-outline-primary p-1 border-0"
            title="Tafsilotini ko'rish"
          >
            <LuEye />
          </Link>
          <button
            className="btn btn-sm btn-outline-secondary p-1 border-0"
            onClick={() => {
              setEditingBoiler(row);
              setIsModalOpen(true);
            }}
            title="Tahrirlash"
          >
            <LuPencil />
          </button>
          <button
            className="btn btn-sm btn-outline-danger p-1 border-0"
            onClick={() => {
              setDeletingBoiler(row);
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
    <div className="boilers-page animate-fade-in pb-5">
      <BoilersSubNav />

      <PageHeader
        title="Tayyor Mahsulotlar Katalogi (Kotyol Turlari)"
        subtitle="Kompaniya tarafidan ishlab chiqariladigan kotyol va og'ir sanoat pechlari modellari reyestri"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Kotyol Turlari' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingBoiler(null);
              setIsModalOpen(true);
            }}
          >
            <LuPlus className="me-1" /> Yangi Kotyol Qo'shish
          </Button>
        }
      />

      <BoilerFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <Card title={`Mavjud Kotyol Modellari Katalogi (${boilers.length} ta)`}>
        <Table columns={columns} data={boilers} tableKey="boilers_list" />
      </Card>

      <BoilerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBoiler(null);
        }}
        onSubmit={handleCreateOrUpdate}
        boiler={editingBoiler}
        recipes={recipes}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Kotyol Modelini O'chirish"
        message={`Haqiqatan ham '${deletingBoiler?.modelName}' kotyol modeli katalogdan o'chirilsinmi?`}
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
};
