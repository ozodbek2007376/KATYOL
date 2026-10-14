import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuShoppingCart, LuPlus, LuEye, LuPencil, LuTrash2, LuAward, LuPrinter } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SaleFormModal } from '../components/SaleFormModal';
import { InsurancePolicyModal } from '@/components/common/InsurancePolicyModal/InsurancePolicyModal';
import { SaleReceiptModal } from '@/components/common/SaleReceiptModal/SaleReceiptModal';
import { salesApi } from '../api/salesApi';
import { formatCurrency } from '@/utils/currency.utils';
import { usePermission } from '@/hooks/usePermission';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { ROUTES } from '@/constants/routes.constants';
import { notifyError, notifySuccess } from '@/services/notification.service';

export const SalesPage = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermission();

  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [boilerFilter, setBoilerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [archiveTab, setArchiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'ARCHIVED'

  const [customers, setCustomers] = useState([]);
  const [boilers, setBoilers] = useState([]);
  const [salesStatuses, setSalesStatuses] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [insuranceSale, setInsuranceSale] = useState(null);
  const [selectedReceiptSaleId, setSelectedReceiptSaleId] = useState(null);

  useEffect(() => {
    loadSalesData();
  }, [search, customerFilter, boilerFilter, statusFilter, startDate, endDate]);

  const loadSalesData = async () => {
    const [saleRes, custRes, boilRes, stRes] = await Promise.all([
      salesApi.getSales({
        search,
        customerId: customerFilter,
        boilerId: boilerFilter,
        status: statusFilter,
        startDate,
        endDate,
      }),
      salesApi.getCustomersList(),
      salesApi.getBoilersList(),
      salesApi.getSalesStatuses(),
    ]);

    if (saleRes.success) setSales(saleRes.data);
    if (custRes.success) setCustomers(custRes.data);
    if (boilRes.success) setBoilers(boilRes.data);
    if (stRes.success) setSalesStatuses(stRes.data);
  };

  usePageAutoRefresh(loadSalesData, { intervalMs: 15000, isEditing: isModalOpen || isConfirmOpen });

  const handleOpenAddModal = () => {
    setSelectedSale(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, sale) => {
    e.stopPropagation();
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (e, id) => {
    e.stopPropagation();
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteSale = async () => {
    if (!deleteId) return;
    const res = await salesApi.deleteSale(deleteId);
    if (res.success) {
      notifySuccess(res.message || "Sotuv hujjati o'chirildi.");
    } else {
      notifyError(res.message || "Sotuv hujjatini o'chirishda xatolik.");
    }
    setIsConfirmOpen(false);
    setDeleteId(null);
    loadSalesData();
  };

  const handleArchiveSale = async (sale) => {
    const res = await salesApi.updateSale(sale.id, { ...sale, status: 'ARCHIVED' });
    if (res.success) {
      notifySuccess("Sotuv hujjati arxivlandi.");
      loadSalesData();
    } else {
      notifyError(res.message);
    }
  };

  const handleRestoreSale = async (sale) => {
    const res = await salesApi.updateSale(sale.id, { ...sale, status: 'ACTIVE' });
    if (res.success) {
      notifySuccess("Sotuv hujjati arxivdan chiqarildi.");
      loadSalesData();
    } else {
      notifyError(res.message);
    }
  };

  const displayedSales = sales.filter((s) => {
    if (archiveTab === 'ACTIVE') {
      return s.status !== 'ARCHIVED';
    } else {
      return s.status === 'ARCHIVED';
    }
  });

  const customerOptions = [
    { value: '', label: 'Barcha Mijozlar' },
    ...customers.map((c) => ({ value: c.id, label: c.customerName })),
  ];

  const boilerOptions = [
    { value: '', label: 'Barcha Kotyol Modellari' },
    ...boilers.map((b) => ({ value: b.id, label: b.modelName })),
  ];

  const statusOptions = [
    { value: '', label: 'Barcha Statuslar' },
    ...salesStatuses.map((s) => ({ value: s.code, label: s.name })),
  ];

  const handleReset = () => {
    setSearch('');
    setCustomerFilter('');
    setBoilerFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  const columns = [
    {
      header: 'Schyot-Faktura №',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7 d-block">{row.invoiceNumber}</strong>
          <small className="text-muted-custom fs-8">Sana: {row.saleDate}</small>
        </div>
      ),
    },
    {
      header: 'Mijoz Korxona',
      cell: (row) => (
        <div>
          <span className="fw-semibold text-main fs-7 d-block">{row.customerName}</span>
          <small className="text-secondary fs-8">Mas'ul: {row.createdBy}</small>
        </div>
      ),
    },
    {
      header: 'Kotyol Modeli',
      cell: (row) => (
        <div>
          <span className="fw-bold text-primary fs-7 d-block">{row.boilerModelName}</span>
          <small className="text-muted-custom fs-8">Sotuv Miqdori: {row.quantity} dona</small>
        </div>
      ),
    },
    {
      header: 'Jami Summa',
      cell: (row) => <strong className="text-primary fs-7">{formatCurrency(row.totalAmount)}</strong>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={`badge ${
            row.status === 'COMPLETED' ? 'bg-success' : row.status === 'CANCELLED' ? 'bg-danger' : 'bg-warning text-dark'
          } fs-8`}
        >
          {row.statusName}
        </span>
      ),
    },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          {row.status === 'ARCHIVED' ? (
            <>
              <button
                className="btn btn-sm btn-outline-primary p-1 border-0"
                onClick={() => navigate(`${ROUTES.PROTECTED.SALES}/${row.id}`)}
                title="Tafsilotini ko'rish"
              >
                <LuEye />
              </button>
              <button
                className="btn btn-sm btn-outline-primary p-1 border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReceiptSaleId(row.id);
                }}
                title="Sotuv Chekini Chop Etish"
              >
                <LuPrinter />
              </button>
              <button
                className="btn btn-sm btn-outline-success p-1 border-0"
                onClick={() => handleRestoreSale(row)}
                title="Arxivdan chiqarish"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
              {canDelete && (
                <button
                  className="btn btn-sm btn-outline-danger p-1 border-0"
                  onClick={(e) => handleOpenDeleteConfirm(e, row.id)}
                  title="Butkul o'chirish"
                >
                  <LuTrash2 />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                className="btn btn-sm btn-outline-primary p-1 border-0"
                onClick={() => navigate(`${ROUTES.PROTECTED.SALES}/${row.id}`)}
                title="Tafsilotini ko'rish"
              >
                <LuEye />
              </button>
              <button
                className="btn btn-sm btn-outline-success p-1 border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setInsuranceSale(row);
                }}
                title="Sug'urta Polisi va Bepul Kafolat Guvohnomasi"
              >
                <LuAward />
              </button>
              <button
                className="btn btn-sm btn-outline-primary p-1 border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReceiptSaleId(row.id);
                }}
                title="Sotuv Chekini Chop Etish"
              >
                <LuPrinter />
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
              <button
                className="btn btn-sm btn-outline-warning p-1 border-0"
                onClick={() => handleArchiveSale(row)}
                title="Arxivlash"
              >
                <i className="bi bi-archive"></i>
              </button>
              {canDelete && (
                <button
                  className="btn btn-sm btn-outline-danger p-1 border-0"
                  onClick={(e) => handleOpenDeleteConfirm(e, row.id)}
                  title="O'chirish"
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
    <div className="sales-page animate-fade-in pb-5">
      <PageHeader
        title="Sotuvlar va Tijorat Moduli"
        subtitle="Tayyor kotyol va pechlarni mijozlarga sotish, faktura rasmiylashtirish va tijorat tahlili"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sotuvlar' },
        ]}
        actions={
          canCreate && (
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handleOpenAddModal}>
              <LuPlus />
              <span>Yangi Sotuv</span>
            </button>
          )
        }
      />

      <div className="btn-group mb-3">
        <button className={`btn ${archiveTab === 'ACTIVE' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setArchiveTab('ACTIVE')}>
          Faol Sotuvlar
        </button>
        <button className={`btn ${archiveTab === 'ARCHIVED' ? 'btn-warning text-dark' : 'btn-outline-warning'}`} onClick={() => setArchiveTab('ARCHIVED')}>
          Arxiv (Fakturalar)
        </button>
      </div>

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Faktura №, mijoz yoki kotyol modeli bo'yicha qidiruv...",
        }}
        dateRange={{
          startDate,
          onStartDateChange: setStartDate,
          endDate,
          onEndDateChange: setEndDate,
        }}
        primarySelects={[
          { id: 'customer', label: 'Mijoz Korxona', value: customerFilter, onChange: setCustomerFilter, options: customerOptions },
        ]}
        advancedSelects={[
          { id: 'boiler', label: 'Kotyol Modeli', value: boilerFilter, onChange: setBoilerFilter, options: boilerOptions },
          { id: 'status', label: 'Sotuv Statusi', value: statusFilter, onChange: setStatusFilter, options: statusOptions },
        ]}
        onReset={handleReset}
      />

      <Card title={`Sotuv Hujjatlari Ro'yxati (${displayedSales.length} ta)`}>
        <Table columns={columns} data={displayedSales} tableKey="sales_list" />
      </Card>

      <SaleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sale={selectedSale}
        onSave={loadSalesData}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteSale}
        title="Sotuv Hujjatini O'chirish"
        message="Haqiqatan ham ushbu sotuv hujjatini tizimdan o'chirmoqchimisiz?"
      />

      <InsurancePolicyModal
        isOpen={!!insuranceSale}
        onClose={() => setInsuranceSale(null)}
        data={insuranceSale}
      />

      <SaleReceiptModal
        isOpen={!!selectedReceiptSaleId}
        onClose={() => setSelectedReceiptSaleId(null)}
        saleId={selectedReceiptSaleId}
      />
    </div>
  );
};
