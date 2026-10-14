import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape bosilsa modal yopilmasin
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass =
    size === 'sm'
      ? 'modal-sm'
      : size === 'lg'
        ? 'modal-lg'
        : size === 'xl'
          ? 'modal-xl'
          : 'modal-md';

  return createPortal(
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1060,
        overflowY: 'auto',
      }}
      tabIndex="-1"
      role="dialog"
      onClick={(e) => {
        // Backdrop click — modal yopilmasin, faqat X yoki Bekor qilish tugmasi orqali
      }}
    >
      <div className={`modal-dialog modal-dialog-centered ${sizeClass}`} role="document">
        <div className="modal-content animate-fade-in shadow-lg border-custom bg-body-custom text-main">
          <div className="modal-header py-3 px-3 border-bottom border-custom">
            <h5 className="modal-title fs-6 fw-semibold mb-0 text-main">{title}</h5>
            <button
              type="button"
              className="btn-close text-main"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-3">{children}</div>
          {footer && (
            <div className="modal-footer py-2 px-3 border-top border-custom">{footer}</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
