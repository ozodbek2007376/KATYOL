import React, { useState } from 'react';
import {
  LuChevronDown,
  LuChevronRight,
  LuSearch,
  LuFolder,
  LuFileText,
  LuChevronsDown,
  LuChevronsUp,
} from 'react-icons/lu';
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES_TREE,
} from '@/constants/permissions.constants';

export const PermissionMatrixTable = ({
  permissions = [],
  matrix = null,
  onChange,
  onTogglePermission,
  readOnly = false,
}) => {
  const [expandedModules, setExpandedModules] = useState(
    PERMISSION_MODULES_TREE.reduce((acc, mod) => ({ ...acc, [mod.key]: true }), {})
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Normalize permissions into a helper set or object
  // Supports both Array format ["SALES_ORDERS_VIEW"] and Matrix format { SALES_ORDERS: { view: true } }
  const isChecked = (pageKey, actionKey, actionAltKey) => {
    if (matrix) {
      const pageMatrix = matrix[pageKey];
      if (!pageMatrix) return false;
      return Boolean(pageMatrix[actionKey] || pageMatrix[actionAltKey]);
    }

    if (Array.isArray(permissions)) {
      const fullKeyUpper = `${pageKey}_${actionKey.toUpperCase()}`;
      const fullKeyAltUpper = `${pageKey}_${actionAltKey.toUpperCase()}`;
      // Legacy fallback check (e.g. SALES_VIEW)
      const moduleKey = pageKey.split('_')[0];
      const legacyKey = `${moduleKey}_${actionKey.toUpperCase()}`;

      return (
        permissions.includes(fullKeyUpper) ||
        permissions.includes(fullKeyAltUpper) ||
        permissions.includes(legacyKey)
      );
    }

    return false;
  };

  const toggleExpand = (modKey) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modKey]: !prev[modKey],
    }));
  };

  const expandAll = () => {
    const all = {};
    PERMISSION_MODULES_TREE.forEach((m) => (all[m.key] = true));
    setExpandedModules(all);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const handleSingleToggle = (pageKey, actionKey, actionAltKey) => {
    if (readOnly) return;

    if (onTogglePermission && matrix) {
      onTogglePermission(pageKey, actionAltKey);
      return;
    }

    if (onChange && Array.isArray(permissions)) {
      const targetKey = `${pageKey}_${actionKey.toUpperCase()}`;
      let updated = [];
      if (permissions.includes(targetKey)) {
        updated = permissions.filter((p) => p !== targetKey);
      } else {
        updated = [...permissions, targetKey];
      }
      onChange(updated);
    }
  };

  const handleModuleActionToggle = (moduleObj, actionKey, actionAltKey) => {
    if (readOnly) return;

    const allPageKeys = moduleObj.pages.map((p) => p.key);
    const areAllChecked = allPageKeys.every((pageKey) =>
      isChecked(pageKey, actionKey, actionAltKey)
    );

    if (onTogglePermission && matrix) {
      // Toggle for each page in matrix
      allPageKeys.forEach((pageKey) => {
        const currentVal = isChecked(pageKey, actionKey, actionAltKey);
        if (areAllChecked && currentVal) {
          onTogglePermission(pageKey, actionAltKey);
        } else if (!areAllChecked && !currentVal) {
          onTogglePermission(pageKey, actionAltKey);
        }
      });
      return;
    }

    if (onChange && Array.isArray(permissions)) {
      let updated = [...permissions];
      allPageKeys.forEach((pageKey) => {
        const keyToAdd = `${pageKey}_${actionKey.toUpperCase()}`;
        if (areAllChecked) {
          updated = updated.filter((p) => p !== keyToAdd);
        } else {
          if (!updated.includes(keyToAdd)) {
            updated.push(keyToAdd);
          }
        }
      });
      onChange(updated);
    }
  };

  const handleSelectAll = () => {
    if (readOnly) return;
    if (onChange && Array.isArray(permissions)) {
      const allPerms = [];
      PERMISSION_MODULES_TREE.forEach((mod) => {
        mod.pages.forEach((page) => {
          PERMISSION_ACTIONS.forEach((act) => {
            allPerms.push(`${page.key}_${act.key}`);
          });
        });
      });
      onChange(allPerms);
    }
  };

  const handleDeselectAll = () => {
    if (readOnly) return;
    if (onChange && Array.isArray(permissions)) {
      onChange([]);
    }
  };

  // Filter modules/pages based on search term
  const filteredTree = PERMISSION_MODULES_TREE.map((mod) => {
    const q = searchTerm.toLowerCase();
    const modMatch = mod.label.toLowerCase().includes(q);
    const matchingPages = mod.pages.filter(
      (page) => modMatch || page.label.toLowerCase().includes(q) || page.key.toLowerCase().includes(q)
    );
    return {
      ...mod,
      pages: matchingPages,
    };
  }).filter((mod) => mod.pages.length > 0);

  return (
    <div className="permission-matrix-container">
      {/* Controls Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 bg-body-tertiary p-2.5 rounded-3 border">
        <div className="d-flex align-items-center gap-2" style={{ maxWidth: '320px', flex: 1 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-body text-muted border-end-0">
              <LuSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 fs-7"
              placeholder="Bo'lim yoki sahifa nomi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 fs-8"
            onClick={expandAll}
            title="Barchasini yoyish"
          >
            <LuChevronsDown className="fs-7" /> Yoyish
          </button>
          <button
            type="button"
            className="btn-sm btn-outline-secondary d-flex align-items-center gap-1 fs-8 btn"
            onClick={collapseAll}
            title="Barchasini yig'ish"
          >
            <LuChevronsUp className="fs-7" /> Yig'ish
          </button>
          {!readOnly && (
            <>
              <div className="vr my-1 mx-1"></div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary fs-8"
                onClick={handleSelectAll}
              >
                Barchasini Tanlash
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger fs-8"
                onClick={handleDeselectAll}
              >
                Barchasini Bekor Qilish
              </button>
            </>
          )}
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="table-responsive rounded-3 border">
        <table className="table table-hover table-bordered align-middle mb-0 fs-7">
          <thead className="bg-light-subtle">
            <tr>
              <th className="py-2.5 px-3 text-main fw-bold" style={{ minWidth: '280px' }}>
                Bo'lim va Sahifalar Ro'yxati
              </th>
              {PERMISSION_ACTIONS.map((act) => (
                <th
                  key={act.key}
                  className="text-center py-2.5 px-2 text-main fw-semibold"
                  style={{ width: '100px' }}
                >
                  {act.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTree.map((mod) => {
              const isExpanded = expandedModules[mod.key] || searchTerm.trim().length > 0;

              return (
                <React.Fragment key={mod.key}>
                  {/* Module Header Row */}
                  <tr className="table-secondary table-group-divider">
                    <td className="py-2 px-3 fw-bold text-dark">
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm p-0 border-0 text-muted shadow-none me-1"
                          onClick={() => toggleExpand(mod.key)}
                        >
                          {isExpanded ? (
                            <LuChevronDown className="fs-6 text-primary" />
                          ) : (
                            <LuChevronRight className="fs-6 text-muted" />
                          )}
                        </button>
                        <LuFolder className="text-warning fs-6 flex-shrink-0" />
                        <span
                          className="user-select-none cursor-pointer"
                          onClick={() => toggleExpand(mod.key)}
                        >
                          {mod.label}
                        </span>
                        <span className="badge bg-secondary bg-opacity-25 text-dark fs-8 font-monospace ms-1">
                          {mod.pages.length} ta sahifa
                        </span>
                      </div>
                    </td>

                    {/* Module-level Master Action Checkboxes */}
                    {PERMISSION_ACTIONS.map((act) => {
                      const allPageKeys = mod.pages.map((p) => p.key);
                      const checkedCount = allPageKeys.filter((pageKey) =>
                        isChecked(pageKey, act.key, act.altKey)
                      ).length;

                      const isAll = checkedCount === mod.pages.length && mod.pages.length > 0;
                      const isSome = checkedCount > 0 && checkedCount < mod.pages.length;

                      return (
                        <td key={act.key} className="text-center bg-secondary bg-opacity-10 py-1.5">
                          <input
                            type="checkbox"
                            className="form-check-input cursor-pointer"
                            checked={isAll}
                            ref={(input) => {
                              if (input) input.indeterminate = isSome;
                            }}
                            disabled={readOnly}
                            title={`${mod.label} bo'limida barcha '${act.label}' huquqini bir yo'la belgash/bekor qilish`}
                            onChange={() => handleModuleActionToggle(mod, act.key, act.altKey)}
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Page Sub-Rows */}
                  {isExpanded &&
                    mod.pages.map((page) => (
                      <tr key={page.key} className="bg-white">
                        <td className="py-2 ps-4 pe-3 text-secondary">
                          <div className="d-flex align-items-center gap-2 ms-3">
                            <span className="text-muted opacity-50">↳</span>
                            <LuFileText className="text-info fs-7 flex-shrink-0" />
                            <span className="fw-medium text-main">{page.label}</span>
                            <code className="fs-9 text-muted ms-auto opacity-75">{page.key}</code>
                          </div>
                        </td>

                        {PERMISSION_ACTIONS.map((act) => {
                          const active = isChecked(page.key, act.key, act.altKey);

                          return (
                            <td key={act.key} className="text-center py-2">
                              <input
                                type="checkbox"
                                className="form-check-input cursor-pointer"
                                checked={active}
                                disabled={readOnly}
                                onChange={() =>
                                  handleSingleToggle(page.key, act.key, act.altKey)
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
