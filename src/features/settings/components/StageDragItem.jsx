import { formatCurrency } from '@/utils/currency.utils';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';

export const StageDragItem = ({ stage, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`d-flex align-items-center justify-content-between p-3 mb-2 rounded-3 border-custom bg-card-custom shadow-sm ${
        isDragging ? 'border-primary' : ''
      }`}
    >
      <div className="d-flex align-items-center gap-3">
        <div {...attributes} {...listeners} className="text-muted-custom p-1" title="Tortib tartibni o'zgartirish">
          <i className="bi bi-grip-vertical fs-5"></i>
        </div>
        <div
          className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-7"
          style={{ width: '32px', height: '32px', backgroundColor: stage.color || 'var(--erp-primary)' }}
        >
          {index + 1}
        </div>
        <div>
          <h6 className="fw-semibold text-main mb-0">{stage.stageName}</h6>
          <small className="text-muted-custom fs-8">{stage.description}</small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-4">
        <div className="text-end">
          <span className="fs-8 text-muted-custom d-block">Me'yor Narxi:</span>
          <span className="fw-bold text-main fs-7">{formatCurrency(stage.defaultPrice)}</span>
        </div>
        <StatusBadge status={stage.status} />
      </div>
    </div>
  );
};
