import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ReportsFilterBar } from '../components/ReportsFilterBar';
import { ReportExportButtons } from '../components/ReportExportButtons';
import { ReportChartCard } from '../components/ReportChartCard';
import { reportsApi } from '../api/reportsApi';
import { customersApi } from '@/features/customers/api/customersApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';

export const SalesReportPage = () => {
  const [salesReport, setSalesReport] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  useEffect(() => {
    loadSalesReport();
  }, [startDate, endDate, customerFilter]);

  const loadSalesReport = async () => {
    const [sRes, cRes] = await Promise.all([
      reportsApi.getSalesReport({ startDate, endDate, customerFilter }),
      customersApi.getCustomers(),
    ]);

    if (sRes.success) setSalesReport(sRes.data);
    if (cRes.success) setCustomers(cRes.data);
  };

  usePageAutoRefresh(loadSalesReport, { intervalMs: 15000 });

  if (!salesReport) {
    return (
      <div className="reports-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const topCustomersColumns = [
    { header: 'Mijoz Korxona Nomi', accessor: 'name' },
    { header: 'Buyurtmalar Soni', accessor: 'orderCount' },
    {
      header: 'Jami Harid Summasi',
      cell: (row) => <strong className="text-primary font-mono">{formatCurrency(row.totalAmount)}</strong>,
    },
  ];

  const topProductsColumns = [
    { header: 'Kotyol Modeli Nomi', accessor: 'name' },
    { header: 'Sotilgan Miqdor', cell: (row) => <strong>{row.soldQuantity} dona</strong> },
    {
      header: 'Jami Tushum',
      cell: (row) => <strong className="text-success font-mono">{formatCurrency(row.totalRevenue)}</strong>,
    },
  ];

  return (
    <div className="sales-report-page animate-fade-in pb-5">

      <PageHeader
        title="Sotuvlar Tahlili va Tushumlar Hisoboti"
        subtitle="Sotuv hajmi dinamikasi, top mijozlar hamda eng ko'p sotilgan pech modellari"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Hisobotlar', path: '/reports' },
          { label: 'Sotuv Hisoboti' },
        ]}
        actions={<ReportExportButtons reportTitle="Sotuvlar Tahlili va Tushumlar Hisoboti" />}
      />

      <ReportsFilterBar
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        customerFilter={customerFilter}
        onCustomerChange={setCustomerFilter}
        customers={customers}
      />

      <div className="row g-3 mb-4">
        <div className="col-12">
          <ReportChartCard
            title="Oylik Sotuv Hajmi Dinamikasi ($)"
            type="bar"
            data={salesReport.salesByMonth}
            dataKey="totalSales"
            nameKey="month"
            barColor="#10b981"
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <Card title="Top Xaridor Mijozlar Reytingi">
            <Table columns={topCustomersColumns} data={salesReport.topCustomers} tableKey="top_customers" />
          </Card>
        </div>

        <div className="col-12 col-lg-6">
          <Card title="Eng Xaridorgir Kotyol Modellari">
            <Table columns={topProductsColumns} data={salesReport.topProducts} tableKey="top_products" />
          </Card>
        </div>
      </div>
    </div>
  );
};
