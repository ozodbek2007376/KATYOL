import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuTrendingDown, LuLock } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { FinanceFilterBar } from '../components/FinanceFilterBar';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { financeApi } from '../api/financeApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { usePermission } from '@/hooks/usePermission';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const ExpensesPage = () => {
  const { canCreate, canEdit, canDelete, isReadOnly } = usePermission('finance');

  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const expenseTypes = dynamicSettingsService.getExpenseTypes();

  useEffect(() => {
    loadExpensesData();
  }, [search, expenseTypeFilter]);

  const loadExpensesData = async () => {
    const res = await financeApi.getExpenses({ search, expenseTypeId: expenseTypeFilter });
    if (res.success) setExpenses(res.data);
  };

  usePageAutoRefresh(loadExpensesData, { intervalMs: 15000, isEditing: isModalOpen || isConfirmOpen });

  const handleCreateOrUpdate = async (formData) => {
    if (editingExpense) {
      const res = await financeApi.updateExpense(editingExpense.id, formData);
      notifySuccess(res.message);
    } else {
      const res = await financeApi.createExpense(formData);
      notifySuccess(res.message);
    }
    setIsModalOpen(false);
    setEditingExpense(null);
    loadExpensesData();
  };

  const handleDelete = async () => {
    if (deletingExpense) {
      const res = await financeApi.deleteExpense(deletingExpense.id);
      notifySuccess(res.message);
      setIsConfirmOpen(false);
      setDeletingExpense(null);
      loadExpensesData();
    }
  };

  const columns = [
    {
      header: 'Xarajat №',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-3 bg-danger bg-opacity-10 text-danger p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <LuTrendingDown />
          </div>
          <div>
            <Link to={`${ROUTES.PROTECTED.FINANCE}/${row.id}`} className="fw-bold text-primary text-decoration-none fs-7">
              {row.expenseNumber}
            </Link>
            <small className="d-block text-muted-custom fs-8">Sana: {row.date}</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Xarajat Turi',
      cell: (row) => <strong className="text-main fs-7">{row.expenseTypeName}</strong>,
    },
    {
      header: 'Summa',
      cell: (row) => <strong className="text-danger font-mono font-semibold fs-7">{formatCurrency(row.amount)}</strong>,
    },
    {
      header: 'To\'lov Usuli',
      cell: (row) => <span className="text-main fs-7">{row.paymentMethod}</span>,
    },
    {
      header: 'Mas\'ul Xodim',
      cell: (row) => <span className="text-main fs-7">{row.createdBy}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={`${ROUTES.PROTECTED.FINANCE}/${row.id}`}
            className="btn btn-sm btn-outline-primary p-1 border-0"
            title="Tafsilotini ko'rish"
          >
            <LuEye />
          </Link>
          {canEdit && (
            <button
              className="btn btn-sm btn-outline-secondary p-1 border-0"
              onClick={() => {
                setEditingExpense(row);
                setIsModalOpen(true);
              }}
              title="Tahrirlash"
            >
              <LuPencil />
            </button>
          )}
          {canDelete && (
            <button
              className="btn btn-sm btn-outline-danger p-1 border-0"
              onClick={() => {
                setDeletingExpense(row);
                setIsConfirmOpen(true);
              }}
              title="O'chirish"
            >
              <LuTrash2 />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="expenses-page animate-fade-in pb-5">

      {isReadOnly && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3 py-2 px-3 fs-7 rounded-3">
          <LuLock className="fs-5" />
          <span>Sizda ushbu modulni faqat ko'rish huquqi mavjud. Tahrirlash va o'chirish amallari yashirilgan (Read-Only Mode).</span>
        </div>
      )}

      <PageHeader
        title="Operatsion Xarajatlar Reyestri"
        subtitle="Zavod, kommunal va maosh operatsion xarajatlarini ro'yxatga olish"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Moliya', path: ROUTES.PROTECTED.FINANCE },
          { label: 'Xarajatlar' },
        ]}
        actions={
          canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingExpense(null);
                setIsModalOpen(true);
              }}
            >
              <LuPlus className="me-1" /> Yangi Xarajat Kiritish
            </Button>
          )
        }
      />

      <FinanceFilterBar
        search={search}
        onSearchChange={setSearch}
        expenseTypeFilter={expenseTypeFilter}
        onExpenseTypeChange={setExpenseTypeFilter}
        expenseTypes={expenseTypes}
      />

      <Card title={`Xarajat Hujjatlari Reyestri (${expenses.length} ta)`}>
        <Table columns={columns} data={expenses} tableKey="expenses_list" />
      </Card>

      {canCreate && (
        <ExpenseFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
          }}
          onSubmit={handleCreateOrUpdate}
          expenseRecord={editingExpense}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Xarajat Hujjatini O'chirish"
          message={`Haqiqatan ham '${deletingExpense?.expenseNumber}' xarajat hujjati bekor qilinsinmi?`}
          isDanger={true}
          confirmText="O'chirish"
          cancelText="Orqaga"
        />
      )}
    </div>
  );
};
