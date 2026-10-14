import React from 'react';
import { LuBookOpen, LuTruck, LuBoxes, LuInfo, LuUser } from 'react-icons/lu';
import { formatCurrency } from '@/utils/currency.utils';

export const EntityPreviewCard = ({ type, data }) => {
  if (!data) return null;

  switch (type) {
    case 'RECIPE':
      return (
        <div className="entity-preview-card p-2 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 fs-8 my-2">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="fw-bold text-primary d-flex align-items-center gap-1">
              <LuBookOpen /> <span>Biriktirilgan Retseptura: {data.recipeName}</span>
            </span>
            <span className={`badge ${data.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} fs-8`}>
              v{data.version} ({data.status === 'ACTIVE' ? 'Faol' : 'Nofaol'})
            </span>
          </div>
          <div className="d-flex flex-wrap justify-content-between text-main gap-2">
            <span>Masalliqlar: <strong>{data.items ? data.items.length : 0} ta xomashyo</strong></span>
            <span>Taxminiy Tannarx: <strong className="text-primary">{formatCurrency(data.estimatedTotalCost || 0)}</strong></span>
          </div>
        </div>
      );

    case 'SUPPLIER':
      return (
        <div className="entity-preview-card p-2 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3 fs-8 my-2">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="fw-bold text-info d-flex align-items-center gap-1">
              <LuTruck /> <span>Ta'minotchi: {data.companyName || data.name}</span>
            </span>
            <span className="badge bg-info bg-opacity-25 text-info fs-8">Faol Hamkor</span>
          </div>
          <div className="d-flex flex-wrap justify-content-between text-main gap-2">
            <span>Telefon: <strong>{data.phone || '+998 90 123 45 67'}</strong></span>
            <span>Mas'ul: <strong>{data.contactPerson || 'Bosh Menejer'}</strong></span>
          </div>
        </div>
      );

    case 'CUSTOMER':
      return (
        <div className="entity-preview-card p-2 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 fs-8 my-2">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="fw-bold text-primary d-flex align-items-center gap-1">
              <LuUser /> <span>Mijoz: {data.customerName || data.name}</span>
            </span>
            <span className="badge bg-primary bg-opacity-25 text-primary fs-8">Faol Hamkor</span>
          </div>
          <div className="d-flex flex-wrap justify-content-between text-main gap-2">
            <span>Telefon: <strong>{data.phone || '—'}</strong></span>
            <span>STIR / Kod: <strong>{data.tin || '—'}</strong></span>
          </div>
        </div>
      );

    case 'PRODUCT':
      return (
        <div className="entity-preview-card p-2 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 fs-8 my-2">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="fw-bold text-secondary d-flex align-items-center gap-1">
              <LuBoxes /> <span>Mahsulot: {data.name || data.productName}</span>
            </span>
            <span className="badge bg-secondary bg-opacity-25 text-secondary fs-8">{data.unitName || 'dona'}</span>
          </div>
          <div className="d-flex flex-wrap justify-content-between text-main gap-2">
            <span>Kategoriya: <strong>{data.categoryName || 'Sanoat Qismlari'}</strong></span>
            <span>Harid Narxi: <strong>{formatCurrency(data.purchasePrice || 0)}</strong></span>
          </div>
        </div>
      );

    default:
      return null;
  }
};
