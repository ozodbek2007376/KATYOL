import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ReportsFilterBar } from '../components/ReportsFilterBar';
import { ReportExportButtons } from '../components/ReportExportButtons';
import { ReportChartCard } from '../components/ReportChartCard';
import { reportsApi } from '../api/reportsApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';

export const ServiceReportPage = () => {
  const [serviceReport, setServiceReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadServiceReport();
  }, [startDate, endDate]);

  const loadServiceReport = async () => {
    const res = await reportsApi.getServiceReport({ startDate, endDate });
    if (res.success) setServiceReport(res.data);
  };

  usePageAutoRefresh(loadServiceReport, { intervalMs: 15000 });

  if (!serviceReport) {
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

  const typeColumns = [
    { header: 'Servis / Xizmat Turi', accessor: 'name' },
    { header: 'Servislar Soni', cell: (row) => <strong>{row.count} ta ariza</strong> },
  ];

  return (
    <div className="service-report-page animate-fade-in pb-5">

      <PageHeader
        title="Servis va Kafolat Xizmatlari Hisoboti"
        subtitle="Zavod kafolati va pullik texnik xizmatlar arizalari tahlili"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Hisobotlar', path: '/reports' },
          { label: 'Servis Hisoboti' },
        ]}
        actions={<ReportExportButtons reportTitle="Servis va Kafolat Xizmatlari Hisoboti" />}
      />

      <ReportsFilterBar
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      {/* 4 Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <Card className="p-3 border-0 bg-success bg-opacity-10 shadow-sm">
            <small className="text-success font-semibold d-block">Yakunlangan Servislar</small>
            <strong className="text-success fs-3 font-mono">{serviceReport.completedServices} ta</strong>
          </Card>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <Card className="p-3 border-0 bg-primary bg-opacity-10 shadow-sm">
            <small className="text-primary font-semibold d-block">Zavod Kafolati Servislari</small>
            <strong className="text-primary fs-3 font-mono">{serviceReport.warrantyServices} ta</strong>
          </Card>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <Card className="p-3 border-0 bg-info bg-opacity-10 shadow-sm">
            <small className="text-info font-semibold d-block">Pullik Xizmatlar</small>
            <strong className="text-info fs-3 font-mono">{serviceReport.paidServices} ta</strong>
          </Card>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <Card className="p-3 border-0 bg-warning bg-opacity-10 shadow-sm">
            <small className="text-warning text-dark font-semibold d-block">Kutilayotgan Arizalar</small>
            <strong className="text-dark fs-3 font-mono">{serviceReport.pendingServices} ta</strong>
          </Card>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <ReportChartCard
            title="Servis Turlari Bo'yicha Ariza Taqsimoti"
            type="pie"
            data={serviceReport.serviceTypesBreakdown}
            dataKey="count"
            nameKey="name"
          />
        </div>

        <div className="col-12 col-lg-6">
          <Card title="Servis Turlari Reyestri">
            <Table columns={typeColumns} data={serviceReport.serviceTypesBreakdown} tableKey="service_type_report" />
          </Card>
        </div>
      </div>
    </div>
  );
};
