import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { LuTriangleAlert, LuPower } from 'react-icons/lu';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  onSoftDelete = null,
  title = "Amalni Tasdiqlang",
  message = "Haqiqatan ham ushbu amalni bajarmoqchimisiz?",
  isDanger = false,
  blockedReason = null,
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            {cancelText}
          </Button>

          {blockedReason ? (
            onSoftDelete && (
              <Button variant="warning" size="sm" onClick={onSoftDelete} icon={<LuPower />}>
                Nofaol Qilish
              </Button>
            )
          ) : (
            <Button
              variant={isDanger ? 'danger' : 'primary'}
              size="sm"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          )}
        </div>
      }
    >
      <div className="text-center py-2">
        <div
          className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 ${
            blockedReason
              ? 'bg-warning bg-opacity-10 text-warning'
              : isDanger
              ? 'bg-danger bg-opacity-10 text-danger'
              : 'bg-primary bg-opacity-10 text-primary'
          }`}
          style={{ width: '56px', height: '56px' }}
        >
          <LuTriangleAlert className="fs-3" />
        </div>

        {blockedReason ? (
          <div>
            <h6 className="fw-bold text-danger mb-2">O'chirish Taqiqlangan</h6>
            <div className="p-3 bg-warning bg-opacity-10 text-main rounded-3 fs-7 text-start mb-2 border border-warning border-opacity-25">
              {blockedReason}
            </div>
            <p className="fs-8 text-muted-custom mb-0">
              Ma'lumotlar butunligini saqlash uchun elementni o'chirish taqiqlanadi. Uni tizimda nofaol qilib qo'yishingiz mumkin.
            </p>
          </div>
        ) : (
          <p className="fs-7 text-main mb-0">{message}</p>
        )}
      </div>
    </Modal>
  );
};
