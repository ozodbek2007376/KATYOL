import React from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { LuArchive, LuRotateCcw } from 'react-icons/lu';

export const MasterDataArchiveDialog = ({
  isOpen,
  onClose,
  onConfirm,
  item = null,
  entityTitle = 'Element',
  actionType = 'ARCHIVE', // 'ARCHIVE' or 'RESTORE'
}) => {
  if (!item) return null;

  const isArchive = actionType === 'ARCHIVE';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isArchive ? `${entityTitle}ni Arxivlash` : `${entityTitle}ni Qayta Tiklash`}
      size="md"
    >
      <div className="d-flex flex-column gap-3 py-2">
        <div className="d-flex align-items-center gap-3">
          <div
            className={`p-3 rounded-circle ${
              isArchive ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'
            }`}
          >
            {isArchive ? <LuArchive className="fs-2" /> : <LuRotateCcw className="fs-2" />}
          </div>
          <div>
            <h6 className="fw-bold mb-1">
              {isArchive
                ? `Haqiqatan ham "${item.name || item.code || entityTitle}"ni arxivlamoqchimisiz?`
                : `"${item.name || item.code || entityTitle}"ni qayta aktiv holatga o'tkazmoqchimisiz?`}
            </h6>
            <p className="fs-7 text-muted mb-0">
              {isArchive
                ? "Arxivlangan ma'lumotlar oddiy selektorlarda ko'rinmaydi, ammo tarixiy hujjatlarda saqlanadi."
                : "Ushbu ma'lumot qayta aktivlashtiriladi va barcha mos modullarda tanlash uchun mavjud bo'ladi."}
            </p>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
          <button type="button" className="btn btn-light btn-sm" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isArchive ? 'btn-warning' : 'btn-success'}`}
            onClick={() => {
              onConfirm(item.id || item.code);
              onClose();
            }}
          >
            {isArchive ? 'Arxivlash (Nofaol qilish)' : 'Qayta tiklash'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
