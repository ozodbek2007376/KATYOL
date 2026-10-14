import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { ProductFilterBar } from '../components/ProductFilterBar';
import { ProductFormModal } from '../components/ProductFormModal';
import { productsApi } from '../api/productsApi';
import { suppliersApi } from '@/features/suppliers/api/suppliersApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { ERP_ICONS } from '@/shared/icons';
import { ROUTES } from '@/constants/routes.constants';
import { WarehouseSubNav } from '@/features/warehouse/components/WarehouseSubNav';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const categories = dynamicSettingsService.getCategories();
  const materialTypes = dynamicSettingsService.getMaterialTypes();

  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter, materialFilter, supplierFilter, statusFilter]);

  const loadProducts = async () => {
    const [prodRes, supRes] = await Promise.all([
      productsApi.getProducts({
        search,
        categoryId: categoryFilter,
        materialTypeId: materialFilter,
        supplierId: supplierFilter,
        status: statusFilter,
      }),
      suppliersApi.getSuppliers(),
    ]);
    if (prodRes.success) setProducts(prodRes.data);
    if (supRes.success) setSuppliers(supRes.data);
  };

  const handleSaveProduct = async (formData) => {
    if (editingProduct) {
      const res = await productsApi.updateProduct(editingProduct.id, formData);
      if (res.success) {
        notifySuccess(res.message);
      } else {
        notifyError(res.message || "Mahsulotni tahrirlashda xatolik yuz berdi.");
      }
    } else {
      const res = await productsApi.createProduct(formData);
      if (res.success) {
        notifySuccess(res.message);
      } else {
        notifyError(res.message || "Mahsulot yaratishda xatolik yuz berdi.");
      }
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleDelete = async () => {
    if (deletingProduct) {
      const res = await productsApi.deleteProduct(deletingProduct.id);
      if (res.success) {
        notifySuccess(res.message);
      } else {
        notifyError(res.message || "Mahsulotni o'chirishda xatolik yuz berdi.");
      }
      setIsConfirmOpen(false);
      setDeletingProduct(null);
      loadProducts();
    }
  };

  const columns = [
    {
      header: 'Mahsulot / Xomashyo',
      cell: (row) => (
        <div>
          <Link to={`${ROUTES.PROTECTED.PRODUCTS}/${row.id}`} className="fw-bold text-primary text-decoration-none fs-7">
            {row.name}
          </Link>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">{row.internalCode}</span>
          </div>
        </div>
      ),
    },
    { header: 'Kategoriya', accessor: 'categoryName' },
    { header: 'Material Turi', cell: (row) => <span className="badge bg-info bg-opacity-10 text-info fw-semibold">{row.materialTypeName}</span> },
    { header: 'Ta\'minotchi', accessor: 'supplierName' },
    { header: 'Xarid Narxi', cell: (row) => <span className="fw-bold text-main">{formatCurrency(row.purchasePrice)}</span> },
    {
      header: 'Zaxira',
      cell: (row) => (
        <div>
          <span className={`fw-bold fs-7 ${row.currentStock <= row.minStock ? 'text-danger' : 'text-success'}`}>
            {row.currentStock} {row.unitName}
          </span>
          <small className="d-block text-muted-custom fs-8">Min: {row.minStock}</small>
        </div>
      ),
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={`${ROUTES.PROTECTED.PRODUCTS}/${row.id}`}
            className="btn btn-sm btn-outline-primary p-1 border-0"
            title="Tafsilotlarni ko'rish"
          >
            <i className={`bi ${ERP_ICONS.EYE}`}></i>
          </Link>
          <button
            className="btn btn-sm btn-outline-secondary p-1 border-0"
            onClick={() => {
              setEditingProduct(row);
              setIsModalOpen(true);
            }}
            title="Tahrirlash"
          >
            <i className={`bi ${ERP_ICONS.EDIT}`}></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger p-1 border-0"
            onClick={() => {
              setDeletingProduct(row);
              setIsConfirmOpen(true);
            }}
            title="O'chirish"
          >
            <i className={`bi ${ERP_ICONS.TRASH}`}></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="products-page animate-fade-in pb-5">
      <WarehouseSubNav />
      <PageHeader
        title="Mahsulotlar va Xomashyolar Nomenklaturasi"
        subtitle="Zavod xomashyolari, komplektatsiya qismlari va tayyor bosim klapanlari reyestri"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Mahsulotlar' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={ERP_ICONS.PLUS}
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          >
            Yangi Mahsulot Qo'shish
          </Button>
        }
      />

      <ProductFilterBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        materialFilter={materialFilter}
        onMaterialChange={setMaterialFilter}
        supplierFilter={supplierFilter}
        onSupplierChange={setSupplierFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categories}
        materialTypes={materialTypes}
        suppliers={suppliers}
      />

      <Card title={`Xomashyolar va Nomenklatura Reyestri (${products.length} ta)`}>
        <Table columns={columns} data={products} />
      </Card>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        product={editingProduct}
        suppliers={suppliers}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Mahsulotni O'chirish"
        message={`Haqiqatan ham '${deletingProduct?.name}' xomashyosini katalogdan o'chirmoqchimisiz?`}
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
};
