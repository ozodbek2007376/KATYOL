import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuEye, LuLock } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { auditApi } from '../api/auditApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { ROUTES } from '@/constants/routes.constants';

export const AuditLogPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadAuditData();
  }, [search, moduleFilter, actionFilter, startDate, endDate]);

  const loadAuditData = async () => {
    const res = await auditApi.getAuditLogs({
      search,
      module: moduleFilter,
      action: actionFilter,
      startDate,
      endDate,
    });
    if (res.success) {
      setAuditLogs(res.data);
      setTotalCount(res.pagination?.total || res.data.length);
    }
  };

  usePageAutoRefresh(loadAuditData, { intervalMs: 15000 });

  const moduleOptions = [
    { value: '', label: 'Barcha Modullar' },
    { value: 'Sale', label: 'Sotuv' },
    { value: 'Lead', label: 'Lid' },
    { value: 'Order', label: 'Buyurtma' },
    { value: 'ServiceTicket', label: 'Servis' },
    { value: 'Product', label: 'Mahsulot' },
    { value: 'Boiler', label: 'Kotyol' },
    { value: 'Customer', label: 'Mijoz' },
    { value: 'User', label: 'Foydalanuvchi' },
    { value: 'FinanceTransaction', label: 'Moliya' },
    { value: 'ProductionOrder', label: 'Ishlab Chiqarish' },
  ];

  const actionOptions = [
    { value: '', label: 'Barcha Amallar' },
    { value: 'CREATE', label: 'Yaratildi' },
    { value: 'UPDATE', label: 'Yangilandi' },
    { value: 'DELETE', label: "O'chirildi" },
    { value: 'LOGIN', label: 'Tizimga kirildi' },
    { value: 'STAGE_UPDATE', label: "Bosqich O'zgartirildi" },
    { value: 'ASSIGN_EMPLOYEE', label: 'Xodim Biriktirildi' },
    { value: 'STOCK_MOVEMENT', label: 'Ombor Kirimi' },
    { value: 'COMPLETE', label: 'Yakunlandi' },
  ];

  const handleReset = () => {
    setSearch('');
    setModuleFilter('');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
  };

  const columns = [
    {
      header: 'Sana va Vaqt',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7 d-block">{row.date}</strong>
          <small className="text-muted-custom fs-8">{row.time}</small>
        </div>
      ),
    },
    {
      header: 'Foydalanuvchi',
      cell: (row) => <strong className="text-primary fs-7">{row.user}</strong>,
    },
    {
      header: 'Modul',
      cell: (row) => <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">{row.moduleLabel}</span>,
    },
    {
      header: 'Amal Turi',
      cell: (row) => <span className="fw-semibold text-main fs-7">{row.actionLabel}</span>,
    },
    {
      header: "Tegishli Hujjat / Ob'yekt",
      cell: (row) => (
        <Link to={row.linkPath} className="fw-bold text-primary text-decoration-none fs-7">
          {row.affectedRecord}
        </Link>
      ),
    },
    {
      header: 'IP Manzil',
      cell: (row) => <code className="fs-8 text-muted-custom">{row.ipAddress}</code>,
    },
    {
      header: 'Tafsilot',
      cell: (row) => (
        <Link
          to={`${ROUTES.PROTECTED.AUDIT}/${row.id}`}
          className="btn btn-sm btn-outline-primary p-1 border-0"
          title="Tafsilotini ko'rish"
        >
          <LuEye />
        </Link>
      ),
    },
  ];

  return (
    <div className="audit-log-page animate-fade-in pb-5">
      <div className="alert alert-warning d-flex align-items-center gap-2 mb-3 py-2 px-3 fs-7 rounded-3">
        <LuLock className="fs-5" />
        <span>Audit Jurnali yozuvlari o'zgartirilmas. Tahrirlash va o'chirish amallari taqiqlangan.</span>
      </div>

      <PageHeader
        title="Barcha Hodisalar va Audit Jurnali"
        subtitle="ERP tizimidagi barcha harakatlar va o'zgarishlarning buzilmas xronologik jurnali"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Audit Jurnali' },
        ]}
      />

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Foydalanuvchi, hujjat № yoki izoh bo'yicha qidiruv...",
        }}
        dateRange={{
          startDate,
          onStartDateChange: setStartDate,
          endDate,
          onEndDateChange: setEndDate,
        }}
        primarySelects={[
          { id: 'module', label: 'Modul', value: moduleFilter, onChange: setModuleFilter, options: moduleOptions },
          { id: 'action', label: 'Amal Turi', value: actionFilter, onChange: setActionFilter, options: actionOptions },
        ]}
        onReset={handleReset}
      />

      <Card title={`Audit Jurnali Yozuvlari (${totalCount} ta)`}>
        <Table columns={columns} data={auditLogs} tableKey="audit_log_list" />
      </Card>
    </div>
  );
};
