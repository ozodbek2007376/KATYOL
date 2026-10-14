import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { dataIntegrityService } from '@/services/dataIntegrity.service';
import { LuSearch, LuRotateCcw, LuTrash2, LuArchive, LuTriangleAlert } from 'react-icons/lu';

export const ArchiveManagementModal = ({
  isOpen,
  onClose,
  entityKey,
  entityTitle = 'Element',
  onRestored = null,
}) => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorAlert, setErrorAlert] = useState(null);

  const loadArchivedData = () => {
    if (!entityKey) return;
    const allItems = dynamicSettingsService.getList(entityKey, { includeArchived: true });
    const archived = allItems.filter((i) => i.status === 'INACTIVE' || i.status === 'ARCHIVED');
    setArchivedItems(archived);
    setErrorAlert(null);
  };

  useEffect(() => {
    if (isOpen) {
      loadArchivedData();
      setSearchTerm('');
    }
  }, [isOpen, entityKey]);

  const handleRestore = (item) => {
    const itemId = item.id || item.code;
    dynamicSettingsService.restoreItem(entityKey, itemId);
    loadArchivedData();
    if (onRestored) {
      onRestored(itemId);
    }
  };

  const handleDelete = (item) => {
    const itemId = item.id || item.code;
    const integrity = dataIntegrityService.canDelete(entityKey, itemId);
    if (!integrity.allowed) {
      setErrorAlert(integrity.reason);
      return;
    }
    dynamicSettingsService.deleteItem(entityKey, itemId);
    loadArchivedData();
  };

  const filtered = archivedItems.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.label && item.label.toLowerCase().includes(term)) ||
      (item.code && item.code.toLowerCase().includes(term))
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Arxivlangan ${entityTitle}larni Boshqarish`}
      size="md"
    >
      <div className="d-flex flex-column gap-3 py-2">
        {errorAlert && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 fs-7">
            <LuTriangleAlert className="fs-5 flex-shrink-0" />
            <span>{errorAlert}</span>
          </div>
        )}

        {/* Search */}
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-body-tertiary">
            <LuSearch className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Arxiv ichidan qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="border rounded-3 p-2 bg-body-tertiary" style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div className="text-center py-4 text-muted fs-7">
              <LuArchive className="fs-3 mb-1 d-block mx-auto opacity-50" />
              Arxivlangan yozuvlar topilmadi
            </div>
          ) : (
            <div className="d-flex flex-column gap-1">
              {filtered.map((item) => {
                const itemId = item.id || item.code;
                return (
                  <div
                    key={itemId}
                    className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-body hover-bg-light border"
                  >
                    <div>
                      <div className="fw-medium text-main fs-7">{item.name || item.label}</div>
                      {item.code && <small className="text-muted font-monospace">{item.code}</small>}
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success p-1 px-2 fs-8 d-flex align-items-center gap-1"
                        onClick={() => handleRestore(item)}
                        title="Qayta tiklash"
                      >
                        <LuRotateCcw /> <span>Tiklash</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger p-1 fs-8"
                        onClick={() => handleDelete(item)}
                        title="Butunlay o'chirish"
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end pt-2 border-top">
          <button type="button" className="btn btn-light btn-sm" onClick={onClose}>
            Yopish
          </button>
        </div>
      </div>
    </Modal>
  );
};
