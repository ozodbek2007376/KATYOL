import React from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { LuTriangleAlert, LuArchive } from 'react-icons/lu';

export const MasterDataDeleteDialog = ({
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirmArchive,
  item = null,
  entityTitle = 'Element',
  canDeleteInfo = { allowed: true, reason: null },
}) => {
  if (!item) return null;

  const isBlocked = !canDeleteInfo.allowed;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBlocked ? "O'chirish Taqiqlangan" : `${entityTitle}ni O'chirishni Tasdiqlang`}
      size="md"
    >
      <div className="d-flex flex-column gap-3 py-2">
        {isBlocked ? (
          <div className="alert alert-warning border border-warning d-flex align-items-start gap-3 mb-0">
            <LuTriangleAlert className="fs-3 text-warning flex-shrink-0 mt-1" />
            <div>
              <h6 className="alert-heading fw-bold text-dark mb-1">
                "{item.name || item.code || entityTitle}" ma'lumoti o'chirilmaydi!
              </h6>
              <p className="fs-7 text-dark mb-2">{canDeleteInfo.reason}</p>
              <small className="text-muted d-block">
                Ma'lumotlar yaxlitligini saqlash uchun uni tizimdan o'chira olmaysiz. Buning o'rniga uni{' '}
                <strong>Arxivlash (Nofaol qilish)</strong> tavsiya etiladi.
              </small>
            </div>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-danger bg-opacity-10 text-danger">
              <LuTriangleAlert className="fs-2" />
            </div>
            <div>
              <h6 className="fw-bold mb-1">
                Haqiqatan ham "{item.name || item.code || entityTitle}"ni o'chirmoqchimisiz?
              </h6>
              <p className="fs-7 text-muted mb-0">
                Ushbu amalni ortga qaytarib bo'lmaydi. Ma'lumot ma'lumotlar bazasidan butunlay o'chiriladi.
              </p>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
          <button type="button" className="btn btn-light btn-sm" onClick={onClose}>
            Bekor qilish
          </button>
          {isBlocked ? (
            <button
              type="button"
              className="btn btn-warning btn-sm d-flex align-items-center gap-1"
              onClick={() => {
                onConfirmArchive(item.id || item.code);
                onClose();
              }}
            >
              <LuArchive /> <span>Arxivlash (Nofaol qilish)</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                onConfirmDelete(item.id || item.code);
                onClose();
              }}
            >
              Ha, o'chirish
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
