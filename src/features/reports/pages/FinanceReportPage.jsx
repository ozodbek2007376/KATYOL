import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ReportsFilterBar } from '../components/ReportsFilterBar';
import { ReportExportButtons } from '../components/ReportExportButtons';
import { ReportChartCard } from '../components/ReportChartCard';
import { reportsApi } from '../api/reportsApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';

export const FinanceReportPage = () => {
  const [financeReport, setFinanceReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadFinanceReport();
  }, [startDate, endDate]);

  const loadFinanceReport = async () => {
    const res = await reportsApi.getFinanceReport({ startDate, endDate });
    if (res.success) setFinanceReport(res.data);
  };

  usePageAutoRefresh(loadFinanceReport, { intervalMs: 15000 });

  if (!financeReport) {
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

  const monthlyColumns = [
    { header: 'Oynlik Davr', accessor: 'month' },
    {
      header: 'Daromadlar',
      cell: (row) => <strong className="text-success font-mono">{formatCurrency(row.income)}</strong>,
    },
    {
      header: 'Xarajatlar',
      cell: (row) => <strong className="text-danger font-mono">{formatCurrency(row.expense)}</strong>,
    },
    {
      header: 'Sof Foyda',
      cell: (row) => <strong className="text-primary font-mono">{formatCurrency(row.profit)}</strong>,
    },
  ];

  return (
    <div className="finance-report-page animate-fade-in pb-5">

      <PageHeader
        title="Moliya va G'azna Tahlili Hisoboti"
        subtitle="Daromadlar, operatsion xarajatlar va sof foyda oylik dinamikasi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Hisobotlar', path: '/reports' },
          { label: 'Moliya Hisoboti' },
        ]}
        actions={<ReportExportButtons reportTitle="Moliya va G'azna Tahlili Hisoboti" />}
      />

      <ReportsFilterBar
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <ReportChartCard
            title="Oylik Sof Foyda Dinamikasi ($)"
            type="line"
            data={financeReport.monthlyComparison}
            dataKey="profit"
            nameKey="month"
            lineColor="#3b82f6"
          />
        </div>

        <div className="col-12 col-lg-6">
          <ReportChartCard
            title="Xarajatlar Turlari Bo'yicha Taqsimot ($)"
            type="pie"
            data={financeReport.expenseDistribution}
            dataKey="amount"
            nameKey="name"
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <Card title="Oylik Moliya Taqqoslash Jadvali">
            <Table columns={monthlyColumns} data={financeReport.monthlyComparison} tableKey="finance_report_table" />
          </Card>
        </div>
      </div>
    </div>
  );
};
