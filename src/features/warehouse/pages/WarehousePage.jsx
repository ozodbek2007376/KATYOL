import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuBoxes, LuBadgeDollarSign, LuPlus, LuClipboardCheck, LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { StockFilterBar } from '../components/StockFilterBar';
import { MovementFormModal } from '../components/MovementFormModal';
import { RevaluationFormModal } from '../components/RevaluationFormModal';
import { InventoryCountModal } from '../components/InventoryCountModal';
import { EditStockModal } from '../components/EditStockModal';
import { warehouseApi } from '../api/warehouseApi';
import { productsApi } from '../api/productsApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const WarehousePage = () => {
  const [stats, setStats] = useState(null);
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isRevaluationModalOpen, setIsRevaluationModalOpen] = useState(false);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);

  const [editingStock, setEditingStock] = useState(null);
  const [deletingStock, setDeletingStock] = useState(null);

  const categories = dynamicSettingsService.getCategories();
  const warehouses = dynamicSettingsService.getWarehouses();
  const materialTypes = dynamicSettingsService.getMaterialTypes();

  useEffect(() => {
    loadWarehouseData();
  }, [search, categoryFilter, warehouseFilter, materialFilter, statusFilter]);

  const loadWarehouseData = async () => {
    const [statsRes, stockRes, prodRes] = await Promise.all([
      warehouseApi.getWarehouseStats(),
      warehouseApi.getCurrentStock({
        search,
        categoryId: categoryFilter,
        warehouseId: warehouseFilter,
        materialTypeId: materialFilter,
        status: statusFilter,
      }),
      productsApi.getProducts({ limit: 500 }).catch(() => null),
    ]);

    if (statsRes.success) setStats(statsRes.data);

    if (stockRes.success) {
      const stockData = stockRes.data || [];
      const productList = prodRes?.success ? prodRes.data : [];

      const mappedStock = stockData.map((item) => {
        const prod = productList.find((p) => p.id === item.productId);
        const cost = item.purchasePrice || item.unitPrice || prod?.purchasePrice || 0;
        return {
          ...item,
          purchasePrice: cost,
          unitPrice: cost,
          currentValue: item.quantity * cost,
        };
      });

      setStock(mappedStock);
    }
  };

  const handleSaveMovement = async (formData) => {
    const res = await warehouseApi.createMovement(formData);
    if (res.success) {
      notifySuccess(res.message || "Ombor harakati saqlandi.");
      setIsMovementModalOpen(false);
      loadWarehouseData();
    } else {
      notifyError(res.message || "Ombor harakatini saqlashda xatolik.");
    }
  };

  const handleSaveRevaluation = async (formData) => {
    const res = await warehouseApi.createRevaluation(formData);
    if (res.success) {
      notifySuccess(res.message || "Qayta baholash saqlandi.");
      setIsRevaluationModalOpen(false);
      loadWarehouseData();
    } else {
      notifyError(res.message || "Qayta baholashda xatolik yuz berdi.");
    }
  };

  const handleSaveInventoryCount = async (formData) => {
    const res = await warehouseApi.createInventoryCount(formData);
    if (res.success) {
      notifySuccess(res.message || "Inventarizatsiya saqlandi.");
      setIsCountModalOpen(false);
      loadWarehouseData();
    } else {
      notifyError(res.message || "Inventarizatsiyada xatolik yuz berdi.");
    }
  };

  const handleUpdateStock = async (updatedData) => {
    if (editingStock && (
      updatedData.productName !== editingStock.productName ||
      updatedData.internalCode !== editingStock.internalCode ||
      updatedData.categoryId !== editingStock.categoryId ||
      updatedData.materialTypeId !== editingStock.materialTypeId ||
      updatedData.unitName !== editingStock.unitName ||
      updatedData.purchasePrice !== editingStock.purchasePrice
    )) {
      await productsApi.updateProduct(updatedData.productId, {
        name: updatedData.productName,
        code: updatedData.internalCode,
        categoryId: updatedData.categoryId,
        materialTypeId: updatedData.materialTypeId,
        unitId: updatedData.unitId,
        purchasePrice: updatedData.purchasePrice,
      }).catch(() => null);
    }

    const res = await warehouseApi.updateStock(updatedData.id, updatedData);
    if (res.success) {
      notifySuccess(res.message || "Ombor zaxirasi yangilandi.");
      setEditingStock(null);
      loadWarehouseData();
    } else {
      notifyError(res.message || "Zaxirani yangilashda xatolik.");
    }
  };

  const handleConfirmDeleteStock = async () => {
    if (!deletingStock) return;
    const res = await warehouseApi.deleteStock(deletingStock.id);
    if (res.success) {
      notifySuccess(res.message || "Zaxira o'chirildi.");
      setDeletingStock(null);
      loadWarehouseData();
    } else {
      notifyError(res.message || "Zaxirani o'chirishda xatolik.");
    }
  };

  const columns = [
    {
      header: 'Mahsulot / Xomashyo',
      cell: (row) => (
        <div>
          <Link to={`${ROUTES.PROTECTED.WAREHOUSE_STOCK}/${row.id}`} className="fw-bold text-primary text-decoration-none fs-7">
            {row.productName}
          </Link>
          <small className="d-block text-muted-custom fs-8">SKU: {row.internalCode}</small>
        </div>
      ),
    },
    { header: 'Kategoriya', accessor: 'categoryName' },
    {
      header: 'Material Turi',
      cell: (row) =>
        row.materialTypeName ? (
          <span className="badge bg-info bg-opacity-10 text-info">{row.materialTypeName}</span>
        ) : (
          '-'
        ),
    },
    { header: 'Ombor', accessor: 'warehouseName' },
    {
      header: 'Miqdor',
      cell: (row) => (
        <div>
          <strong className={row.quantity <= row.minQuantity ? 'text-danger' : 'text-success'}>
            {row.quantity} {row.unitName}
          </strong>
          <small className="d-block text-muted-custom fs-8">Min: {row.minQuantity}</small>
        </div>
      ),
    },
    {
      header: `Joriy Qiymati (${getCurrencySymbol()})`,
      cell: (row) => <span className="fw-bold text-main">{formatCurrency(row.currentValue)}</span>,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amal',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={`${ROUTES.PROTECTED.WAREHOUSE_STOCK}/${row.id}`}
            className="btn btn-sm btn-outline-primary py-1 px-2 fs-8"
            title="Tafsilot"
          >
            <LuEye />
          </Link>
          <button
            className="btn btn-sm btn-outline-warning py-1 px-2 fs-8"
            onClick={() => setEditingStock(row)}
            title="Tahrirlash"
          >
            <LuPencil />
          </button>
          <button
            className="btn btn-sm btn-outline-danger py-1 px-2 fs-8"
            onClick={() => setDeletingStock(row)}
            title="O'chirish"
          >
            <LuTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="warehouse-page animate-fade-in pb-5">
      <PageHeader
        title="Ombor Zaxiralari Boshqaruvi"
        subtitle="Xomashyo, yarim tayyor va tayyor kotyollar zaxiralarini kuzatish hamda kirim/chiqim operatsiyalari"
        breadcrumbs={[{ label: 'Bosh sahifa', path: '/' }, { label: 'Omborxona' }]}
        actions={
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsRevaluationModalOpen(true)}
            >
              <LuBadgeDollarSign className="me-1" /> Qayta Baholash
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsCountModalOpen(true)}
            >
              <LuClipboardCheck className="me-1" /> Inventarizatsiya
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsMovementModalOpen(true)}
            >
              <LuPlus className="me-1" /> Omborga Mahsulot Qo'shish
            </Button>
          </div>
        }
      />

      {/* Low Stock Alert Banner */}
      {stock.some(item => (Number(item.quantity) || 0) <= (Number(item.minQuantity) || 10)) && (
        <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-3 mb-4 p-3 rounded-3" role="alert">
          <div className="bg-warning bg-opacity-20 text-warning p-2 rounded-2">
            <LuBoxes className="fs-4" />
          </div>
          <div className="flex-grow-1">
            <h6 className="alert-heading fw-bold mb-1 text-warning-emphasis">Diqqat! Kam qolgan mahsulotlar bor</h6>
            <p className="mb-0 fs-7 text-muted">
              Quyidagi mahsulotlar zaxirasi belgilangan minimal miqdordan kamayib ketgan:{' '}
              <strong className="text-warning-emphasis">
                {stock
                  .filter(item => (Number(item.quantity) || 0) <= (Number(item.minQuantity) || 10))
                  .map(item => `${item.productName} (${item.quantity} ${item.unitName})`)
                  .join(', ')}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card-custom p-3 border-custom rounded-3 d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted-custom d-block mb-1 fs-8">Jami Nomenklatura</small>
                <h4 className="fw-bold text-main font-heading mb-0">{stats.totalProducts} ta</h4>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                <LuBoxes className="fs-4" />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card-custom p-3 border-custom rounded-3 d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted-custom d-block mb-1 fs-8">Jami Zaxira Qiymati ({getCurrencySymbol()})</small>
                <h4 className="fw-bold text-main font-heading mb-0">{formatCurrency(stats.totalStockValue)}</h4>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-3">
                <LuBadgeDollarSign className="fs-4" />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card-custom p-3 border-custom rounded-3 d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted-custom d-block mb-1 fs-8">Kam Zaxirali Mahsulotlar</small>
                <h4 className="fw-bold text-warning font-heading mb-0">{stats.lowStockCount} ta</h4>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3">
                <LuBoxes className="fs-4" />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card-custom p-3 border-custom rounded-3 d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted-custom d-block mb-1 fs-8">Tugagan Zaxiralar</small>
                <h4 className="fw-bold text-danger font-heading mb-0">{stats.outOfStockCount} ta</h4>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3">
                <LuBoxes className="fs-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      <StockFilterBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        warehouseFilter={warehouseFilter}
        onWarehouseChange={setWarehouseFilter}
        materialFilter={materialFilter}
        onMaterialChange={setMaterialFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categories}
        warehouses={warehouses}
        materialTypes={materialTypes}
      />

      <Card title={`Ombordagi Mavjud Zaxiralar Reyestri (${stock.length} ta)`}>
        <Table columns={columns} data={stock} />
      </Card>

      <MovementFormModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSubmit={handleSaveMovement}
        products={stock}
      />

      <RevaluationFormModal
        isOpen={isRevaluationModalOpen}
        onClose={() => setIsRevaluationModalOpen(false)}
        onSubmit={handleSaveRevaluation}
        products={stock}
      />

      <InventoryCountModal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        onSubmit={handleSaveInventoryCount}
        products={stock}
      />

      <EditStockModal
        isOpen={Boolean(editingStock)}
        onClose={() => setEditingStock(null)}
        onSubmit={handleUpdateStock}
        stockItem={editingStock}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingStock)}
        onClose={() => setDeletingStock(null)}
        onConfirm={handleConfirmDeleteStock}
        title="Ombor Zaxirasini O'chirish"
        message={`Haqiqatan ham "${deletingStock?.productName}" mahsulotini ombor zaxirasidan o'chirmoqchimisiz?`}
        isDanger={true}
        confirmText="O'chirish"
      />
    </div>
  );
};
