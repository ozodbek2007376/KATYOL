import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ReportsFilterBar } from '../components/ReportsFilterBar';
import { ReportExportButtons } from '../components/ReportExportButtons';
import { ReportChartCard } from '../components/ReportChartCard';
import { reportsApi } from '../api/reportsApi';
import { employeesApi } from '@/features/employees/api/employeesApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';

export const ProductionReportPage = () => {
  const [productionReport, setProductionReport] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  useEffect(() => {
    loadProductionReport();
  }, [startDate, endDate, employeeFilter]);

  const loadProductionReport = async () => {
    const [pRes, eRes] = await Promise.all([
      reportsApi.getProductionReport({ startDate, endDate, employeeFilter }),
      employeesApi.getEmployees(),
    ]);

    if (pRes.success) setProductionReport(pRes.data);
    if (eRes.success) setEmployees(eRes.data);
  };

  usePageAutoRefresh(loadProductionReport, { intervalMs: 15000 });

  if (!productionReport) {
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

  const stageColumns = [
    { header: 'Ishlab Chiqarish Bosqichi', accessor: 'stage' },
    { header: 'Bajarilgan Topshiriqlar Soni', cell: (row) => <strong>{row.completedCount} partiya</strong> },
    { header: 'O\'rtacha Bajarish Vaqti', cell: (row) => <span className="text-primary fw-bold">{row.avgDays} kun</span> },
  ];

  return (
    <div className="production-report-page animate-fade-in pb-5">

      <PageHeader
        title="Ishlab Chiqarish unumdorligi va Bosqichlar Hisoboti"
        subtitle="Sanoat kotyollarini yig'ish tezligi, sexlar yuklamasi hamda o'rtacha ishlab chiqarish vaqti"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Hisobotlar', path: '/reports' },
          { label: 'Ishlab Chiqarish Hisoboti' },
        ]}
        actions={<ReportExportButtons reportTitle="Ishlab Chiqarish unumdorligi Hisoboti" />}
      />

      <ReportsFilterBar
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        employeeFilter={employeeFilter}
        onEmployeeChange={setEmployeeFilter}
        employees={employees}
      />

      {/* 4 Performance Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <Card className="p-3 border-0 bg-success bg-opacity-10 shadow-sm">
            <small className="text-success font-semibold d-block">Yakunlangan Partiyalar</small>
            <strong className="text-success fs-3 font-mono">{productionReport.completedBatches} partiya</strong>
          </Card>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <Card className="p-3 border-0 bg-primary bg-opacity-10 shadow-sm">
            <small className="text-primary font-semibold d-block">Jarayonda (Sexlarda)</small>
            <strong className="text-primary fs-3 font-mono">{productionReport.inProgressBatches} partiya</strong>
          </Card>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <Card className="p-3 border-0 bg-danger bg-opacity-10 shadow-sm">
            <small className="text-danger font-semibold d-block">Kechikayotgan Topshiriqlar</small>
            <strong className="text-danger fs-3 font-mono">{productionReport.delayedBatches} partiya</strong>
          </Card>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <Card className="p-3 border-0 bg-info bg-opacity-10 shadow-sm">
            <small className="text-info font-semibold d-block">O'rtacha Ishlab Chiqarish Vaqti</small>
            <strong className="text-info fs-3 font-mono">{productionReport.averageProductionDays} kun</strong>
          </Card>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <ReportChartCard
            title="Bosqichlar Bo'yicha O'rtacha Bajarish Vaqti (Kunlarda)"
            type="bar"
            data={productionReport.stageBreakdown}
            dataKey="avgDays"
            nameKey="stage"
            barColor="#3b82f6"
          />
        </div>

        <div className="col-12 col-lg-6">
          <Card title="Zavod Sexlari va Bosqichlar Unumdorligi">
            <Table columns={stageColumns} data={productionReport.stageBreakdown} tableKey="stage_report" />
          </Card>
        </div>
      </div>
    </div>
  );
};
