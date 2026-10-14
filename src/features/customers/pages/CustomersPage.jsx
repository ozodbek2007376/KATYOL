import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuUsers, LuPrinter, LuCalendar, LuTriangleAlert, LuAward } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { CustomersSubNav } from '../components/CustomersSubNav';
import { CustomerFilterBar } from '../components/CustomerFilterBar';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { CustomerReceiptModal } from '@/components/common/CustomerReceiptModal/CustomerReceiptModal';
import { InsurancePolicyModal } from '@/components/common/InsurancePolicyModal/InsurancePolicyModal';
import { customersApi } from '../api/customersApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [receiptCustomer, setReceiptCustomer] = useState(null);
  const [insuranceCustomer, setInsuranceCustomer] = useState(null);

  const customerTypes = dynamicSettingsService.getCustomerTypes();
  const regions = dynamicSettingsService.getRegions();

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadCustomersData();
  }, [search, customerTypeFilter, regionFilter, statusFilter]);

  const loadCustomersData = async () => {
    const res = await customersApi.getCustomers({
      search,
      customerTypeId: customerTypeFilter,
      region: regionFilter,
      status: statusFilter,
    });
    if (res.success) setCustomers(res.data);
  };

  // Background Auto-Refresh every 15s (Pauses while modal is open)
  usePageAutoRefresh(loadCustomersData, { intervalMs: 15000, isEditing: isModalOpen || isConfirmOpen || !!receiptCustomer });

  const handleCreateOrUpdate = async (formData) => {
    if (editingCustomer) {
      const res = await customersApi.updateCustomer(editingCustomer.id, formData);
      notifySuccess(res.message);
    } else {
      const res = await customersApi.createCustomer(formData);
      if (!res.success) {
        notifySuccess(res.message);
        return;
      }
      notifySuccess(res.message);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
    loadCustomersData();
  };

  const handleDelete = async () => {
    if (deletingCustomer) {
      const res = await customersApi.deleteCustomer(deletingCustomer.id);
      notifySuccess(res.message);
      setIsConfirmOpen(false);
      setDeletingCustomer(null);
      loadCustomersData();
    }
  };

  const columns = [
    {
      header: 'Mijoz va Kotyol',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-3 bg-info bg-opacity-10 text-info p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <LuUsers className="fs-5" />
          </div>
          <div>
            <Link to={`${ROUTES.PROTECTED.CUSTOMERS}/${row.id}`} className="fw-bold text-primary text-decoration-none fs-7">
              {row.customerName}
            </Link>
            <small className="d-block text-muted-custom fs-8">{row.boilerModelName || '—'}</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Telefon Raqam',
      cell: (row) => <strong className="text-main fs-7">{row.phone}</strong>,
    },
    {
      header: 'Zaklad (Avans)',
      cell: (row) => (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 fs-8 fw-bold">
          {formatCurrency(row.depositAmount || 0)}
        </span>
      ),
    },
    {
      header: 'Zakaz & Yetkazish',
      cell: (row) => {
        const isOverdue = row.deliveryDate && row.deliveryDate < todayStr;
        return (
          <div className="fs-8">
            <div>Zakaz: <strong>{row.orderDate || row.createdDate || '-'}</strong></div>
            <div>
              Yetkazish: <strong className={isOverdue ? "text-danger" : "text-primary"}>{row.deliveryDate || '-'}</strong>
              {isOverdue && row.autoDiscountOnLate && (
                <span className="badge bg-danger ms-1" title="Muddati o'tgan - Avtomatik chegirma faol">
                  <LuTriangleAlert /> Kechikkan
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Mijoz Turi',
      cell: (row) => <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">{row.customerTypeName}</span>,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <button
            className="btn btn-sm btn-outline-primary p-1 border-0"
            onClick={() => setReceiptCustomer(row)}
            title="Chek chiqarish va Chop etish"
          >
            <LuPrinter />
          </button>
          <button
            className="btn btn-sm btn-outline-success p-1 border-0"
            onClick={() => setInsuranceCustomer(row)}
            title="Sug'urta Polisi va Bepul Servis Qog'ozi"
          >
            <LuAward />
          </button>
          <Link
            to={`${ROUTES.PROTECTED.CUSTOMERS}/${row.id}`}
            className="btn btn-sm btn-outline-info p-1 border-0"
            title="Tafsilotini ko'rish"
          >
            <LuEye />
          </Link>
          <button
            className="btn btn-sm btn-outline-secondary p-1 border-0"
            onClick={() => {
              setEditingCustomer(row);
              setIsModalOpen(true);
            }}
            title="Tahrirlash"
          >
            <LuPencil />
          </button>
          <button
            className="btn btn-sm btn-outline-danger p-1 border-0"
            onClick={() => {
              setDeletingCustomer(row);
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
    <div className="customers-page animate-fade-in pb-5">
      <CustomersSubNav />

      <PageHeader
        title="Mijozlar Boshqaruvi va Buyurtmalar Moduli"
        subtitle="Yuridik hamda jismoniy xaridorlar reyestri, zaklad avanslari, muddatlar va chek chop etish"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Mijozlar' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
          >
            <LuPlus className="me-1" /> Yangi Mijoz va Zaklad Qo'shish
          </Button>
        }
      />

      <CustomerFilterBar
        search={search}
        onSearchChange={setSearch}
        customerTypeFilter={customerTypeFilter}
        onCustomerTypeChange={setCustomerTypeFilter}
        regionFilter={regionFilter}
        onRegionChange={setRegionFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        customerTypes={customerTypes}
        regions={regions}
      />

      <Card title={`Ro'yxatga Olingan Mijozlar Katalogi (${customers.length} ta)`}>
        <Table columns={columns} data={customers} tableKey="customers_list" />
      </Card>

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleCreateOrUpdate}
        customer={editingCustomer}
      />

      <CustomerReceiptModal
        isOpen={!!receiptCustomer}
        onClose={() => setReceiptCustomer(null)}
        customerData={receiptCustomer}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Mijozni O'chirish"
        message={`Haqiqatan ham '${deletingCustomer?.customerName}' mijoz kartochkasi bazadan o'chirilsinmi?`}
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />

      <InsurancePolicyModal
        isOpen={!!insuranceCustomer}
        onClose={() => setInsuranceCustomer(null)}
        data={insuranceCustomer}
      />
    </div>
  );
};
