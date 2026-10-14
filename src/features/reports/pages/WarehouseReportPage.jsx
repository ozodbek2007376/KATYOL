import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ReportsFilterBar } from '../components/ReportsFilterBar';
import { ReportExportButtons } from '../components/ReportExportButtons';
import { ReportChartCard } from '../components/ReportChartCard';
import { reportsApi } from '../api/reportsApi';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { LuTriangleAlert } from 'react-icons/lu';

export const WarehouseReportPage = () => {
  const [warehouseReport, setWarehouseReport] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  useEffect(() => {
    loadWarehouseReport();
  }, [startDate, endDate, warehouseFilter]);

  const loadWarehouseReport = async () => {
    const [wRes, whsRes] = await Promise.all([
      reportsApi.getWarehouseReport({ startDate, endDate, warehouseFilter }),
      settingsApi.getWarehouses(),
    ]);

    if (wRes.success) setWarehouseReport(wRes.data);
    if (whsRes.success) setWarehouses(whsRes.data);
  };

  usePageAutoRefresh(loadWarehouseReport, { intervalMs: 15000 });

  if (!warehouseReport) {
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

  const lowStockColumns = [
    { header: 'Material / Mahsulot Nomi', accessor: 'name' },
    {
      header: 'Joriy Qoldiq',
      cell: (row) => <strong className="text-danger">{row.stock} {row.unit}</strong>,
    },
    {
      header: "Minimal Ogohlantirish Me'zoni",
      cell: (row) => <span className="text-muted-custom">{row.minAlert} {row.unit}</span>,
    },
  ];

  const mostUsedColumns = [
    { header: 'Material Nomi', accessor: 'name' },
    { header: 'Sarf Qilingan Miqdor', cell: (row) => <strong>{row.usedQty}</strong> },
    {
      header: 'Jami Sarf Qiymati',
      cell: (row) => <strong className="text-primary font-mono">{formatCurrency(row.cost)}</strong>,
    },
  ];

  return (
    <div className="warehouse-report-page animate-fade-in pb-5">

      <PageHeader
        title="Omborxona Zaxiralari va Materiallar Hisoboti"
        subtitle="Ombor qiymati, kategoriya taqsimoti hamda tanqis (kam qolgan) materiallar ogohlantirishlari"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Hisobotlar', path: '/reports' },
          { label: 'Ombor Hisoboti' },
        ]}
        actions={<ReportExportButtons reportTitle="Omborxona Zaxiralari va Materiallar Hisoboti" />}
      />

      <ReportsFilterBar
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        warehouseFilter={warehouseFilter}
        onWarehouseChange={setWarehouseFilter}
        warehouses={warehouses}
      />

      {/* Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <Card className="p-3 border-0 bg-primary bg-opacity-10 shadow-sm">
            <small className="text-primary font-semibold d-block">Jami Ombor Aktivlari Qiymati</small>
            <strong className="text-primary fs-3 font-mono">{formatCurrency(warehouseReport.inventoryValue)}</strong>
          </Card>
        </div>

        <div className="col-12 col-md-4">
          <Card className="p-3 border-0 bg-success bg-opacity-10 shadow-sm">
            <small className="text-success font-semibold d-block">Nomenklatura Birliklari Soni</small>
            <strong className="text-success fs-3 font-mono">{warehouseReport.totalItemsCount} turda</strong>
          </Card>
        </div>

        <div className="col-12 col-md-4">
          <Card className="p-3 border-0 bg-danger bg-opacity-10 shadow-sm">
            <small className="text-danger font-semibold d-block">Kam Qolgan Materiallar (Alert)</small>
            <strong className="text-danger fs-3 font-mono">{warehouseReport.lowStockItemsCount} ta material</strong>
          </Card>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <ReportChartCard
            title="Ombor Zaxiralarining Kategoriyalar Bo'yicha Taqsimoti ($)"
            type="pie"
            data={warehouseReport.categoryDistribution}
            dataKey="value"
            nameKey="name"
          />
        </div>

        <div className="col-12 col-lg-6">
          <Card
            title={
              <div className="d-flex align-items-center gap-2 text-danger">
                <LuTriangleAlert /> <span>Kam Qolgan Materiallar Ogohlantirishi</span>
              </div>
            }
          >
            <Table columns={lowStockColumns} data={warehouseReport.lowStockList} tableKey="low_stock" />
          </Card>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <Card title="Ishlab Chiqarishda Eng Ko'p Sarflangan Xomashyolar">
            <Table columns={mostUsedColumns} data={warehouseReport.mostUsedMaterials} tableKey="most_used" />
          </Card>
        </div>
      </div>
    </div>
  );
};
