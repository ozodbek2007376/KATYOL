import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { EmployeeFilterBar } from '../components/EmployeeFilterBar';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { employeesApi } from '../api/employeesApi';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/utils/currency.utils';
import { ERP_ICONS } from '@/shared/icons';
import { ROUTES } from '@/constants/routes.constants';

export const EmployeesPage = () => {
  const { user: currentUser } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [salaryTypes, setSalaryTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadEmployeesData();
  }, [search, positionFilter, statusFilter]);

  const loadEmployeesData = async () => {
    const [empRes, posRes, salRes] = await Promise.all([
      employeesApi.getEmployees({
        search,
        positionId: positionFilter,
        status: statusFilter,
      }),
      employeesApi.getPositions(),
      employeesApi.getSalaryTypes(),
    ]);

    if (empRes.success) setEmployees(empRes.data);
    if (posRes.success) setPositions(posRes.data);
    if (salRes.success) setSalaryTypes(salRes.data);
  };

  const handleCreateOrUpdateEmployee = async (formData) => {
    let res;
    if (editingEmployee) {
      res = await employeesApi.updateEmployee(editingEmployee.id, formData);
    } else {
      res = await employeesApi.createEmployee(formData);
    }
    notifySuccess(res.message);
    setIsModalOpen(false);
    setEditingEmployee(null);
    loadEmployeesData();
  };

  const handleArchiveClick = async (row) => {
    const res = await employeesApi.updateEmployee(row.id, { ...row, status: 'INACTIVE' });
    notifySuccess("Xodim arxivlandi.");
    loadEmployeesData();
  };

  const handleRestoreClick = async (row) => {
    const res = await employeesApi.updateEmployee(row.id, { ...row, status: 'ACTIVE' });
    notifySuccess("Xodim arxivdan chiqarildi.");
    loadEmployeesData();
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    const targetEmp = employees.find((e) => e.id === deletingId);

    const isSelfOrOwner =
      targetEmp?.id === currentUser?.id ||
      targetEmp?.isOwner ||
      targetEmp?.role === 'OWNER' ||
      (currentUser?.phone && targetEmp?.phone === currentUser?.phone);

    if (isSelfOrOwner) {
      notifyError("Tizim egasi (Owner) yoki joriy foydalanuvchini o'chirib bo'lmaydi!");
      setDeletingId(null);
      return;
    }

    const res = await employeesApi.deleteEmployee(deletingId);
    notifySuccess(res.message);
    setDeletingId(null);
    loadEmployeesData();
  };

  const columns = [
    {
      header: 'F.I.Sh.',
      cell: (row) => (
        <div>
          <Link
            to={`${ROUTES.PROTECTED.EMPLOYEES}/${row.id}`}
            className="fw-bold text-primary text-decoration-none fs-7"
          >
            {row.fullName}
          </Link>
          {row.isOwner && (
            <span className="badge bg-warning bg-opacity-20 text-warning ms-2 fs-8">Owner</span>
          )}
          {row.code && <small className="d-block text-muted-custom fs-8">Kod: {row.code}</small>}
        </div>
      ),
    },
    {
      header: 'Lavozim',
      cell: (row) => (
        <span className="fw-semibold text-main fs-7">
          {row.positionName || '-'}
        </span>
      ),
    },
    { header: 'Telefon', accessor: 'phone' },
    {
      header: 'Oylik Turi',
      cell: (row) => (
        <div>
          <span>{row.salaryTypeName || '-'}</span>
          <small className="d-block font-mono text-muted-custom fs-8">
            Stavka: {formatCurrency(row.salaryAmount)}
          </small>
        </div>
      ),
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Amal',
      cell: (row) => {
        const isSelfOrOwner =
          row.id === currentUser?.id ||
          row.isOwner ||
          row.role === 'OWNER' ||
          (currentUser?.phone && row.phone === currentUser?.phone);

        return (
          <div className="d-flex align-items-center gap-1">
            <Link
              to={`${ROUTES.PROTECTED.EMPLOYEES}/${row.id}`}
              className="btn btn-sm btn-outline-primary p-1 border-0"
              title="Tafsilot"
            >
              <i className={`bi ${ERP_ICONS.EYE}`}></i>
            </Link>
            <button
              className="btn btn-sm btn-outline-warning p-1 border-0"
              onClick={() => handleEditClick(row)}
              title="Tahrirlash"
            >
              <i className={`bi ${ERP_ICONS.EDIT}`}></i>
            </button>
            {row.status === 'INACTIVE' ? (
              <button
                className="btn btn-sm btn-outline-success p-1 border-0"
                onClick={() => handleRestoreClick(row)}
                title="Arxivdan chiqarish"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            ) : (
              <button
                className="btn btn-sm btn-outline-warning p-1 border-0"
                onClick={() => handleArchiveClick(row)}
                disabled={isSelfOrOwner}
                title={isSelfOrOwner ? "O'zingizni arxivlay olmaysiz" : "Arxivlash"}
                style={{ opacity: isSelfOrOwner ? 0.4 : 1 }}
              >
                <i className="bi bi-archive"></i>
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-danger p-1 border-0"
              onClick={() => setDeletingId(row.id)}
              disabled={isSelfOrOwner}
              title={
                isSelfOrOwner
                  ? "Tizim egasi (Owner) yoki joriy foydalanuvchini o'chirib bo'lmaydi!"
                  : "O'chirish"
              }
              style={{ opacity: isSelfOrOwner ? 0.4 : 1, cursor: isSelfOrOwner ? 'not-allowed' : 'pointer' }}
            >
              <i className={`bi ${ERP_ICONS.TRASH}`}></i>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="employees-page animate-fade-in pb-5">
      <PageHeader
        title="Xodimlar Ro'yxati va Kadrlar Hisobi"
        subtitle="Korxona barcha xodimlari, lavozimlar va ish stavkalari katalogi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Xodimlar' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={ERP_ICONS.PLUS}
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
          >
            Yangi Xodim Qo'shish
          </Button>
        }
      />

      <EmployeeFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        positionFilter={positionFilter}
        onPositionChange={setPositionFilter}
        positions={positions}
      />

      <Card title={`Xodimlar Reyestri (${employees.length} nafar)`}>
        <Table columns={columns} data={employees} />
      </Card>

      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateEmployee}
        employee={editingEmployee}
        positions={positions}
        salaryTypes={salaryTypes}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xodimlarni O'chirish"
        message="Haqiqatan ham ushbu xodimlarni tizimdan o'chirib tashlamoqchimisiz?"
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
};
