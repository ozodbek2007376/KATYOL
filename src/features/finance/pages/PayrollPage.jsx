import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { FinanceSubNav } from '../components/FinanceSubNav';
import { financeApi } from '../api/financeApi';
import { employeesApi } from '@/features/employees/api/employeesApi';
import { formatCurrency, getActiveCurrency } from '@/utils/currency.utils';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { LuDollarSign, LuUserCheck, LuArrowUpRight, LuWallet, LuCircleCheck, LuCreditCard, LuUsers } from 'react-icons/lu';

export const PayrollPage = () => {
  const currency = getActiveCurrency();
  const [employeesPayroll, setEmployeesPayroll] = useState([]);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });
  const [search, setSearch] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payMode, setPayMode] = useState('SUGGESTED'); // 'SUGGESTED' or 'CUSTOM'
  const [customPayAmount, setCustomPayAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPayrollData();
  }, [search]);

  const loadPayrollData = async () => {
    try {
      // 1. Fetch live employees list
      const empRes = await employeesApi.getEmployees();
      const empList = empRes.success && Array.isArray(empRes.data) ? empRes.data : [];

      // 2. Fetch live expenses list to map salary payout history
      const expRes = await financeApi.getExpenses();
      const expenseList = expRes.success && Array.isArray(expRes.data) ? expRes.data : [];

      let grandEarned = 0;
      let grandPaid = 0;

      const payrollList = empList.map((emp) => {
        // Base monthly salary amount from DB
        const monthlySalary = Number(emp.salaryAmount) || 0;
        const earnedAmount = monthlySalary;

        // Calculate total salary paid out to this employee dynamically from backend transactions
        const empSalaryPaid = expenseList
          .filter((exp) => 
            (exp.expenseTypeId === 'salary' || exp.expenseTypeName?.toLowerCase().includes('ish haqi')) &&
            (exp.description?.toLowerCase().includes(emp.fullName?.toLowerCase()) || exp.description?.includes(emp.id))
          )
          .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

        const remainingAmount = Math.max(0, earnedAmount - empSalaryPaid);

        grandEarned += earnedAmount;
        grandPaid += empSalaryPaid;

        return {
          id: emp.id,
          fullName: emp.fullName,
          phone: emp.phone,
          positionName: emp.positionName || emp.roleName || 'Xodim',
          department: emp.department || 'Boshqaruv',
          earnedAmount,
          paidAmount: empSalaryPaid,
          remainingAmount,
          role: emp.role,
        };
      });

      let filteredList = payrollList;
      if (search) {
        const q = search.toLowerCase();
        filteredList = filteredList.filter(
          (item) =>
            item.fullName.toLowerCase().includes(q) ||
            item.positionName.toLowerCase().includes(q) ||
            item.phone.toLowerCase().includes(q)
        );
      }

      setEmployeesPayroll(filteredList);
      setSummary({
        totalEarned: grandEarned,
        totalPaid: grandPaid,
        totalRemaining: Math.max(0, grandEarned - grandPaid),
      });
    } catch (err) {
      console.error("loadPayrollData error:", err);
    }
  };

  usePageAutoRefresh(loadPayrollData, { intervalMs: 15000, isEditing: isPayModalOpen });

  const handleOpenPayModal = (employee) => {
    setSelectedEmployee(employee);
    setPayMode('SUGGESTED');
    setCustomPayAmount(employee.remainingAmount > 0 ? employee.remainingAmount.toString() : '0');
    setPaymentNotes(`Ish haqi to'lovi: ${employee.fullName} — ${new Date().toISOString().split('T')[0]}`);
    setIsPayModalOpen(true);
  };

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    let finalAmount = 0;
    if (payMode === 'SUGGESTED') {
      finalAmount = selectedEmployee.remainingAmount;
    } else {
      finalAmount = parseFloat(customPayAmount) || 0;
    }

    if (finalAmount <= 0) {
      notifyError("To'lanadigan ish haqi summasi 0 dan katta bo'lishi shart!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await financeApi.createExpense({
        expenseNumber: `SAL-${Date.now().toString().slice(-6)}`,
        expenseTypeId: 'salary',
        amount: finalAmount,
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        description: `Ish haqi to'lovi: ${selectedEmployee.fullName} (ID: ${selectedEmployee.id}) — ${paymentNotes}`,
      });

      if (res.success) {
        notifySuccess(`${selectedEmployee.fullName} uchun ${formatCurrency(finalAmount)} ish haqi to'landi va moliya balansidan yechildi!`);
        setIsPayModalOpen(false);
        loadPayrollData();
      } else {
        notifyError(res.message || "To'lovni amalga oshirishda xatolik.");
      }
    } catch (err) {
      notifyError("Ish haqi to'lovini saqlashda kutilmagan xatolik.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Xodim va Bo\'lim',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <LuUsers className="fs-5" />
          </div>
          <div>
            <strong className="text-main fs-7 d-block">{row.fullName}</strong>
            <small className="text-muted-custom fs-8">{row.positionName} ({row.department})</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Telefon',
      cell: (row) => <span className="text-main fs-7">{row.phone || '-'}</span>,
    },
    {
      header: 'Hisoblangan Pul (Puli bor)',
      cell: (row) => (
        <strong className="text-dark fs-7">
          {formatCurrency(row.earnedAmount)}
        </strong>
      ),
    },
    {
      header: 'To\'langan Summa',
      cell: (row) => (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 fs-8 fw-bold">
          {formatCurrency(row.paidAmount)}
        </span>
      ),
    },
    {
      header: 'Qolgan Qarzdorlik Balansi',
      cell: (row) => (
        <strong className={row.remainingAmount > 0 ? "text-danger fs-7" : "text-success fs-7"}>
          {formatCurrency(row.remainingAmount)}
        </strong>
      ),
    },
    {
      header: 'Amallar',
      cell: (row) => (
        <Button
          variant={row.remainingAmount > 0 ? "primary" : "outline-secondary"}
          size="sm"
          icon={<LuCreditCard />}
          onClick={() => handleOpenPayModal(row)}
        >
          Ish Haqi To'lash
        </Button>
      ),
    },
  ];

  return (
    <div className="payroll-page animate-fade-in pb-5">
      <FinanceSubNav />

      <PageHeader
        title="Xodimlar Ish Haqi va Maosh Boshqaruvi"
        subtitle="Har bir xodimlarning pul balansi, to'langan summasi va maosh to'lash reestri"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Moliya', path: '/finance' },
          { label: 'Ish Haqi' },
        ]}
      />

      {/* Metric Cards Summary */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <Card className="p-3 bg-primary bg-opacity-10 border-primary border-opacity-25">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-primary d-block fw-semibold mb-1">Total Jami Hisoblangan Ish Haqi:</small>
                <h4 className="fw-bold text-primary mb-0 font-monospace">{formatCurrency(summary.totalEarned)}</h4>
              </div>
              <div className="p-3 bg-primary text-white rounded-3">
                <LuWallet className="fs-4" />
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 col-md-4">
          <Card className="p-3 bg-success bg-opacity-10 border-success border-opacity-25">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-success d-block fw-semibold mb-1">Total Xodimlarga To'langan Summa:</small>
                <h4 className="fw-bold text-success mb-0 font-monospace">{formatCurrency(summary.totalPaid)}</h4>
              </div>
              <div className="p-3 bg-success text-white rounded-3">
                <LuCircleCheck className="fs-4" />
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 col-md-4">
          <Card className="p-3 bg-danger bg-opacity-10 border-danger border-opacity-25">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-danger d-block fw-semibold mb-1">Total Qolgan Qarzdorlik Balansi:</small>
                <h4 className="fw-bold text-danger mb-0 font-monospace">{formatCurrency(summary.totalRemaining)}</h4>
              </div>
              <div className="p-3 bg-danger text-white rounded-3">
                <LuArrowUpRight className="fs-4" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Xodimlarni F.I.SH yoki bo'lim bo'yicha qidirish...",
        }}
      />

      {/* Payroll Table */}
      <Card title={`Xodimlar Ish Haqi Ro'yxati (${employeesPayroll.length} ta xodim)`}>
        <Table columns={columns} data={employeesPayroll} tableKey="payroll_employees_list" />
      </Card>

      {/* Salary Payout Modal (2 Modes: Suggested Amount & Custom Input) */}
      {selectedEmployee && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title={`Ish Haqi To'lash: ${selectedEmployee.fullName}`}
          size="md"
          footer={
            <div className="d-flex justify-content-end gap-2 w-100">
              <Button variant="outline-secondary" size="sm" onClick={() => setIsPayModalOpen(false)}>
                Bekor Qilish
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecutePayment} loading={isSubmitting}>
                To'lovni Amalga Oshirish
              </Button>
            </div>
          }
        >
          <form onSubmit={handleExecutePayment}>
            {/* Employee Info Header */}
            <div className="p-3 bg-light rounded border mb-3">
              <div className="row g-2 small">
                <div className="col-6"><span className="text-muted">Xodim:</span> <strong className="text-dark">{selectedEmployee.fullName}</strong></div>
                <div className="col-6"><span className="text-muted">Lavozim:</span> <span>{selectedEmployee.positionName}</span></div>
                <div className="col-6"><span className="text-muted">Hisoblangan Maosh:</span> <strong>{formatCurrency(selectedEmployee.earnedAmount)}</strong></div>
                <div className="col-6"><span className="text-muted">To'langan:</span> <span className="text-success fw-bold">{formatCurrency(selectedEmployee.paidAmount)}</span></div>
                <div className="col-12 mt-1 border-top pt-1">
                  <span className="text-muted">Qolgan Qarzdorlik:</span> <strong className="text-danger fs-6 ms-1">{formatCurrency(selectedEmployee.remainingAmount)}</strong>
                </div>
              </div>
            </div>

            {/* Mode Selector for Amount: 2 Options as requested by user */}
            <div className="mb-3">
              <label className="form-label fs-7 fw-bold text-dark mb-2">To'lov Summasini Tanlang:</label>
              
              <div className="row g-2 mb-3">
                {/* Option 1: Suggested Full Remaining Balance */}
                <div className="col-6">
                  <button
                    type="button"
                    className={`btn w-100 p-2 text-start border ${payMode === 'SUGGESTED' ? 'btn-primary text-white border-primary' : 'btn-light text-dark border-secondary'}`}
                    onClick={() => setPayMode('SUGGESTED')}
                  >
                    <div className="fs-9 opacity-75">1-Rejim: Belgilangan Summa</div>
                    <div className="fw-bold fs-7">{formatCurrency(selectedEmployee.remainingAmount)}</div>
                    <div className="fs-9 opacity-90">Tugmani bosib 100% to'lash</div>
                  </button>
                </div>

                {/* Option 2: Custom Free Input */}
                <div className="col-6">
                  <button
                    type="button"
                    className={`btn w-100 p-2 text-start border ${payMode === 'CUSTOM' ? 'btn-primary text-white border-primary' : 'btn-light text-dark border-secondary'}`}
                    onClick={() => setPayMode('CUSTOM')}
                  >
                    <div className="fs-9 opacity-75">2-Rejim: Boshqa Summa</div>
                    <div className="fw-bold fs-7">Erkin Summa Kiritish</div>
                    <div className="fs-9 opacity-90">1 ta input orqali narx yozish</div>
                  </button>
                </div>
              </div>

              {/* Input field for Custom Amount mode */}
              {payMode === 'CUSTOM' ? (
                <Input
                  label="To'lanadigan Summa ($)"
                  type="number"
                  placeholder="Masalan: 1500"
                  value={customPayAmount}
                  onChange={(e) => setCustomPayAmount(e.target.value)}
                  required
                />
              ) : (
                <div className="p-2 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded text-primary fs-8">
                  <strong>Belgilangan To'lov Summasi:</strong> {formatCurrency(selectedEmployee.remainingAmount)} (Moliya balansidan yechiladi)
                </div>
              )}
            </div>

            <Input
              label="To'lov Izohi / Eslatma"
              placeholder="Masalan: Avgust oyi ish haqi bo'nak to'lovi"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
