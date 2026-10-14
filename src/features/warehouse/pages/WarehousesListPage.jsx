import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus, LuStore, LuBoxes, LuCheck, LuPencil, LuTrash2, LuSearch } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { WarehouseSubNav } from '../components/WarehouseSubNav';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { warehouseApi } from '../api/warehouseApi';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const WarehousesListPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [whRes, stockRes] = await Promise.all([
      warehouseApi.getWarehouses(),
      warehouseApi.getCurrentStock(),
    ]);

    if (stockRes.success) {
      setStockItems(stockRes.data);
    }

    let whList = [];
    if (whRes.success && Array.isArray(whRes.data) && whRes.data.length > 0) {
      whList = whRes.data.map((w, idx) => ({
        id: w.id || `wh_${idx + 1}`,
        name: w.name || w.label,
        description: w.description || 'Omborxona',
        isDefault: idx === 0 || w.is_default || false,
        status: 'ACTIVE',
      }));
    } else {
      const whOptions = dynamicSettingsService.getWarehouseOptions();
      whList = whOptions.map((w, idx) => ({
        id: w.value || `wh_${idx + 1}`,
        name: w.label || w.name,
        description: w.description || 'Omborxona',
        isDefault: idx === 0 || w.isDefault || false,
        status: 'ACTIVE',
      }));
    }

    setWarehouses(whList);
  };

  const handleOpenCreateModal = () => {
    setEditingWh(null);
    setFormData({
      name: '',
      description: '',
      isDefault: warehouses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (wh) => {
    setEditingWh(wh);
    setFormData({
      name: wh.name,
      description: wh.description || '',
      isDefault: wh.isDefault || false,
    });
    setIsModalOpen(true);
  };

  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notifyError("Ombor nomini kiriting!");
      return;
    }

    if (editingWh) {
      const res = await warehouseApi.updateWarehouse(editingWh.id, formData);
      notifySuccess(res.message || "Ombor ma'lumotlari yangilandi.");
    } else {
      const res = await warehouseApi.createWarehouse(formData);
      notifySuccess(res.message || "Yangi ombor muvaffaqiyatli saqlandi.");

      dynamicSettingsService.addWarehouseOption({
        value: res.data?.id || `wh_${Date.now()}`,
        label: formData.name,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    const res = await warehouseApi.deleteWarehouse(deletingId);
    notifySuccess(res.message || "Ombor muvaffaqiyatli o'chirildi.");
    setDeletingId(null);
    loadData();
  };

  const filteredWarehouses = warehouses.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const getProductCountForWarehouse = (whName) => {
    if (!stockItems || stockItems.length === 0) return 0;
    return stockItems.filter(
      (s) => s.warehouseName?.toLowerCase() === whName?.toLowerCase()
    ).length;
  };

  const columns = [
    {
      header: 'Ombor Nomi',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-2 bg-primary bg-opacity-10 text-primary">
            <LuStore className="fs-6" />
          </div>
          <div>
            <span className="fw-bold text-main fs-7">{row.name}</span>
            {row.isDefault && (
              <span className="badge bg-success bg-opacity-20 text-success ms-2 fs-8">
                Asosiy Ombor
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Tavsif va Joylashuv',
      cell: (row) => <span className="text-muted-custom fs-7">{row.description || '-'}</span>,
    },
    {
      header: 'Mavjud Mahsulotlar',
      cell: (row) => {
        const count = getProductCountForWarehouse(row.name);
        return (
          <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold fs-7">
            <LuBoxes className="me-1" /> {count} xil mahsulot
          </span>
        );
      },
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amal',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={`${ROUTES.PROTECTED.WAREHOUSE_STOCK}`}
            className="btn btn-sm btn-outline-primary p-1 border-0"
            title="Ombor qoldiqlarini ko'rish"
          >
            <LuBoxes />
          </Link>
          <button
            className="btn btn-sm btn-outline-warning p-1 border-0"
            onClick={() => handleOpenEditModal(row)}
            title="Tahrirlash"
          >
            <LuPencil />
          </button>
          <button
            className="btn btn-sm btn-outline-danger p-1 border-0"
            onClick={() => setDeletingId(row.id)}
            title="O'chirish"
          >
            <LuTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="warehouses-list-page animate-fade-in pb-5">
      <PageHeader
        title="Omborlar Ro'yxati va Katalogi"
        subtitle="Korxonaning barcha xomashyo, tayyor mahsulot va ehtiyot qismlar omborxonalari"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Omborxona', path: ROUTES.PROTECTED.WAREHOUSE },
          { label: 'Omborlar Ro\'yxati' },
        ]}
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
            <LuPlus className="me-1" /> Yangi Ombor Yaratish
          </Button>
        }
      />

      <WarehouseSubNav />

      {/* Stats Summary Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card p-3 border-custom bg-body-custom">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted-custom fs-8 d-block mb-1">Jami Omborlar Soni</small>
                <h4 className="fw-bold text-main mb-0">{warehouses.length} ta</h4>
              </div>
              <div className="p-3 rounded-3 bg-primary bg-opacity-10 text-primary">
                <LuStore className="fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card p-3 border-custom bg-body-custom">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted-custom fs-8 d-block mb-1">Asosiy Bosh Ombor</small>
                <h6 className="fw-bold text-success mb-0">
                  {warehouses.find((w) => w.isDefault)?.name || warehouses[0]?.name || 'Asosiy Ombor'}
                </h6>
              </div>
              <div className="p-3 rounded-3 bg-success bg-opacity-10 text-success">
                <LuCheck className="fs-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card p-3 border-custom bg-body-custom">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted-custom fs-8 d-block mb-1">Status</small>
                <h4 className="fw-bold text-main mb-0">Barchasi Faol</h4>
              </div>
              <div className="p-3 rounded-3 bg-info bg-opacity-10 text-info">
                <LuBoxes className="fs-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="row g-2 mb-4 align-items-center">
        <div className="col-12 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <LuSearch />
            </span>
            <input
              type="text"
              className="form-control bg-body-custom text-main border-custom fs-7"
              placeholder="Ombor nomi bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card title={`Korxona Omborlari Reyestri (${filteredWarehouses.length} ta)`}>
        <Table columns={columns} data={filteredWarehouses} />
      </Card>

      {/* Modal for Creating / Editing Warehouse */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWh ? "Ombor Ma'lumotlarini Tahrirlash" : "Yangi Ombor Yaratish"}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveWarehouse}>
              Saqlash
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveWarehouse}>
          <div className="row g-3">
            <div className="col-12">
              <Input
                label="Ombor Nomi *"
                placeholder="Masalan: Tayyor Mahsulotlar Ombori"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <Input
                label="Tavsif va Joylashuv (Ixtiyoriy)"
                placeholder="Masalan: 1-Sex Bosh Binosi, 2-qavat..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog for Deleting Warehouse */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Omborni O'chirish"
        message="Haqiqatan ham ushbu omborxonani tizimdan o'chirib tashlamoqchimisiz?"
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
};
