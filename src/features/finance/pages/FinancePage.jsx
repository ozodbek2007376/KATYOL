import React, { useState, useEffect } from 'react';
import { LuBadgeDollarSign, LuPlus, LuTrendingUp, LuTrendingDown, LuWallet, LuClock } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { FinanceCharts } from '../components/FinanceCharts';
import { financeApi } from '../api/financeApi';
import { formatCurrency } from '@/utils/currency.utils';
import { usePermission } from '@/hooks/usePermission';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';

export const FinancePage = () => {
  const { canCreate } = usePermission();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadFinanceOverview();
  }, []);

  const loadFinanceOverview = async () => {
    const [sumRes, trRes, catRes] = await Promise.all([
      financeApi.getFinanceSummary(),
      financeApi.getMonthlyTrends(),
      financeApi.getExpenseCategoriesBreakdown(),
    ]);

    if (sumRes.success) setSummary(sumRes.data);
    if (trRes.success) setTrends(trRes.data);
    if (catRes.success) setCategories(catRes.data);
  };

  usePageAutoRefresh(loadFinanceOverview, { intervalMs: 15000, isEditing: isModalOpen });

  if (!summary) {
    return (
      <div className="finance-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-page animate-fade-in pb-5">
      <PageHeader
        title="Moliya va G'azna Boshqaruvi"
        subtitle="Kompaniyaning operatsion daromadlari, xarajatlari, sof foyda va kutilayotgan tushumlar tahlili"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Moliya' },
        ]}
        actions={
          canCreate && (
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => setIsModalOpen(true)}>
              <LuPlus />
              <span>Yangi Xarajat Qayd Etish</span>
            </button>
          )
        }
      />

      {/* 6 Executive Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4 col-xl-2">
          <Card className="p-3 border-0 bg-success bg-opacity-10 shadow-sm h-100">
            <small className="text-success font-semibold d-block">Bugungi Daromad</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(summary.todayIncome)}</strong>
            <small className="text-muted-custom fs-8">Kirim kassa va bank</small>
          </Card>
        </div>

        <div className="col-12 col-md-4 col-xl-2">
          <Card className="p-3 border-0 bg-danger bg-opacity-10 shadow-sm h-100">
            <small className="text-danger font-semibold d-block">Bugungi Xarajat</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(summary.todayExpense)}</strong>
            <small className="text-muted-custom fs-8">Chiqim xarajatlar</small>
          </Card>
        </div>

        <div className="col-12 col-md-4 col-xl-2">
          <Card className="p-3 border-0 bg-primary bg-opacity-10 shadow-sm h-100">
            <small className="text-primary font-semibold d-block">Sof Foyda</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(summary.netProfit)}</strong>
            <small className="text-muted-custom fs-8">Daromad - Xarajat</small>
          </Card>
        </div>

        <div className="col-12 col-md-4 col-xl-2">
          <Card className="p-3 border-0 bg-info bg-opacity-10 shadow-sm h-100">
            <small className="text-info font-semibold d-block">Oylik Daromad</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(summary.monthlyIncome)}</strong>
            <small className="text-muted-custom fs-8">Shu oy jami</small>
          </Card>
        </div>

        <div className="col-12 col-md-4 col-xl-2">
          <Card className="p-3 border-0 bg-warning bg-opacity-10 shadow-sm h-100">
            <small className="text-warning text-dark font-semibold d-block">Oylik Xarajat</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(summary.monthlyExpense)}</strong>
            <small className="text-muted-custom fs-8">Shu oy jami</small>
          </Card>
        </div>

        <div className="col-12 col-md-4 col-xl-2">
          <Card className="p-3 border-0 bg-secondary bg-opacity-10 shadow-sm h-100">
            <small className="text-secondary font-semibold d-block">Kutilayotgan Tushum</small>
            <strong className="text-main fs-5 d-block mt-1">{formatCurrency(summary.pendingReceivables)}</strong>
            <small className="text-muted-custom fs-8">Mijozlar qarzi</small>
          </Card>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <FinanceCharts trends={trends} categories={categories} />

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadFinanceOverview}
      />
    </div>
  );
};
