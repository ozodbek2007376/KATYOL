import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuClipboardList, LuPlay, LuLock, LuPrinter, LuAward } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { OrdersSubNav } from '../components/OrdersSubNav';
import { OrderFilterBar } from '../components/OrderFilterBar';
import { OrderFormModal } from '../components/OrderFormModal';
import { CustomerReceiptModal } from '@/components/common/CustomerReceiptModal/CustomerReceiptModal';
import { InsurancePolicyModal } from '@/components/common/InsurancePolicyModal/InsurancePolicyModal';
import { ordersApi } from '../api/ordersApi';
import { customersApi } from '@/features/customers/api/customersApi';
import { boilersApi } from '@/features/boilers/api/boilersApi';
import { recipesApi } from '@/features/recipes/api/recipesApi';
import { warehouseApi } from '@/features/warehouse/api/warehouseApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { usePermission } from '@/hooks/usePermission';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const OrdersPage = () => {
  const { canCreate, canEdit, canDelete, isReadOnly } = usePermission('orders');

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [boilers, setBoilers] = useState([]);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [insuranceOrder, setInsuranceOrder] = useState(null);
  
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [isBulkCalcOpen, setIsBulkCalcOpen] = useState(false);
  const [bulkCalcData, setBulkCalcData] = useState([]);
  const [archiveTab, setArchiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'ARCHIVED'

  const statuses = dynamicSettingsService.getOrderStatuses();
  const priorities = dynamicSettingsService.getOrderPriorities();

  useEffect(() => {
    loadOrdersData();
  }, [search, customerFilter, statusFilter, priorityFilter]);

  const loadOrdersData = async () => {
    const [ordRes, custRes, boilRes] = await Promise.all([
      ordersApi.getOrders({
        search,
        customerId: customerFilter,
        status: statusFilter,
        priority: priorityFilter,
      }),
      customersApi.getCustomers(),
      boilersApi.getBoilers(),
    ]);
    if (ordRes.success) setOrders(ordRes.data);
    if (custRes.success) setCustomers(custRes.data);
    if (boilRes.success) setBoilers(boilRes.data);
  };

  // Background Auto-Refresh every 15s (Pauses while modal is open)
  usePageAutoRefresh(loadOrdersData, { intervalMs: 15000, isEditing: isModalOpen || isConfirmOpen });

  const handleCreateOrUpdate = async (formData) => {
    if (editingOrder) {
      const res = await ordersApi.updateOrder(editingOrder.id, formData);
      notifySuccess(res.message);
    } else {
      const res = await ordersApi.createOrder(formData);
      if (!res.success) {
        notifySuccess(res.message);
        return;
      }
      notifySuccess(res.message);
    }
    setIsModalOpen(false);
    setEditingOrder(null);
    loadOrdersData();
  };

  const handleStartProduction = async (orderId) => {
    const res = await ordersApi.startProductionOrder(orderId);
    notifySuccess(res.message);
    loadOrdersData();
  };

  const handleArchive = async (order) => {
    const res = await ordersApi.updateOrder(order.id, { ...order, status: 'ARCHIVED' });
    notifySuccess("Buyurtma arxivlandi.");
    loadOrdersData();
  };

  const handleRestore = async (order) => {
    const res = await ordersApi.updateOrder(order.id, { ...order, status: 'PENDING' });
    notifySuccess("Buyurtma arxivdan chiqarildi.");
    loadOrdersData();
  };

  const handleDelete = async () => {
    if (deletingOrder) {
      const res = await ordersApi.deleteOrder(deletingOrder.id);
      notifySuccess(res.message);
      setIsConfirmOpen(false);
      setDeletingOrder(null);
      loadOrdersData();
    }
  };

  const handleCalculateBulkIngredients = async () => {
    const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.id));
    const stockRes = await warehouseApi.getCurrentStock();
    const stocks = stockRes.success ? (stockRes.data || []) : [];
    const totalIngredients = {};

    for (const order of selectedOrders) {
      if (order.boilerId) {
        const boilRes = await boilersApi.getBoilerById(order.boilerId);
        const recipeId = boilRes?.data?.recipeId;
        if (recipeId) {
          const recRes = await recipesApi.getRecipeById(recipeId);
          if (recRes.success && recRes.data?.items) {
            recRes.data.items.forEach((ing) => {
              const key = ing.materialId;
              const qty = (Number(ing.requiredQuantity) || 0) * (Number(order.quantity) || 1);
              if (totalIngredients[key]) {
                totalIngredients[key].requiredQty += qty;
              } else {
                totalIngredients[key] = {
                  materialId: ing.materialId,
                  materialName: ing.materialName,
                  unitName: ing.unitName || 'dona',
                  requiredQty: qty,
                };
              }
            });
          }
        }
      }
    }

    const result = Object.values(totalIngredients).map((ing) => {
      const matchedStock = stocks.find((s) => String(s.productId) === String(ing.materialId));
      const available = matchedStock ? (matchedStock.availableQuantity || matchedStock.quantity || 0) : 0;
      return {
        ...ing,
        availableStock: available,
        shortage: Math.max(0, ing.requiredQty - available),
      };
    });

    setBulkCalcData(result);
    setIsBulkCalcOpen(true);
  };

  const displayedOrders = orders.filter((o) => {
    if (archiveTab === 'ACTIVE') {
      return o.status !== 'ARCHIVED';
    } else {
      return o.status === 'ARCHIVED';
    }
  });

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={orders.length > 0 && selectedOrderIds.length === orders.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedOrderIds(orders.map((o) => o.id));
            } else {
              setSelectedOrderIds([]);
            }
          }}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedOrderIds.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.checked) {
              setSelectedOrderIds((prev) => [...prev, row.id]);
            } else {
              setSelectedOrderIds((prev) => prev.filter((id) => id !== row.id));
            }
          }}
        />
      ),
      width: '40px',
    },
    {
      header: 'Buyurtma Nomi',
      cell: (row) => (
        <div>
          <Link to={`${ROUTES.PROTECTED.ORDERS}/${row.id}`} className="fw-bold text-primary text-decoration-none fs-7">
            {row.orderName || row.orderNumber}
          </Link>
          <small className="d-block text-muted-custom fs-8">Sana: {row.orderDate}</small>
        </div>
      ),
    },
    {
      header: 'Mijoz Korxona',
      cell: (row) => (
        <Link to={`${ROUTES.PROTECTED.CUSTOMERS}/${row.customerId}`} className="fw-bold text-primary text-decoration-none fs-7">
          {row.customerName}
        </Link>
      ),
    },
    {
      header: 'Kotyol Modeli',
      cell: (row) => (
        <Link to={`${ROUTES.PROTECTED.BOILERS}/${row.boilerId}`} className="fw-bold text-primary text-decoration-none fs-7">
          {row.boilerModelName}
        </Link>
      ),
    },
    {
      header: 'Miqdor',
      cell: (row) => <strong className="text-main fs-7">{row.quantity} dona</strong>,
    },
    {
      header: 'Prioritet',
      cell: (row) => {
        const prioObj = priorities.find((p) => p.code === row.priority);
        return <span className={`badge ${prioObj ? prioObj.badgeClass : 'bg-secondary'} fs-8`}>{prioObj ? prioObj.name : row.priority}</span>;
      },
    },
    {
      header: 'Mas\'ul Xodim',
      cell: (row) => (
        <span className="text-main fs-8 fw-semibold">
          {row.assignedEmployeeName ? `${row.assignedEmployeeName}` : <span className="text-muted fs-8">Biriktirilmagan</span>}
        </span>
      ),
    },
    {
      header: 'Jami Summa ($)',
      cell: (row) => <strong className="text-primary fs-7">{formatCurrency(row.totalAmount || 0)}</strong>,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          {row.status === 'ARCHIVED' ? (
            <>
              <Link
                to={`${ROUTES.PROTECTED.ORDERS}/${row.id}`}
                className="btn btn-sm btn-outline-info p-1 border-0"
                title="Tafsilotni ko'rish"
              >
                <LuEye />
              </Link>
              <button
                className="btn btn-sm btn-outline-success p-1 border-0"
                onClick={() => handleRestore(row)}
                title="Arxivdan chiqarish"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
              {canDelete && (
                <button
                  className="btn btn-sm btn-outline-danger p-1 border-0"
                  onClick={() => {
                    setDeletingOrder(row);
                    setIsConfirmOpen(true);
                  }}
                  title="Butkul O'chirish"
                >
                  <LuTrash2 />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                className="btn btn-sm btn-outline-primary p-1 border-0"
                onClick={() => setReceiptOrder(row)}
                title="Chek chiqarish va Chop etish"
              >
                <LuPrinter />
              </button>
              <button
                className="btn btn-sm btn-outline-success p-1 border-0"
                onClick={() => setInsuranceOrder(row)}
                title="Sug'urta Polisi va Bepul Servis Qog'ozi"
              >
                <LuAward />
              </button>
              <Link
                to={`${ROUTES.PROTECTED.ORDERS}/${row.id}`}
                className="btn btn-sm btn-outline-info p-1 border-0"
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
              {canEdit && row.status !== 'IN_PRODUCTION' && row.status !== 'COMPLETED' && (
                <button
                  className="btn btn-sm btn-outline-success p-1 border-0"
                  onClick={() => handleStartProduction(row.id)}
                  title="Ishlab Chiqarishni Boshlash"
                >
                  <LuPlay />
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-warning p-1 border-0"
                onClick={() => handleArchive(row)}
                title="Arxivlash"
              >
                <i className="bi bi-archive"></i>
              </button>
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
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="orders-page animate-fade-in pb-5">
      <OrdersSubNav />

      {isReadOnly && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3 py-2 px-3 fs-7 rounded-3">
          <LuLock className="fs-5" />
          <span>Sizda ushbu modulni faqat ko'rish huquqi mavjud. Tahrirlash va o'chirish amallari yashirilgan (Read-Only Mode).</span>
        </div>
      )}

      <PageHeader
        title="Buyurtmalar Boshqaruvi"
        subtitle="Mijozlar buyurtmalarini qabul qilish, kotyol modellarini biriktirish va ishlab chiqarishga o'tkazish"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Buyurtmalar' },
        ]}
        actions={
          canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingOrder(null);
                setIsModalOpen(true);
              }}
            >
              <LuPlus className="me-1" /> Yangi Buyurtma Rasmiylashtirish
            </Button>
          )
        }
      />

      <div className="btn-group mb-3">
        <button className={`btn ${archiveTab === 'ACTIVE' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setArchiveTab('ACTIVE')}>
          Faol Buyurtmalar
        </button>
        <button className={`btn ${archiveTab === 'ARCHIVED' ? 'btn-warning text-dark' : 'btn-outline-warning'}`} onClick={() => setArchiveTab('ARCHIVED')}>
          Arxiv (Bekor Qilingan)
        </button>
      </div>

      <OrderFilterBar
        search={search}
        onSearchChange={setSearch}
        customerFilter={customerFilter}
        onCustomerChange={setCustomerFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        customers={customers}
        statuses={statuses}
        priorities={priorities}
      />

      <Card title={`Buyurtmalar Reyestri (${displayedOrders.length} ta)`}>
        {/* Sticky Bulk Action Bar */}
        {selectedOrderIds.length > 0 && (
          <div className="card-custom border-primary bg-primary bg-opacity-10 p-3 rounded-3 d-flex align-items-center justify-content-between mb-3 shadow-sm animate-fade-in">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary text-white fs-7">{selectedOrderIds.length}</span>
              <span className="text-main fw-medium fs-7">ta buyurtma tanlandi.</span>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCalculateBulkIngredients()}
              >
                <LuClipboardList className="me-1" /> Ingredientlarni ommaviy hisoblash
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSelectedOrderIds([])}
              >
                Bekor qilish
              </Button>
            </div>
          </div>
        )}
        <Table columns={columns} data={displayedOrders} tableKey="orders_list" />
      </Card>

      {canCreate && (
        <OrderFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
          }}
          onSubmit={handleCreateOrUpdate}
          order={editingOrder}
          customers={customers}
          boilers={boilers}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Buyurtmani Bekor Qilish"
          message={`Haqiqatan ham '${deletingOrder?.orderNumber}' buyurtmasi bekor qilinsinmi?`}
          isDanger={true}
          confirmText="Bekor qilish"
          cancelText="Orqaga"
        />
      )}

      {/* Bulk Calculation Modal */}
      {isBulkCalcOpen && (
        <ConfirmDialog
          isOpen={isBulkCalcOpen}
          onClose={() => setIsBulkCalcOpen(false)}
          onConfirm={() => setIsBulkCalcOpen(false)}
          title="Ommaviy Ingredientlar va Zaxira Hisoboti"
          confirmText="Tushunarli"
          cancelText=""
          message={
            <div className="text-start" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <p className="fs-7 text-muted mb-3">Tanlangan buyurtmalar uchun jami xomashyo talabi:</p>
              <div className="table-responsive">
                <table className="table table-sm table-bordered fs-8">
                  <thead>
                    <tr className="table-light">
                      <th>Masalliq / Xomashyo</th>
                      <th className="text-center">Jami Kerak</th>
                      <th className="text-center">Omborda Mavjud</th>
                      <th className="text-center">Yetishmovchilik</th>
                      <th className="text-center">Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkCalcData.map((row) => (
                      <tr key={row.materialId}>
                        <td>{row.materialName}</td>
                        <td className="text-center">{row.requiredQty.toLocaleString()} {row.unitName}</td>
                        <td className="text-center">{row.availableStock.toLocaleString()} {row.unitName}</td>
                        <td className="text-center text-danger font-monospace">
                          {row.shortage > 0 ? `${row.shortage.toLocaleString()} ${row.unitName}` : '-'}
                        </td>
                        <td className="text-center">
                          {row.shortage > 0 ? (
                            <span className="badge bg-danger bg-opacity-10 text-danger">Kamchilik</span>
                          ) : (
                            <span className="badge bg-success bg-opacity-10 text-success">Yetarli</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          }
        />
      )}

      <CustomerReceiptModal
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        customerData={receiptOrder ? {
          id: receiptOrder.customerId,
          customerName: receiptOrder.customerName,
          phone: receiptOrder.phone || '',
          boilerModelName: receiptOrder.boilerModelName,
          totalAmount: receiptOrder.totalAmount,
          depositAmount: receiptOrder.depositAmount,
          orderDate: receiptOrder.orderDate,
          deliveryDate: receiptOrder.expectedDeliveryDate,
          autoDiscountOnLate: receiptOrder.autoDiscountOnLate,
          lateDiscountRate: receiptOrder.lateDiscountRate,
          receiptNumber: receiptOrder.orderNumber,
        } : null}
      />

      <InsurancePolicyModal
        isOpen={!!insuranceOrder}
        onClose={() => setInsuranceOrder(null)}
        data={insuranceOrder}
      />
    </div>
  );
};
