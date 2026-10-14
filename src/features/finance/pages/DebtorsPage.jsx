import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { FinanceSubNav } from '../components/FinanceSubNav';
import { purchasingApi } from '@/features/purchasing/api/purchasingApi';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { customersApi } from '@/features/customers/api/customersApi';
import { formatCurrency, getActiveCurrency } from '@/utils/currency.utils';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { LuBuilding2, LuUsers, LuTriangleAlert, LuArrowUpRight, LuArrowDownLeft, LuCircleCheck, LuCreditCard } from 'react-icons/lu';

export const DebtorsPage = () => {
  const currency = getActiveCurrency();
  const [activeTab, setActiveTab] = useState('company_debts'); // 'company_debts' or 'customer_debts'

  const [companyPayables, setCompanyPayables] = useState([]);
  const [customerReceivables, setCustomerReceivables] = useState([]);
  const [summary, setSummary] = useState({
    totalCompanyDebt: 0,
    totalCustomerDebt: 0,
    netBalance: 0,
  });

  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDebtorsData();
  }, [search]);

  const loadDebtorsData = async () => {
    try {
      // 1. Fetch live purchase orders to calculate Company Debt (Kompaniya qarzi)
      const purchRes = await purchasingApi.getOrders();
      const purchOrders = purchRes.success && Array.isArray(purchRes.data) ? purchRes.data : [];

      // Company Debt = Purchase Orders where paymentStatus is UNPAID or PARTIAL
      let companyTotalDebt = 0;
      const companyDebtsList = purchOrders.map((po) => {
        const total = Number(po.totalAmount) || 0;
        const paid = Number(po.paidAmount) || (po.paymentStatus === 'PAID' ? total : 0);
        const remainingDebt = Math.max(0, total - paid);

        companyTotalDebt += remainingDebt;

        return {
          id: po.id,
          orderNumber: po.orderNumber || `PO-${po.id?.slice(0, 6)}`,
          supplierName: po.supplierName || "Ta'minotchi Korxona",
          itemsCount: po.items?.length || 1,
          totalAmount: total,
          paidAmount: paid,
          remainingDebt,
          date: po.orderDate || po.createdDate || '-',
          status: po.paymentStatus || 'UNPAID',
        };
      });

      // 2. Fetch live customer orders & sales to calculate Customer Debt (Mijozlar qarzi)
      const ordRes = await ordersApi.getOrders();
      const customerOrders = ordRes.success && Array.isArray(ordRes.data) ? ordRes.data : [];

      let customerTotalDebt = 0;
      const customerDebtsList = customerOrders.map((co) => {
        const total = Number(co.totalAmount) || 0;
        const deposit = Number(co.depositAmount) || 0;
        const remainingDebt = Math.max(0, total - deposit);

        customerTotalDebt += remainingDebt;

        return {
          id: co.id,
          orderNumber: co.orderNumber || `ORD-${co.id?.slice(0, 6)}`,
          customerName: co.customerName || 'Mijoz Korxona',
          boilerModelName: co.boilerModelName || 'Sanoat Kotyoli',
          quantity: co.quantity || 1,
          totalAmount: total,
          depositAmount: deposit,
          remainingDebt,
          orderDate: co.orderDate || co.createdDate || '-',
          deliveryDate: co.expectedDeliveryDate || '-',
          status: co.status || 'NEW',
        };
      });

      // Search filters
      let filteredCompanyDebts = companyDebtsList;
      let filteredCustomerDebts = customerDebtsList;

      if (search) {
        const q = search.toLowerCase();
        filteredCompanyDebts = filteredCompanyDebts.filter(
          (c) => c.orderNumber.toLowerCase().includes(q) || c.supplierName.toLowerCase().includes(q)
        );
        filteredCustomerDebts = filteredCustomerDebts.filter(
          (c) => c.orderNumber.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q) || c.boilerModelName.toLowerCase().includes(q)
        );
      }

      setCompanyPayables(filteredCompanyDebts);
      setCustomerReceivables(filteredCustomerDebts);
      setSummary({
        totalCompanyDebt: companyTotalDebt,
        totalCustomerDebt: customerTotalDebt,
        netBalance: customerTotalDebt - companyTotalDebt,
      });
    } catch (err) {
      console.error("loadDebtorsData error:", err);
    }
  };

  usePageAutoRefresh(loadDebtorsData, { intervalMs: 15000 });

  const companyColumns = [
    {
      header: 'Xarid Hujjati №',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7 d-block">{row.orderNumber}</strong>
          <small className="text-muted-custom fs-8">Sana: {row.date}</small>
        </div>
      ),
    },
    {
      header: 'Ta\'minotchi Korxona (Kreditor)',
      cell: (row) => <strong className="text-primary fs-7">{row.supplierName}</strong>,
    },
    {
      header: 'Shartnoma Summasi',
      cell: (row) => <span className="text-main fs-7">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'To\'langan Summa',
      cell: (row) => <span className="text-success fs-7 fw-semibold">{formatCurrency(row.paidAmount)}</span>,
    },
    {
      header: 'Kompaniya Qarzi (Qolgan)',
      cell: (row) => (
        <strong className={row.remainingDebt > 0 ? "text-danger fs-7" : "text-success fs-7"}>
          {formatCurrency(row.remainingDebt)}
        </strong>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const customerColumns = [
    {
      header: 'Buyurtma № va Kotyol',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7 d-block">{row.orderNumber}</strong>
          <small className="text-muted-custom fs-8">{row.boilerModelName} ({row.quantity} dona)</small>
        </div>
      ),
    },
    {
      header: 'Mijoz Korxona (Qarzdor)',
      cell: (row) => <strong className="text-primary fs-7">{row.customerName}</strong>,
    },
    {
      header: 'Kotyol Shartnoma Summasi',
      cell: (row) => <span className="text-main fs-7">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'Zaklad (Avans To\'langan)',
      cell: (row) => (
        <span className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 fs-8 fw-bold">
          {formatCurrency(row.depositAmount)}
        </span>
      ),
    },
    {
      header: 'Mijoz Qarzi (Yetkazib Berilganda)',
      cell: (row) => (
        <strong className={row.remainingDebt > 0 ? "text-danger fs-7" : "text-success fs-7"}>
          {formatCurrency(row.remainingDebt)}
        </strong>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="debtors-page animate-fade-in pb-5">
      <FinanceSubNav />

      <PageHeader
        title="Qarzdorliklar va Kreditorlik Reestri (Debtors & Payables)"
        subtitle="Kompaniyaning ta'minotchilardan qarzdorligi va Mijozlarning kotyol shartnoma qarzlari"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Moliya', path: '/finance' },
          { label: 'Qarzdorlar' },
        ]}
      />

      {/* Summary Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <Card className="p-3 bg-danger bg-opacity-10 border-danger border-opacity-25">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-danger d-block fw-semibold mb-1">Kompaniya Qarzdorligi (Ta'minotchilarga):</small>
                <h4 className="fw-bold text-danger mb-0 font-monospace">{formatCurrency(summary.totalCompanyDebt)}</h4>
              </div>
              <div className="p-3 bg-danger text-white rounded-3">
                <LuArrowUpRight className="fs-4" />
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 col-md-4">
          <Card className="p-3 bg-warning bg-opacity-25 border-warning border-opacity-25">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-dark d-block fw-semibold mb-1">Mijozlar Qarzdorligi (Kompaniyaga):</small>
                <h4 className="fw-bold text-dark mb-0 font-monospace">{formatCurrency(summary.totalCustomerDebt)}</h4>
              </div>
              <div className="p-3 bg-warning text-dark rounded-3">
                <LuArrowDownLeft className="fs-4" />
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 col-md-4">
          <Card className={`p-3 ${summary.netBalance >= 0 ? 'bg-success bg-opacity-10 border-success' : 'bg-secondary bg-opacity-10 border-secondary'}`}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted d-block fw-semibold mb-1">Sof Qarzdorlik Balansi (Net Balance):</small>
                <h4 className={`fw-bold mb-0 font-monospace ${summary.netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(summary.netBalance)}
                </h4>
              </div>
              <div className={`p-3 text-white rounded-3 ${summary.netBalance >= 0 ? 'bg-success' : 'bg-secondary'}`}>
                <LuCircleCheck className="fs-4" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Hujjat №, ta'minotchi yoki mijoz bo'yicha qidiruv...",
        }}
      />

      {/* Tab Navigators */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2 ${activeTab === 'company_debts' ? 'btn-danger text-white' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('company_debts')}
        >
          <LuBuilding2 />
          <span>Kompaniya Qarzi ({companyPayables.length} ta)</span>
        </button>

        <button
          className={`btn btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2 ${activeTab === 'customer_debts' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('customer_debts')}
        >
          <LuUsers />
          <span>Mijozlar Qarzi ({customerReceivables.length} ta)</span>
        </button>
      </div>

      {/* Tables based on active tab */}
      {activeTab === 'company_debts' && (
        <Card title={`Kompaniyaning Ta'minotchilardan Qarzdorlik Ro'yxati (${companyPayables.length} ta)`}>
          <Table columns={companyColumns} data={companyPayables} tableKey="company_payables_list" />
        </Card>
      )}

      {activeTab === 'customer_debts' && (
        <Card title={`Mijozlarning Kotyol Buyurtmalari Qarzdorlik Ro'yxati (${customerReceivables.length} ta)`}>
          <Table columns={customerColumns} data={customerReceivables} tableKey="customer_receivables_list" />
        </Card>
      )}
    </div>
  );
};
