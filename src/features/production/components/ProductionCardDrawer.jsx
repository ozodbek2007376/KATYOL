import { formatCurrency } from '@/utils/currency.utils';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuX, LuSettings2, LuExternalLink, LuUsers, LuBoxes, LuFileText, LuHistory, LuPlay, LuPause, LuCircleCheck } from 'react-icons/lu';
import { Table } from '@/components/common/Table/Table';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { ROUTES } from '@/constants/routes.constants';

export const ProductionCardDrawer = ({ order, isOpen, onClose, onStartBatch }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'materials' | 'attachments' | 'timeline'

  if (!isOpen || !order) return null;

  const ingredientColumns = [
    { header: 'Xomashyo Nomi', accessor: 'materialName' },
    {
      header: 'Sarflanadigan Miqdor',
      cell: (row) => <strong className="text-main fs-7">{row.requiredQty} {row.unit}</strong>,
    },
    {
      header: 'Taxminiy Xarajat ($)',
      cell: (row) => <span className="text-primary font-mono font-semibold">{formatCurrency(row.cost)}</span>,
    },
  ];

  const attachmentColumns = [
    { header: 'Hujjat Nomi', accessor: 'fileName' },
    { header: 'Hajmi', accessor: 'fileSize' },
    {
      header: 'Amal',
      cell: () => <button className="btn btn-sm btn-outline-primary py-0 px-2 fs-8">Yuklab Olish</button>,
    },
  ];

  const timelineItems = (order.timeline || []).map((tl) => ({
    id: tl.id,
    title: tl.title,
    description: tl.description,
    timestamp: tl.timestamp,
    icon: 'bi-gear',
  }));

  return (
    <div className="drawer-overlay position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3 d-flex justify-content-end animate-fade-in">
      <div
        className="drawer-content bg-surface h-100 shadow-lg border-start border-custom d-flex flex-column animate-slide-left"
        style={{ width: '100%', maxWidth: '640px' }}
      >
        {/* Drawer Header */}
        <div className="p-4 border-bottom border-custom bg-body-custom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 bg-primary text-white p-2 d-flex align-items-center justify-content-center fs-4" style={{ width: '48px', height: '48px' }}>
              <LuSettings2 />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6 className="fw-bold text-main mb-0 font-heading fs-6">{order.productionNumber}</h6>
                <StatusBadge status={order.status} />
              </div>
              <small className="text-muted-custom fs-8">{order.title}</small>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-secondary border-0 p-2" onClick={onClose}>
            <LuX className="fs-5" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="border-bottom border-custom px-4 bg-surface">
          <ul className="nav nav-tabs border-0 gap-2">
            <li className="nav-item">
              <button
                className={`nav-link border-0 border-bottom border-2 py-3 fs-7 ${
                  activeTab === 'overview' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted-custom'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Umumiy Ma'lumot
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 border-bottom border-2 py-3 fs-7 ${
                  activeTab === 'materials' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted-custom'
                }`}
                onClick={() => setActiveTab('materials')}
              >
                Xomashyolar Sarfiyati
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 border-bottom border-2 py-3 fs-7 ${
                  activeTab === 'attachments' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted-custom'
                }`}
                onClick={() => setActiveTab('attachments')}
              >
                Hujjatlar & Izoh
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 border-bottom border-2 py-3 fs-7 ${
                  activeTab === 'timeline' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted-custom'
                }`}
                onClick={() => setActiveTab('timeline')}
              >
                Audit Tarixi
              </button>
            </li>
          </ul>
        </div>

        {/* Drawer Body */}
        <div className="p-4 flex-grow-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="d-flex flex-column gap-3">
              <div className="p-3 bg-body-custom rounded-3 border border-custom fs-7 d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span className="text-muted-custom">Tegishli Buyurtma:</span>
                  <Link to={`${ROUTES.PROTECTED.ORDERS}/${order.orderId}`} className="fw-bold text-primary text-decoration-none">
                    {order.orderNumber}
                  </Link>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-custom">Mijoz Korxona:</span>
                  <Link to={`${ROUTES.PROTECTED.CUSTOMERS}/${order.customerId}`} className="fw-bold text-primary text-decoration-none">
                    {order.customerName}
                  </Link>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-custom">Kotyol Modeli:</span>
                  <Link to={`${ROUTES.PROTECTED.BOILERS}/${order.boilerId}`} className="fw-bold text-primary text-decoration-none">
                    {order.boilerModelName}
                  </Link>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-custom">Sanoat Liniyasi:</span>
                  <strong className="text-main">{order.line}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-custom">Rejalashtirilgan Miqdor:</span>
                  <strong className="text-main fs-6">{order.quantity} dona</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-custom">Kutilayotgan Yakunlanish:</span>
                  <strong className="text-main">{order.expectedFinishDate}</strong>
                </div>
              </div>

              {/* Progress */}
              <div className="p-3 bg-body-custom rounded-3 border border-custom fs-7">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted-custom">Bajarilish Progresi:</span>
                  <strong className="text-primary">{order.progressPercent}%</strong>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${order.progressPercent}%` }}></div>
                </div>
              </div>

              {/* Assigned Employees */}
              <div className="p-3 bg-body-custom rounded-3 border border-custom">
                <strong className="fs-7 text-main d-block mb-2">Biriktirilgan Usta Xodimlar</strong>
                {order.assignedEmployees && order.assignedEmployees.length > 0 ? (
                  order.assignedEmployees.map((emp, i) => (
                    <Link
                      key={i}
                      to={ROUTES.PROTECTED.EMPLOYEES}
                      className="badge bg-primary bg-opacity-10 text-primary text-decoration-none fs-7 me-1 mb-1"
                    >
                      {emp}
                    </Link>
                  ))
                ) : (
                  <span className="text-muted-custom fs-8">Hozircha xodim biriktirilmagan</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <h6 className="fw-bold fs-7 mb-3 text-main">Reseptura Bo'yicha Sarflanuvchi Masalliqlar</h6>
              <Table columns={ingredientColumns} data={order.ingredients || []} />
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="d-flex flex-column gap-3">
              <div>
                <h6 className="fw-bold fs-7 mb-2 text-main">Texnik Yo'riqnoma va Izoh</h6>
                <p className="fs-7 text-main p-3 bg-body-custom rounded-3 border border-custom mb-0">
                  {order.notes || 'Izoh kiritilmagan.'}
                </p>
              </div>

              <div>
                <h6 className="fw-bold fs-7 mb-2 text-main">Texnik Hujjatlar va Ilovalar</h6>
                <Table columns={attachmentColumns} data={order.attachments || []} />
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h6 className="fw-bold fs-7 mb-3 text-main">Topshiriq Bosqichlari Tarixi</h6>
              <Timeline items={timelineItems} />
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-top border-custom bg-body-custom d-flex align-items-center justify-content-between">
          <Link to={`${ROUTES.PROTECTED.PRODUCTION}/${order.id}`} className="btn btn-outline-primary btn-sm">
            <LuExternalLink className="me-1" /> To'liq Sahifaga O'tish
          </Link>

          {order.status === 'SCHEDULED' && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => {
                if (onStartBatch) onStartBatch(order.id);
                onClose();
              }}
            >
              <LuPlay className="me-1" /> Sexda Boshlash
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
