import React, { useState, useEffect } from 'react';
import { LuSlidersHorizontal, LuEye, LuEyeOff } from 'react-icons/lu';
import { Skeleton } from '../Skeleton/Skeleton';
import { EmptyState } from '../EmptyState/EmptyState';
import { Pagination } from '../Pagination/Pagination';
import { useUserPreferencesStore } from '@/store/useUserPreferencesStore';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/constants/app.constants';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = "Ma'lumotlar topilmadi",
  emptyDescription = "Hozircha ko'rsatish uchun yozuvlar mavjud emas.",
  onRowClick,
  tableKey = null,
  enablePagination = true,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  // Controlled pagination props (optional for server-side pagination)
  currentPage: externalPage,
  totalPages: externalTotalPages,
  pageSize: externalPageSize,
  totalItems: externalTotalItems,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
}) => {
  const { tableColumns, setTableColumns } = useUserPreferencesStore();
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Internal Pagination State (for client-side pagination)
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);

  // Reset internal page to 1 whenever input data length or content changes (e.g., search/filter)
  useEffect(() => {
    setInternalPage(1);
  }, [data.length, data]);

  const hiddenColumns = tableKey ? tableColumns[tableKey] || [] : [];

  const toggleColumn = (headerName) => {
    if (!tableKey) return;
    const isHidden = hiddenColumns.includes(headerName);
    const updated = isHidden
      ? hiddenColumns.filter((h) => h !== headerName)
      : [...hiddenColumns, headerName];
    setTableColumns(tableKey, updated);
  };

  const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col.header));

  // Determine pagination values (controlled vs uncontrolled)
  const isControlled = externalOnPageChange !== undefined;
  const currentPage = isControlled ? externalPage : internalPage;
  const pageSize = isControlled ? (externalPageSize || defaultPageSize) : internalPageSize;
  const totalItems = isControlled ? (externalTotalItems || data.length) : data.length;
  const totalPages = isControlled
    ? (externalTotalPages || Math.max(1, Math.ceil(totalItems / pageSize)))
    : Math.max(1, Math.ceil(totalItems / pageSize));

  const handlePageChange = (newPage) => {
    if (isControlled) {
      externalOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (isControlled && externalOnPageSizeChange) {
      externalOnPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  // Slice data for client-side pagination
  const displayedData = enablePagination && !isControlled
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  if (isLoading) {
    return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    <Skeleton height="16px" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="smart-table-container">
      {/* Smart Table Header Toolbar (Column Selector) */}
      {tableKey && (
        <div className="d-flex align-items-center justify-content-end mb-2 position-relative">
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 fs-8 py-1 px-2"
              type="button"
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              title="Ustunlar ko'rinishini moslashtirish"
            >
              <LuSlidersHorizontal className="fs-8" />
              <span>Ustunlar ({visibleColumns.length}/{columns.length})</span>
            </button>

            {isColumnDropdownOpen && (
              <div
                className="dropdown-menu show dropdown-menu-end shadow-sm border-custom p-2 fs-7 position-absolute"
                style={{ minWidth: '220px', zIndex: 1050, right: 0 }}
              >
                <div className="fw-bold fs-8 text-muted-custom border-bottom border-custom pb-1 mb-2">
                  Ko'rinadigan Ustunlar:
                </div>
                {columns.map((col, idx) => {
                  const isVisible = !hiddenColumns.includes(col.header);
                  return (
                    <div
                      key={idx}
                      className="form-check form-check-sm d-flex align-items-center justify-content-between py-1 px-2 hover-bg-custom rounded cursor-pointer"
                      onClick={() => toggleColumn(col.header)}
                    >
                      <label className="form-check-label fs-8 text-main mb-0 me-2 cursor-pointer">
                        {col.header}
                      </label>
                      {isVisible ? (
                        <LuEye className="text-primary fs-7" />
                      ) : (
                        <LuEyeOff className="text-muted-custom fs-7" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Table Render */}
      <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="table table-hover align-middle mb-0" style={{ width: '100%', minWidth: 'max-content' }}>
          <thead className="table-light">
            <tr>
              {visibleColumns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          {displayedData && displayedData.length > 0 && (
            <tbody>
              {displayedData.map((row, rowIdx) => (
                <tr
                  key={row.id ? `${row.id}-${rowIdx}` : `row-${rowIdx}`}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {visibleColumns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.cell ? col.cell(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {(!data || data.length === 0) && (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </div>

      {/* Built-in Smart Pagination */}
      {enablePagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
};
