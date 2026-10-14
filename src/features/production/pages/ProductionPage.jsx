import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuPlay, LuPause, LuRotateCcw, LuCheckCheck, LuLayoutGrid, LuList, LuLock } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { ProductionSubNav } from '../components/ProductionSubNav';
import { ProductionFilterBar } from '../components/ProductionFilterBar';
import { ProductionFormModal } from '../components/ProductionFormModal';
import { ProductionKanbanBoard } from '../components/ProductionKanbanBoard';
import { productionApi } from '../api/productionApi';
import { employeesApi } from '@/features/employees/api/employeesApi';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { usePermission } from '@/hooks/usePermission';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const ProductionPage = () => {
  const { canCreate, canEdit, canDelete, isReadOnly } = usePermission('production');

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [productionOrders, setProductionOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [stages, setStages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const orderPriorities = dynamicSettingsService.getOrderPriorities();

  const handleStagesUpdated = async () => {
    const res = await settingsApi.getProductionStages();
    if (res.success) setStages(res.data || []);
  };

  const loadEmployees = async () => {
    const res = await employeesApi.getEmployees();
    if (res.success) setEmployees(res.data || []);
  };

  useEffect(() => {
    handleStagesUpdated();
    loadEmployees();
  }, []);

  useEffect(() => {
    loadProductionData();
  }, [search, stageFilter, priorityFilter, statusFilter]);

  const loadProductionData = async () => {
    const res = await productionApi.getProductionOrders({
      search,
      stageId: stageFilter,
      priority: priorityFilter,
      status: statusFilter,
    });
    if (res.success) setProductionOrders(res.data);
  };

  // Background Auto-Refresh every 15s (Pauses while modal is open)
  usePageAutoRefresh(loadProductionData, { intervalMs: 15000, isEditing: isModalOpen || isConfirmOpen });

  const handleCreateOrUpdate = async (formData) => {
    if (editingOrder) {
      const res = await productionApi.updateProductionOrder(editingOrder.id, formData);
      notifySuccess(res.message);
    } else {
      const res = await productionApi.createProductionOrder(formData);
      notifySuccess(res.message);
    }
    setIsModalOpen(false);
    setEditingOrder(null);
    loadProductionData();
  };

  const handleStageChange = async (orderId, newStageId) => {
    const res = await productionApi.updateProductionStage(orderId, newStageId);
    notifySuccess(res.message);
    loadProductionData();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await productionApi.updateProductionStatus(orderId, newStatus);
    notifySuccess(res.message);
    loadProductionData();
  };

  const handleDelete = async () => {
    if (deletingOrder) {
      const res = await productionApi.deleteProductionOrder(deletingOrder.id);
      notifySuccess(res.message);
      setIsConfirmOpen(false);
      setDeletingOrder(null);
      loadProductionData();
    }
  };

  const columns = [
    {
      header: 'Partiya №',
      cell: (row) => (
        <div>
          <Link to={`${ROUTES.PROTECTED.PRODUCTION}/${row.id}`} className="fw-bold text-primary text-decoration-none fs-7">
            {row.productionNumber}
          </Link>
          <div className="d-flex align-items-center gap-1 mt-1">
            <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">v{row.version}</span>
            {row.orderNumber && (
              <small className="text-muted-custom fs-8 ms-1">
                Ref:{' '}
                <Link to={`${ROUTES.PROTECTED.ORDERS}/${row.orderId}`} className="text-decoration-none text-muted-custom">
                  {row.orderNumber}
                </Link>
              </small>
            )}
          </div>
        </div>
      ),
    },
    { header: 'Operatsiya / Mahsulot', accessor: 'title' },
    { header: 'Sex / Liniya', accessor: 'line' },
    {
      header: 'Miqdor',
      cell: (row) => <strong className="text-main fs-7">{row.quantity} dona</strong>,
    },
    {
      header: 'Bajarilish %',
      cell: (row) => (
        <div style={{ width: '90px' }}>
          <div className="d-flex justify-content-between fs-8 mb-1">
            <span>{row.progressPercent}%</span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${row.progressPercent}%` }}></div>
          </div>
        </div>
      ),
    },
    {
      header: 'Joriy Bosqich',
      cell: (row) => (
        <span className="badge px-2 py-1 fs-8 text-white" style={{ backgroundColor: row.stageColor || '#3b82f6' }}>
          {row.stageName}
        </span>
      ),
    },
    {
      header: 'Prioritet',
      cell: (row) => {
        const prioObj = orderPriorities.find((p) => p.code === row.priority);
        return <span className={`badge ${prioObj ? prioObj.badgeClass : 'bg-secondary'} fs-8`}>{prioObj ? prioObj.name : row.priority}</span>;
      },
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={`${ROUTES.PROTECTED.PRODUCTION}/${row.id}`}
            className="btn btn-sm btn-outline-primary p-1 border-0"
            title="Tafsilotni ko'rish"
          >
            <LuEye />
          </Link>
          {canEdit && (
            <button
              className="btn btn-sm btn-outline-secondary p-1 border-0"
              onClick={() => {
                setEditingOrder(row);
                setIsModalOpen(true);
              }}
              title="Tahrirlash"
            >
              <LuPencil />
            </button>
          )}

          {canEdit && row.status === 'PENDING' && (
            <button
              className="btn btn-sm btn-outline-success p-1 border-0"
              onClick={() => handleStatusChange(row.id, 'IN_PROGRESS')}
              title="Boshlash"
            >
              <LuPlay />
            </button>
          )}
          {canEdit && row.status === 'IN_PROGRESS' && (
            <button
              className="btn btn-sm btn-outline-warning p-1 border-0"
              onClick={() => handleStatusChange(row.id, 'PAUSED')}
              title="Vaqtincha To'xtatish (Pauza)"
            >
              <LuPause />
            </button>
          )}
          {canEdit && row.status === 'PAUSED' && (
            <button
              className="btn btn-sm btn-outline-info p-1 border-0"
              onClick={() => handleStatusChange(row.id, 'IN_PROGRESS')}
              title="Qayta Tiklash"
            >
              <LuRotateCcw />
            </button>
          )}

          {canDelete && (
            <button
              className="btn btn-sm btn-outline-danger p-1 border-0"
              onClick={() => {
                setDeletingOrder(row);
                setIsConfirmOpen(true);
              }}
              title="Bekor qilish / O'chirish"
            >
              <LuTrash2 />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="production-page animate-fade-in pb-5 w-100">
      <ProductionSubNav />

      {isReadOnly && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3 py-2 px-3 fs-7 rounded-3">
          <LuLock className="fs-5" />
          <span>Sizda ushbu modulni faqat ko'rish huquqi mavjud. Tahrirlash va o'chirish amalari yashirilgan.</span>
        </div>
      )}

      <PageHeader
        title="Ishlab Chiqarish va Sanoat Liniyalari Moduli"
        subtitle="Zavod ish buyurtmalari navbati, liniyalar yuklamasi, xomashyo sarfiyati va usta xodimlar birikmasi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Ishlab chiqarish' },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2">
            {/* View Mode Toggle */}
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban Taxtasi Rejimi"
              >
                <LuLayoutGrid className="me-1" /> Kanban
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('table')}
                title="Jadval Ro'yxati Rejimi"
              >
                <LuList className="me-1" /> Ro'yxat
              </button>
            </div>

            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingOrder(null);
                  setIsModalOpen(true);
                }}
              >
                <LuPlus className="me-1" /> Yangi Ish Topshirig'i
              </Button>
            )}
          </div>
        }
      />

      <ProductionFilterBar
        search={search}
        onSearchChange={setSearch}
        stageFilter={stageFilter}
        onStageChange={setStageFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        stages={stages}
        priorities={orderPriorities}
      />

      {viewMode === 'kanban' ? (
        <ProductionKanbanBoard
          orders={productionOrders}
          stages={stages}
          employees={employees}
          onStageChange={handleStageChange}
          onCardClick={(order) => {
            setEditingOrder(order);
            setIsModalOpen(true);
          }}
          canEdit={canEdit}
          onStagesUpdated={handleStagesUpdated}
        />
      ) : (
        <Card title={`Ishlab Chiqarish Partiyalari Reyestri (${productionOrders.length} ta)`}>
          <Table columns={columns} data={productionOrders} tableKey="production_list" />
        </Card>
      )}

      {(canCreate || canEdit || isReadOnly) && (
        <ProductionFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
          }}
          onSubmit={handleCreateOrUpdate}
          productionOrder={editingOrder}
          stages={stages}
          employees={employees}
          isReadOnly={isReadOnly || (!editingOrder && !canCreate) || (editingOrder && !canEdit)}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Ish Topshirig'ini Bekor Qilish"
          message={`Haqiqatan ham '${deletingOrder?.productionNumber}' ish topshirig'i o'chirilsinmi?`}
          isDanger={true}
          confirmText="O'chirish"
          cancelText="Orqaga"
        />
      )}
    </div>
  );
};
