import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuCircleCheck } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { RecipesSubNav } from '../components/RecipesSubNav';
import { RecipeFilterBar } from '../components/RecipeFilterBar';
import { RecipeFormModal } from '../components/RecipeFormModal';
import { recipesApi } from '../api/recipesApi';
import { productsApi } from '@/features/warehouse/api/productsApi';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';
import { formatCurrency } from '@/utils/currency.utils';

export const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, [search, productFilter, statusFilter]);

  const loadRecipes = async () => {
    const [recRes, prodRes] = await Promise.all([
      recipesApi.getRecipes({
        search,
        productId: productFilter,
        status: statusFilter,
      }),
      productsApi.getProducts(),
    ]);
    if (recRes.success) setRecipes(recRes.data);
    if (prodRes.success) setProducts(prodRes.data);
  };

  const handleSaveRecipe = async (formData) => {
    if (editingRecipe) {
      const res = await recipesApi.updateRecipe(editingRecipe.id, formData);
      if (res.success) notifySuccess(res.message);
    } else {
      const res = await recipesApi.createRecipe(formData);
      if (res.success) notifySuccess(res.message);
    }
    setIsModalOpen(false);
    setEditingRecipe(null);
    loadRecipes();
  };

  const handleActivate = async (id) => {
    const res = await recipesApi.activateVersion(id);
    if (res.success) {
      notifySuccess(res.message);
      loadRecipes();
    }
  };

  const handleDelete = async () => {
    if (deletingRecipe) {
      const res = await recipesApi.deleteRecipe(deletingRecipe.id);
      if (res.success) notifySuccess(res.message);
      setIsConfirmOpen(false);
      setDeletingRecipe(null);
      loadRecipes();
    }
  };

  const columns = [
    {
      header: 'Retsept Nomi',
      cell: (row) => (
        <div>
          <Link to={`${ROUTES.PROTECTED.RECIPES}/${row.id}`} className="fw-bold text-primary text-decoration-none fs-7">
            {row.recipeName}
          </Link>
          <small className="d-block text-muted-custom fs-8">{row.description || 'Izohsiz'}</small>
        </div>
      ),
    },
    {
      header: 'Tannarx (Xarajat)',
      cell: (row) => <span className="fw-semibold text-main">{formatCurrency(row.estimatedTotalCost || 0)}</span>,
    },
    {
      header: 'Versiya',
      cell: (row) => <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8 fw-bold">v{row.version}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`badge ${row.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} fs-8`}>
          {row.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
        </span>
      ),
    },
    { header: 'Yaratilgan Sana', accessor: 'createdDate' },
    { header: 'Yangilangan Sana', accessor: 'updatedDate' },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={`${ROUTES.PROTECTED.RECIPES}/${row.id}`}
            className="btn btn-sm btn-outline-primary p-1 border-0"
            title="Tafsilotini ko'rish"
          >
            <LuEye />
          </Link>
          <button
            className="btn btn-sm btn-outline-secondary p-1 border-0"
            onClick={() => {
              setEditingRecipe(row);
              setIsModalOpen(true);
            }}
            title="Tahrirlash"
          >
            <LuPencil />
          </button>
          {row.status !== 'ACTIVE' && (
            <button
              className="btn btn-sm btn-outline-success p-1 border-0"
              onClick={() => handleActivateVersion(row.id)}
              title="Ushbu Versiyani Faollashtirish"
            >
              <LuCircleCheck />
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-danger p-1 border-0"
            onClick={() => {
              setDeletingRecipe(row);
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
    <div className="recipes-page animate-fade-in pb-5">
      <RecipesSubNav />

      <PageHeader
        title="Retseptlar va Mahsulot Tarkibi"
        subtitle="Sanoat buyumlarini ishlab chiqarish texnologik xaritalari, sarf-xarajatlar va versiyalar"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Retseptlar' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingRecipe(null);
              setIsModalOpen(true);
            }}
          >
            <LuPlus className="me-1" /> Yangi Retsept Yaratish
          </Button>
        }
      />

      <RecipeFilterBar
        search={search}
        onSearchChange={setSearch}
        productFilter={productFilter}
        onProductChange={setProductFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        products={products}
      />

      <Card title={`Mavjud Texnologik Retseptlar (${recipes.length} ta)`}>
        <Table columns={columns} data={recipes} tableKey="recipes_list" />
      </Card>

      <RecipeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecipe(null);
        }}
        onSubmit={handleSaveRecipe}
        recipe={editingRecipe}
        products={products}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Retseptni O'chirish"
        message={`Haqiqatan ham '${deletingRecipe?.recipeName}' retseptura kartasi o'chirilsinmi?`}
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
};
