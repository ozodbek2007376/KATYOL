import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { branchesApi } from '../api/branchesApi';
import { LuTrendingUp, LuShoppingCart, LuSettings2, LuWarehouse } from 'react-icons/lu';

export const BranchesStatisticsPage = () => {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await branchesApi.getBranchStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load branch statistics", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Aggregated totals
  const totalRevenue = stats.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalSales = stats.reduce((acc, curr) => acc + curr.salesCount, 0);
  const totalProd = stats.reduce((acc, curr) => acc + curr.productionVolume, 0);
  const totalStock = stats.reduce((acc, curr) => acc + curr.stockVolume, 0);

  const statsCards = [
    {
      title: 'Umumiy Tushum (Filiallar)',
      value: `$${totalRevenue.toLocaleString()}`,
      description: 'Barcha filiallar bo\'yicha jami aylanma',
      icon: LuTrendingUp,
      color: 'primary'
    },
    {
      title: 'Umumiy Sotuvlar Soni',
      value: `${totalSales.toLocaleString()} ta`,
      description: 'Shakllantirilgan schyot-fakturalar soni',
      icon: LuShoppingCart,
      color: 'success'
    },
    {
      title: 'Ishlab Chiqarish',
      value: `${totalProd.toLocaleString()} dona`,
      description: 'Ishlab chiqarilgan kotyollar soni',
      icon: LuSettings2,
      color: 'info'
    },
    {
      title: 'Ombor Qoldiqlari',
      value: `${totalStock.toLocaleString()} dona`,
      description: 'Omborda mavjud xomashyo va mahsulotlar',
      icon: LuWarehouse,
      color: 'warning'
    }
  ];

  const columns = [
    { header: 'Filial Nomi', accessor: 'name' },
    { header: 'Filial Kodi', accessor: 'code' },
    {
      header: 'Tushum (Aylanma)',
      accessor: (row) => `$${row.revenue.toLocaleString()}`
    },
    {
      header: 'Sotuvlar Soni',
      accessor: (row) => `${row.salesCount} ta`
    },
    {
      header: 'Ishlab Chiqarish Hajmi',
      accessor: (row) => `${row.productionVolume} dona`
    },
    {
      header: 'Mavjud Zaxira',
      accessor: (row) => `${row.stockVolume.toLocaleString()} dona`
    }
  ];

  return (
    <div className="branches-stats-page animate-fade-in pb-5">
      <PageHeader
        title="Filiallar Solishtirma Statistikasi"
        subtitle="Filiallararo aylanma, ishlab chiqarish va ombor qoldiqlari tahlili"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sozlamalar', path: '/settings' },
          { label: 'Statistika' },
        ]}
      />

      {/* Analytics Summary Cards */}
      <div className="row g-3 mb-4">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 border-custom bg-body-custom shadow-sm transition-all hover-translate">
                <div className="card-body d-flex align-items-center justify-content-between p-3">
                  <div>
                    <span className="text-muted-custom fs-8 fw-semibold text-uppercase d-block mb-1">
                      {card.title}
                    </span>
                    <h3 className="fw-bold text-main mb-1">{card.value}</h3>
                    <small className="text-muted-custom fs-8">{card.description}</small>
                  </div>
                  <div className={`p-3 rounded-3 bg-${card.color} bg-opacity-10 text-${card.color}`}>
                    <Icon className="fs-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Card title="Filiallararo Ko'rsatkichlar Taqqoslami">
        <Table columns={columns} data={stats} loading={isLoading} />
      </Card>
    </div>
  );
};
