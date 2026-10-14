import React from 'react';
import { PAGE_SIZE_OPTIONS } from '@/constants/app.constants';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 25,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate max 3 visible page numbers (e.g. 1 2 3 or 2 3 4)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 py-3 px-3 border-top border-custom mt-3 mb-1">
      {/* Page Info & Items Per Page Selector */}
      <div className="d-flex flex-wrap align-items-center gap-3 text-muted-custom fs-7">
        <span>
          Jami <strong className="text-main fw-bold">{totalItems}</strong> ta yozuvdan{' '}
          <strong className="text-main fw-bold">{startItem}-{endItem}</strong> ko'rsatilmoqda
        </span>

        {onPageSizeChange && (
          <div className="d-flex align-items-center gap-2 ms-md-2">
            <span className="fs-8 text-muted-custom">Sahifada:</span>
            <select
              className="form-select form-select-sm border-custom bg-card-custom text-main rounded-2 px-2 py-0 fs-8 fw-semibold"
              style={{ width: '85px', height: '34px' }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} ta
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Nav Buttons (Only < and > with max 3 page buttons) */}
      {totalPages > 1 && (
        <nav aria-label="Jadval sahifalar navi">
          <ul className="pagination pagination-sm mb-0 align-items-center gap-1">
            {/* Previous Page Button (<) */}
            <li className={`page-item ${currentPage === 1 ? 'disabled opacity-50' : ''}`}>
              <button
                className="btn btn-sm btn-outline-secondary border-custom text-main d-inline-flex align-items-center justify-content-center p-0 rounded-2 me-1"
                style={{ width: '34px', height: '34px' }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Oldingi sahifa"
              >
                <LuChevronLeft className="fs-6" />
              </button>
            </li>

            {/* Page Number Buttons (Max 3 visible) */}
            {pageNumbers.map((p) => (
              <li key={p} className="page-item">
                <button
                  className={`btn btn-sm d-inline-flex align-items-center justify-content-center rounded-2 fs-8 transition-all ${
                    p === currentPage
                      ? 'btn-primary fw-bold shadow-sm'
                      : 'btn-outline-secondary border-custom text-main bg-card-custom'
                  }`}
                  style={{ minWidth: '34px', height: '34px' }}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              </li>
            ))}

            {/* Next Page Button (>) */}
            <li className={`page-item ${currentPage >= totalPages ? 'disabled opacity-50' : ''}`}>
              <button
                className="btn btn-sm btn-outline-secondary border-custom text-main d-inline-flex align-items-center justify-content-center p-0 rounded-2 ms-1"
                style={{ width: '34px', height: '34px' }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                title="Keyingi sahifa"
              >
                <LuChevronRight className="fs-6" />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};
