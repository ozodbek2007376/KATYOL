import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { ROUTES } from '@/constants/routes.constants';
import {
  LuGripVertical,
  LuEye,
  LuUsers,
  LuClock,
  LuChevronDown,
  LuChevronRight,
  LuArrowRight,
  LuCircleCheck,
  LuDollarSign,
  LuSettings,
  LuPencil,
  LuTrash2,
  LuPlus,
  LuTriangleAlert,
  LuInfo,
} from 'react-icons/lu';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { productionApi } from '@/features/production/api/productionApi';
import { financeApi } from '@/features/finance/api/financeApi';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { formatCurrency } from '@/utils/currency.utils';
import { notifySuccess, notifyError } from '@/services/notification.service';

export const ProductionKanbanBoard = ({
  orders = [],
  stages = [],
  employees = [],
  onCardClick,
  onStageChange,
  onStagesUpdated,
}) => {
  const [collapsedColumns, setCollapsedColumns] = useState({});
  const [draggedOrderId, setDraggedOrderId] = useState(null);

  // Confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [stageToDeleteId, setStageToDeleteId] = useState(null);

  // Column management state
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageCode, setNewStageCode] = useState('');
  const [newStagePrice, setNewStagePrice] = useState('150000');

  const [activeDropdownColId, setActiveDropdownColId] = useState(null);
  const [editingStageId, setEditingStageId] = useState(null);
  const [editingStageName, setEditingStageName] = useState('');
  const [editingStageCode, setEditingStageCode] = useState('');

  const handleCreateStage = async () => {
    if (!newStageName.trim()) return;
    const code = newStageCode.trim() || newStageName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const newStage = {
      name: newStageName.trim(),
      code,
      stageOrder: stages.length + 1,
      defaultPrice: parseFloat(newStagePrice) || 150000,
    };
    await settingsApi.createProductionStage(newStage);
    setIsAddingStage(false);
    setNewStageName('');
    setNewStageCode('');
    setNewStagePrice('150000');
    if (onStagesUpdated) onStagesUpdated();
  };

  const handleSaveStageName = async (stageId) => {
    if (!editingStageName.trim()) return;
    const targetStage = stages.find((s) => s.id === stageId);
    if (!targetStage) return;
    await settingsApi.updateProductionStage(stageId, {
      name: editingStageName.trim(),
      code: targetStage.code,
      stageOrder: targetStage.stageOrder,
      defaultPrice: targetStage.defaultPrice || 150000,
    });
    setEditingStageId(null);
    if (onStagesUpdated) onStagesUpdated();
  };

  const handleDeleteStage = (stageId) => {
    setStageToDeleteId(stageId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteStage = async () => {
    if (!stageToDeleteId) return;
    await settingsApi.deleteProductionStage(stageToDeleteId);
    setIsDeleteConfirmOpen(false);
    setStageToDeleteId(null);
    if (onStagesUpdated) onStagesUpdated();
  };

  const toggleColumnCollapse = (colCode) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [colCode]: !prev[colCode],
    }));
  };

  const handleDragStart = (e, orderId) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('text/plain', orderId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleStageCompletionSalaryCredit = async (targetOrder, targetStageCode) => {
    const isLastStage = stages.length > 0 && (stages[stages.length - 1].code === targetStageCode || targetStageCode === 'COMPLETED');
    if (isLastStage) {
      const empName = targetOrder.assignedEmployees?.[0] || 'Usta (Ishchi)';
      const stageObj = stages.find((s) => s.code === targetStageCode) || stages[stages.length - 1];
      const stageRate = Number(targetOrder.stagePrice) || (stageObj?.defaultPrice ? Number(stageObj.defaultPrice) : 0);
      const salaryAmount = (targetOrder.quantity || 1) * stageRate;

      try {
        await financeApi.createExpense({
          expenseNumber: `SAL-KANBAN-${Date.now().toString().slice(-6)}`,
          expenseTypeId: 'salary',
          amount: salaryAmount,
          currency: 'USD',
          date: new Date().toISOString().split('T')[0],
          description: `Ish haqi (Kanban bosqichi bajarildi): ${empName} — Topshiriq: ${targetOrder.title || targetOrder.productionNumber}`,
        });
        notifySuccess(
          `'${targetOrder.title || targetOrder.productionNumber}' yakunlandi! Xodim (${empName}) hisobiga ${formatCurrency(salaryAmount)} ish haqi avtomatik qo'shildi!`
        );
      } catch (_err) {
        // Silently handle salary transaction creation
      }
    }
  };

  const handleDrop = (e, targetStageCode) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (!orderId) return;

    const targetOrder = orders.find((o) => o.id === orderId || o.productionNumber === orderId);
    if (targetOrder && targetOrder.status !== targetStageCode) {
      if (!targetOrder.assignedEmployees || targetOrder.assignedEmployees.length === 0) {
        notifyError("Topshiriqni boshqa bosqichga o'tkazishdan oldin XODIM biriktirilishi MAJBURIY!");
        return;
      }

      if (onStageChange) {
        onStageChange(orderId, targetStageCode);
      }

      handleStageCompletionSalaryCredit(targetOrder, targetStageCode);
    }
    setDraggedOrderId(null);
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
      {stages.length === 0 && (
        <div className="alert alert-info border-info d-flex align-items-center gap-2 mb-3 fs-7">
          <LuInfo className="fs-5 text-info flex-shrink-0" />
          <span>Hali ishlab chiqarish bosqichlari (ustunlari) kiritilmagan. O'ng tarafdagi <strong>"Yangi Bosqich Qo'shish"</strong> tugmasi orqali yangi bosqich qo'shishingiz mumkin!</span>
        </div>
      )}
      <div className="d-flex gap-3 pb-4 align-items-start" style={{ minWidth: 'max-content' }}>
        {stages.map((col, idx) => {
          const colOrders = orders.filter((o) => o.status === col.code || o.stage === col.code);
          const isCollapsed = !!collapsedColumns[col.code];
          const totalUnits = colOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
          const isFinalStage = idx === stages.length - 1 || col.code === 'COMPLETED';

          return (
            <div
              key={col.code}
              style={{ width: isCollapsed ? '72px' : '360px', minWidth: isCollapsed ? '72px' : '360px' }}
              className="transition-all"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.code)}
            >
              <div
                className={`card h-100 border-custom bg-body-custom rounded-3 shadow-sm ${
                  isFinalStage ? 'border-success border-opacity-50' : ''
                }`}
              >
                {/* Column Header */}
                <div
                  className={`card-header border-bottom border-custom p-3 d-flex align-items-center justify-content-between cursor-pointer ${
                    isFinalStage ? 'bg-success bg-opacity-10' : 'bg-surface'
                  }`}
                  onClick={() => toggleColumnCollapse(col.code)}
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1 me-2">
                    <span className="text-muted-custom fs-7">
                      {isCollapsed ? <LuChevronRight /> : <LuChevronDown />}
                    </span>
                    {!isCollapsed && (
                      <div className="text-truncate flex-grow-1">
                        {editingStageId === col.id ? (
                          <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              className="form-control form-control-sm py-0 px-1 fs-7 fw-bold text-start text-main"
                              value={editingStageName}
                              onChange={(e) => setEditingStageName(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveStageName(col.id);
                                if (e.key === 'Escape') setEditingStageId(null);
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-success p-1 py-0 fs-8"
                              onClick={() => handleSaveStageName(col.id)}
                            >
                              </button>
                          </div>
                        ) : (
                          <span className="fw-bold fs-7 font-heading text-main d-block text-truncate">
                            {col.name} {isFinalStage && <span className="badge bg-success ms-1 fs-9">Maosh Balansga Qo'shiladi</span>}
                          </span>
                        )}
                        <small className="text-muted-custom fs-8">Yuklama: {totalUnits} dona</small>
                      </div>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`badge border-custom rounded-pill fs-8 fw-semibold px-2 ${
                        isFinalStage ? 'bg-success text-white' : 'bg-primary bg-opacity-10 text-primary'
                      }`}
                    >
                      {colOrders.length}
                    </span>
                    {!isCollapsed && (
                      <div className="dropdown position-relative">
                        <button
                          className="btn btn-sm btn-outline-secondary p-1 border-0 dropdown-toggle no-caret"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownColId(activeDropdownColId === col.id ? null : col.id);
                          }}
                        >
                          <LuSettings size={14} />
                        </button>
                        {activeDropdownColId === col.id && (
                          <ul className="dropdown-menu show position-absolute end-0 mt-1 py-1 shadow-lg border-custom fs-8 bg-surface z-3" style={{ display: 'block', minWidth: '120px' }}>
                            <li>
                              <button
                                className="dropdown-item py-1 px-3 d-flex align-items-center gap-2 text-main"
                                type="button"
                                onClick={() => {
                                  setEditingStageId(col.id);
                                  setEditingStageName(col.name);
                                  setEditingStageCode(col.code);
                                  setActiveDropdownColId(null);
                                }}
                              >
                                <LuPencil size={12} className="text-primary" /> Tahrirlash
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item py-1 px-3 d-flex align-items-center gap-2 text-danger"
                                type="button"
                                onClick={() => handleDeleteStage(col.id)}
                              >
                                <LuTrash2 size={12} /> O'chirish
                              </button>
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column Body */}
                {!isCollapsed && (
                  <div className="card-body p-2 d-flex flex-column gap-3 min-vh-50 overflow-y-auto">
                    {colOrders.length === 0 ? (
                      <div className="text-center py-4 text-muted-custom fs-8 border border-dashed rounded-3 border-custom">
                        Topshiriqlar mavjud emas
                      </div>
                    ) : (
                      colOrders.map((order) => (
                        <KanbanCard
                          key={order.id}
                          order={order}
                          onClick={() => onCardClick && onCardClick(order)}
                          onDragStart={(e) => handleDragStart(e, order.id)}
                          stages={stages}
                          employees={employees}
                          onStagesUpdated={onStagesUpdated}
                          onMoveStage={(newStage) => {
                            if (onStageChange) onStageChange(order.id, newStage);
                            handleStageCompletionSalaryCredit(order, newStage);
                          }}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add New Stage Column */}
        <div style={{ width: '360px', minWidth: '360px' }} className="p-2">
          {isAddingStage ? (
            <div className="card p-3 border-custom bg-surface rounded-3 shadow-sm">
              <h6 className="fs-7 fw-bold text-main mb-3">Yangi Ish Bosqichi</h6>
              <div className="mb-2 text-start">
                <label className="form-label fs-8 fw-medium text-main mb-1">Bosqich Nomi</label>
                <input
                  type="text"
                  className="form-control form-control-sm text-start"
                  placeholder="Masalan, Bo'yash va Qadoqlash"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="mb-2 text-start">
                <label className="form-label fs-8 fw-medium text-main mb-1">Ish Haqi Tarifi (dona uchun UZS)</label>
                <input
                  type="number"
                  className="form-control form-control-sm text-start"
                  placeholder="150000"
                  value={newStagePrice}
                  onChange={(e) => setNewStagePrice(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={handleCreateStage}
                >
                  Qo'shish
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setIsAddingStage(false)}
                >
                  Bekor
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-outline-primary border-dashed w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 fs-7 fw-semibold"
              onClick={() => {
                setIsAddingStage(true);
                setNewStageName('');
                setNewStageCode('');
                setNewStagePrice('150000');
              }}
            >
              <LuPlus /> Yangi Bosqich Qo'shish
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setStageToDeleteId(null);
        }}
        onConfirm={handleConfirmDeleteStage}
        title="Kanban Ustunini O'chirish"
        message="Haqiqatan ham ushbu ishlab chiqarish bosqichini o'chirmoqchimisiz? Bu bosqichdagi barcha topshiriqlar avvalgi bosqichga qaytadi."
        isDanger={true}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
};

const KanbanCard = ({ order, onClick, onDragStart, stages = [], onMoveStage, employees = [], onStagesUpdated }) => {
  const currentStageIndex = stages.findIndex((s) => s.code === order.status || s.code === order.stage);
  const nextStage = stages[currentStageIndex + 1];
  const hasAssignedEmployee = order.assignedEmployees && order.assignedEmployees.length > 0 && order.assignedEmployees[0] !== '';

  return (
    <div
      className={`card border-custom rounded-3 p-3 bg-surface shadow-sm cursor-pointer position-relative hover-shadow ${
        !hasAssignedEmployee ? 'border-warning border-opacity-75' : ''
      }`}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{ cursor: 'pointer', minWidth: '0' }}
    >
      {/* Top Header: Batch Number & Quick Stage Move Arrow */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
        <div className="d-flex align-items-center gap-1 min-w-0">
          <LuGripVertical className="text-muted-custom fs-6 flex-shrink-0" />
          <span className="fw-bold text-primary fs-7 text-nowrap">{order.productionNumber}</span>
        </div>

        {nextStage && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary py-1 px-2 fs-8 text-nowrap d-flex align-items-center gap-1 flex-shrink-0"
            title={`Keyingi bosqich: ${nextStage.name}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!hasAssignedEmployee) {
                notifyError("Xodim biriktirish MAJBURIY! Avval card ustiga bosib xodim tanlang.");
                return;
              }
              if (onMoveStage) onMoveStage(nextStage.code);
            }}
          >
            <span>{nextStage.name}</span>
            <LuArrowRight className="flex-shrink-0" />
          </button>
        )}
      </div>

      {/* 1. Title */}
      <h6 className="fw-bold text-main fs-7 mb-2 lh-sm text-break">
        {order.title || order.boilerModelName || "Ishlab chiqarish topshirig'i"}
      </h6>

      {/* 2. Izoh / Notes */}
      <p className="text-muted-custom fs-8 mb-3 lh-sm text-break">
        {order.notes || order.customerName || "Izoh va instruksiya kiritilmagan"}
      </p>

      {/* Footer: Assigned Employee Badge & Click hint */}
      <div className="d-flex align-items-center justify-content-between pt-2 border-top border-custom fs-8 gap-2">
        <div className="d-flex align-items-center gap-1 min-w-0 flex-grow-1">
          <LuUsers className={hasAssignedEmployee ? "text-success flex-shrink-0" : "text-warning flex-shrink-0"} />
          <span className={`text-truncate ${hasAssignedEmployee ? "text-main fw-medium" : "text-danger fw-bold"}`}>
            {hasAssignedEmployee ? order.assignedEmployees[0] : "Xodim biriktirilmagan"}
          </span>
        </div>

        <span className="text-primary fs-9 fw-semibold text-nowrap flex-shrink-0">
          Batafsil </span>
      </div>
    </div>
  );
};
