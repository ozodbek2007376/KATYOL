import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ReportsFilterBar } from '../components/ReportsFilterBar';
import { ReportExportButtons } from '../components/ReportExportButtons';
import { ReportChartCard } from '../components/ReportChartCard';
import { reportsApi } from '../api/reportsApi';
import { formatCurrency } from '@/utils/currency.utils';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';

export const GeneralReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    const res = await reportsApi.getGeneralReport(dateRange);
    if (res.success) setReportData(res.data);
  };

  usePageAutoRefresh(loadReport, { intervalMs: 15000 });

  if (!reportData) {
    return (
      <div className="general-report-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const { cards, chart } = reportData;

  return (
    <div className="general-report-page animate-fade-in pb-5">
      <PageHeader
        title="Umumiy Kompaniya Tahliliy Hisoboti"
        subtitle="Barcha biznes modullari bo'yicha konsolidatsiyalangan ijro va ko'rsatkichlar tahlili"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Hisobotlar' },
        ]}
        actions={<ReportExportButtons title="Umumiy_Hisobot" />}
      />

      <ReportsFilterBar dateRange={dateRange} onDateRangeChange={setDateRange} />

      {/* 8 Executive Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <Card className="p-3 border-0 bg-primary bg-opacity-10 shadow-sm">
            <small className="text-primary font-semibold d-block">Jami Sotuvlar Summasi</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(cards.totalSalesAmount)}</strong>
            <small className="text-muted-custom fs-8">Davr bo'yicha jami</small>
          </Card>
        </div>

        <div className="col-12 col-md-3">
          <Card className="p-3 border-0 bg-success bg-opacity-10 shadow-sm">
            <small className="text-success font-semibold d-block">Sof Foyda</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(cards.netProfit)}</strong>
            <small className="text-muted-custom fs-8">Marja o'rtacha 24%</small>
          </Card>
        </div>

        <div className="col-12 col-md-3">
          <Card className="p-3 border-0 bg-info bg-opacity-10 shadow-sm">
            <small className="text-info font-semibold d-block">Ishlab Chiqarilgan Kotyollar</small>
            <strong className="text-main fs-5 d-block mt-1">{cards.productionCompletedCount} dona</strong>
            <small className="text-muted-custom fs-8">Sanoat pech va kotyollar</small>
          </Card>
        </div>

        <div className="col-12 col-md-3">
          <Card className="p-3 border-0 bg-warning bg-opacity-10 shadow-sm">
            <small className="text-warning text-dark font-semibold d-block">Ombor Zaxirasi Qiymati</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(cards.warehouseStockValue)}</strong>
            <small className="text-muted-custom fs-8">Xomashyo va tayyor mahsulot</small>
          </Card>
        </div>

        <div className="col-12 col-md-3">
          <Card className="p-3 border-0 bg-secondary bg-opacity-10 shadow-sm">
            <small className="text-secondary font-semibold d-block">Jami Xaridlar Summasi</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(cards.totalPurchasingAmount)}</strong>
            <small className="text-muted-custom fs-8">Ta'minot xarajatlari</small>
          </Card>
        </div>

        <div className="col-12 col-md-3">
          <Card className="p-3 border-0 bg-danger bg-opacity-10 shadow-sm">
            <small className="text-danger font-semibold d-block">Operatsion Xarajatlar</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(cards.operationalExpenses)}</strong>
            <small className="text-muted-custom fs-8">Maosh, ijara va kommunal</small>
          </Card>
        </div>

        <div className="col-12 col-md-3">
          <Card className="p-3 border-0 bg-primary bg-opacity-10 shadow-sm">
            <small className="text-primary font-semibold d-block">Mijozlar Qarzi</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(cards.customerReceivables)}</strong>
            <small className="text-muted-custom fs-8">Kutilayotgan tushum</small>
          </Card>
        </div>

        <div className="col-12 col-md-3">
          <Card className="p-3 border-0 bg-success bg-opacity-10 shadow-sm">
            <small className="text-success font-semibold d-block">Servis Arizalari</small>
            <strong className="text-main fs-5 d-block mt-1">{cards.serviceRequestsCount} ta</strong>
            <small className="text-muted-custom fs-8">Kafolatli va profilaktik</small>
          </Card>
        </div>
      </div>

      {/* Main Chart */}
      <ReportChartCard
        title="Oylik Tushumlar va Xarajatlar Dinamikasi"
        type="bar"
        data={chart}
        dataKeys={[
          { key: 'sales', name: 'Sotuvlar ($)', color: '#0d6efd' },
          { key: 'expenses', name: 'Xarajatlar ($)', color: '#dc3545' },
        ]}
      />
    </div>
  );
};
