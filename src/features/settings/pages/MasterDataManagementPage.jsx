import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { MasterDataModal } from '@/components/common/MasterData/MasterDataModal';
import { MasterDataDeleteDialog } from '@/components/common/MasterData/MasterDataDeleteDialog';
import { MasterDataArchiveDialog } from '@/components/common/MasterData/MasterDataArchiveDialog';
import { useMasterData } from '@/hooks/useMasterData';
import {
  LuPlus,
  LuSearch,
  LuPencil,
  LuTrash2,
  LuArchive,
  LuRotateCcw,
  LuFilter,
  LuSlidersHorizontal,
  LuBoxes,
  LuUsers,
  LuWarehouse,
  LuTruck,
  LuBadgeDollarSign,
  LuSettings2,
  LuWrench,
} from 'react-icons/lu';

// Configurable registry for all ERP Dynamic Entities
const ENTITY_CONFIGS = [
  {
    key: 'productCategories',
    title: 'Mahsulot Kategoriyalari',
    icon: LuBoxes,
    integrityType: 'CATEGORY',
    fields: [
      { name: 'name', label: 'Kategoriya Nomi', required: true },
      { name: 'code', label: 'Kategoriya Kodi' },
      { name: 'description', label: 'Tavsif', type: 'textarea' },
    ],
  },
  {
    key: 'units',
    title: "O'lchov Birliklari",
    icon: LuSlidersHorizontal,
    integrityType: 'UNIT',
    fields: [
      { name: 'name', label: 'Birlik Nomi (masalan, Kilogramm)', required: true },
      { name: 'code', label: 'Qisqa Nomi (masalan, kg)', required: true },
      { name: 'description', label: 'Tavsif', type: 'textarea' },
    ],
  },
  {
    key: 'customerTypes',
    title: 'Mijoz Turlari',
    icon: LuUsers,
    integrityType: 'CUSTOMER_TYPE',
    fields: [
      { name: 'name', label: 'Mijoz Turi Nomi', required: true },
      { name: 'description', label: 'Tavsif', type: 'textarea' },
    ],
  },
  {
    key: 'serviceTypes',
    title: 'Servis va Ta\'mir Turlari',
    icon: LuWrench,
    integrityType: 'SERVICE_TYPE',
    fields: [
      { name: 'name', label: 'Servis Turi Nomi', required: true },
      { name: 'description', label: 'Tavsif', type: 'textarea' },
    ],
  },
  {
    key: 'warrantyTypes',
    title: 'Kafolat Turlari',
    icon: LuSettings2,
    integrityType: 'WARRANTY_TYPE',
    fields: [
      { name: 'name', label: 'Kafolat Nomi', required: true },
      { name: 'duration', label: 'Muddati (Oylarda)', required: true },
      { name: 'description', label: 'Shartlar', type: 'textarea' },
    ],
  },
  {
    key: 'priorities',
    title: 'Ustuvorlik Darajalari',
    icon: LuFilter,
    integrityType: 'PRIORITY',
    fields: [
      { name: 'name', label: 'Nomi', required: true },
      { name: 'code', label: 'Kodi (LOW, HIGH, URGENT)', required: true },
    ],
  },
  {
    key: 'orderStatuses',
    title: 'Buyurtma Maqomlari',
    icon: LuSlidersHorizontal,
    integrityType: 'ORDER_STATUS',
    fields: [
      { name: 'name', label: 'Maqom Nomi', required: true },
      { name: 'code', label: 'Kodi (NEW, COMPLETED)', required: true },
    ],
  },
];

export const MasterDataManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEntityKey = searchParams.get('type') || ENTITY_CONFIGS[0].key;

  const activeConfig = ENTITY_CONFIGS.find((c) => c.key === selectedEntityKey) || ENTITY_CONFIGS[0];

  const {
    data,
    filteredData,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    bulkArchive,
    createItem,
    updateItem,
    archiveItem,
    restoreItem,
    deleteItem,
    canDeleteCheck,
  } = useMasterData(activeConfig.key, activeConfig.integrityType);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState(null);
  const [archiveActionType, setArchiveActionType] = useState('ARCHIVE');

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (formData) => {
    if (editingItem) {
      await updateItem(editingItem.id || editingItem.code, formData);
    } else {
      await createItem(formData);
    }
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenArchive = (item, type = 'ARCHIVE') => {
    setItemToArchive(item);
    setArchiveActionType(type);
    setIsArchiveDialogOpen(true);
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          className="form-check-input"
          checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
          onChange={toggleSelectAll}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          className="form-check-input"
          checked={selectedIds.includes(row.id || row.code)}
          onChange={() => toggleSelect(row.id || row.code)}
        />
      ),
    },
    // Map fields dynamically from the active config
    ...activeConfig.fields.map((field) => ({
      header: field.label,
      cell: (row) => {
        const val = row[field.name];
        if (val === true || val === 'true') return 'Ha';
        if (val === false || val === 'false') return 'Yo\'q';
        return val || '—';
      },
    })),
    // Add Code / Value column if not already defined in fields
    ...(!activeConfig.fields.some(f => f.name === 'code') ? [{
      header: 'Kod / Qiymat',
      cell: (row) => row.code || '—',
    }] : []),
    {
      header: 'Holat',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Amallar',
      cell: (row) => {
        const isInactive = row.status === 'INACTIVE' || row.status === 'ARCHIVED';
        return (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary p-1"
              onClick={() => handleOpenEdit(row)}
              title="Tahrirlash"
            >
              <LuPencil className="fs-7" />
            </button>
            {isInactive ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-success p-1"
                onClick={() => handleOpenArchive(row, 'RESTORE')}
                title="Qayta tiklash"
              >
                <LuRotateCcw className="fs-7" />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-outline-warning p-1"
                onClick={() => handleOpenArchive(row, 'ARCHIVE')}
                title="Arxivlash"
              >
                <LuArchive className="fs-7" />
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger p-1"
              onClick={() => handleOpenDelete(row)}
              title="O'chirish"
            >
              <LuTrash2 className="fs-7" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold mb-1">Dinamik Master-Data Boshqaruvi</h4>
          <p className="text-muted fs-7 mb-0">
            Tizimdagi barcha moslashuvchan biznes-entitilarni (Master Data) xavfsiz boshqarish, arxivlash va tahrirlash.
          </p>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={handleOpenCreate}>
          <LuPlus className="fs-6" /> <span>Yangi {activeConfig.title.slice(0, -1)} Qo'shish</span>
        </button>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <Card className="p-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '360px' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-body-tertiary">
                <LuSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Nomi, kodi yoki tavsif bo'yicha qidiruv..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="fs-7 text-muted me-1">Holat:</label>
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className={`btn ${statusFilter === 'ALL' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('ALL')}
              >
                Barchasi
              </button>
              <button
                type="button"
                className={`btn ${statusFilter === 'ACTIVE' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setStatusFilter('ACTIVE')}
              >
                Faqat Aktiv
              </button>
              <button
                type="button"
                className={`btn ${statusFilter === 'INACTIVE' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setStatusFilter('INACTIVE')}
              >
                Arxivdagilar
              </button>
            </div>

            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-warning btn-sm d-flex align-items-center gap-1 ms-2"
                onClick={bulkArchive}
              >
                <LuArchive /> <span>Tanlanganlarni Arxivlash ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card padding={false}>
        <Table columns={columns} data={filteredData} isLoading={loading} emptyMessage="Hech qanday ma'lumot topilmadi" />
      </Card>

      {/* Reusable Modals */}
      <MasterDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        item={editingItem}
        entityTitle={activeConfig.title.slice(0, -1)}
        fields={activeConfig.fields}
      />

      <MasterDataDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        item={itemToDelete}
        entityTitle={activeConfig.title.slice(0, -1)}
        canDeleteInfo={itemToDelete ? canDeleteCheck(itemToDelete.id || itemToDelete.code) : { allowed: true }}
        onConfirmDelete={(id) => deleteItem(id)}
        onConfirmArchive={(id) => archiveItem(id)}
      />

      <MasterDataArchiveDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        item={itemToArchive}
        entityTitle={activeConfig.title.slice(0, -1)}
        actionType={archiveActionType}
        onConfirm={(id) => (archiveActionType === 'ARCHIVE' ? archiveItem(id) : restoreItem(id))}
      />
    </div>
  );
};
