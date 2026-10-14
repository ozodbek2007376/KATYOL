import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuTrendingUp } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { financeApi } from '../api/financeApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { ROUTES } from '@/constants/routes.constants';

export const IncomesPage = () => {
  const [incomes, setIncomes] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadIncomesData();
  }, [search]);

  const loadIncomesData = async () => {
    const res = await financeApi.getIncomes({ search });
    if (res.success) setIncomes(res.data);
  };

  usePageAutoRefresh(loadIncomesData, { intervalMs: 15000 });

  const columns = [
    {
      header: 'Daromad №',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-3 bg-success bg-opacity-10 text-success p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <LuTrendingUp />
          </div>
          <div>
            <strong className="fw-bold text-primary fs-7">{row.incomeNumber}</strong>
            <small className="d-block text-muted-custom fs-8">Sana: {row.date}</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Daromad Manbai',
      cell: (row) => <strong className="text-main fs-7">{row.source}</strong>,
    },
    {
      header: 'Mijoz Korxona',
      cell: (row) => <span className="text-main fs-7">{row.customerName}</span>,
    },
    {
      header: 'To\'langan Summa',
      cell: (row) => <strong className="text-success font-mono font-semibold fs-7">+${row.amount.toLocaleString()} ({row.currency})</strong>,
    },
    {
      header: 'To\'lov Usuli',
      cell: (row) => <span className="text-main fs-7">{row.paymentMethod}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="incomes-page animate-fade-in pb-5">

      <PageHeader
        title="Moliya Daromadlari va Tushumlar Reyestri"
        subtitle="Sotuvlar, servis to'lovlari hamda boshqa manbalardan tushgan moliya tushumlari"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Moliya', path: ROUTES.PROTECTED.FINANCE },
          { label: 'Daromadlar' },
        ]}
      />

      <div className="card border-custom bg-body-custom rounded-3 p-3 mb-4 shadow-sm">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <SearchInput
              placeholder="Daromad №, manba yoki mijoz bo'yicha qidiruv..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card title={`Daromad Tushumlari Reyestri (${incomes.length} ta)`}>
        <Table columns={columns} data={incomes} tableKey="incomes_list" />
      </Card>
    </div>
  );
};
