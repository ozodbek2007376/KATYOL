import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuTrendingDown, LuPrinter, LuWallet } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { financeApi } from '../api/financeApi';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const FinanceDetailPage = () => {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExpenseDetails();
  }, [id]);

  const loadExpenseDetails = async () => {
    setIsLoading(true);
    const res = await financeApi.getExpenseById(id);
    if (res.success) setExpense(res.data);
    setIsLoading(false);
  };

  const handlePrintReceipt = () => {
    notifySuccess("Moliya operatsiyasi to'lov kvitansiyasi chop etishga yuborildi.");
  };

  if (isLoading || !expense) {
    return (
      <div className="finance-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const attachmentColumns = [
    { header: 'Hujjat / Chek Nomi', accessor: 'fileName' },
    { header: 'Hajmi', accessor: 'fileSize' },
    { header: 'Yuklangan Sana', accessor: 'uploadDate' },
    {
      header: 'Amal',
      cell: () => <button className="btn btn-sm btn-outline-primary py-0 px-2 fs-8">Yuklab Olish</button>,
    },
  ];

  const timelineItems = (expense.timeline || []).map((tl) => ({
    id: tl.id,
    title: tl.title,
    description: tl.description,
    timestamp: tl.timestamp,
    icon: 'bi-wallet2',
  }));

  return (
    <div className="finance-detail-page animate-fade-in pb-5">

      <PageHeader
        title={`Xarajat Hujjati №: ${expense.expenseNumber}`}
        subtitle={`Xarajat Turi: ${expense.expenseTypeName} — Summa: $${expense.amount.toLocaleString()}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Moliya', path: ROUTES.PROTECTED.FINANCE },
          { label: expense.expenseNumber },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2">
            <Link to="/finance/expenses" className="btn btn-outline-secondary btn-sm">
              <LuChevronLeft className="me-1" /> Ro'yxatga Qaytish
            </Link>

            <Button variant="outline-dark" size="sm" onClick={handlePrintReceipt}>
              <LuPrinter className="me-1" /> Kvitansiyani Chop Etish
            </Button>
          </div>
        }
      />

      <div className="row g-3">
        {/* Left Column: Overview Card */}
        <div className="col-12 col-lg-4">
          <Card className="p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-danger text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                <LuTrendingDown />
              </div>
              <div>
                <h6 className="fw-bold text-main mb-0 font-heading">{expense.expenseNumber}</h6>
                <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">Sana: {expense.date}</span>
              </div>
            </div>

            <div className="mb-3">
              <StatusBadge status={expense.status} />
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Xarajat Turi:</small>
                <strong className="text-main fs-6">{expense.expenseTypeName}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">Xarajat Summasi:</small>
                <strong className="text-danger fs-4 font-mono">{formatCurrency(expense.amount)}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">To'lov Usuli:</small>
                <strong className="text-main">{expense.paymentMethod}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">Mas'ul Xodim:</small>
                <span className="fw-bold text-primary">{expense.createdBy}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Description, Attachments & Timeline */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {/* Description */}
            <Card title="Xarajat Maqsadi va Izoh">
              <p className="fs-7 text-main mb-0">{expense.description || 'Izoh kiritilmagan.'}</p>
            </Card>

            {/* Attachments */}
            <Card title="To'lov Cheklari va Hujjatlar (Attachments)">
              <Table columns={attachmentColumns} data={expense.attachments || []} />
            </Card>

            {/* Audit Timeline */}
            <Card title="Xarajat Harakatlari Tarixi (Audit Timeline)">
              <Timeline items={timelineItems} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
