import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuShoppingBag, LuBuilding2, LuWarehouse, LuCheck, LuFileText } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { purchasingApi } from '../api/purchasingApi';
import { formatCurrency } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const PurchaseDetailPage = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchaseDetail();
  }, [id]);

  const loadPurchaseDetail = async () => {
    setIsLoading(true);
    const [purRes, recRes] = await Promise.all([
      purchasingApi.getPurchaseById(id),
      purchasingApi.getPurchaseReceipts(id),
    ]);

    if (purRes.success) setPurchase(purRes.data);
    if (recRes.success) setReceipts(recRes.data);
    setIsLoading(false);
  };

  if (isLoading || !purchase) {
    return (
      <div className="purchase-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const itemsColumns = [
    {
      header: 'Mahsulot / Xomashyo',
      cell: (row) => <strong className="text-main fs-7">{row.productName}</strong>,
    },
    {
      header: 'Miqdor',
      cell: (row) => (
        <span className="fw-semibold text-main">
          {row.quantity} {row.unitName}
        </span>
      ),
    },
    {
      header: 'Birlik Narxi',
      cell: (row) => <span>{formatCurrency(row.unitPrice, purchase.currency)}</span>,
    },
    {
      header: 'Jami Summa',
      cell: (row) => <strong className="text-primary">{formatCurrency(row.totalPrice, purchase.currency)}</strong>,
    },
  ];

  const receiptColumns = [
    {
      header: 'Hujjat №',
      cell: (row) => <strong className="text-main fs-7">{row.movementNumber}</strong>,
    },
    {
      header: 'Sana & Vaqt',
      cell: (row) => (
        <div>
          <span className="text-main fs-7 d-block">{row.date}</span>
          <small className="text-muted-custom fs-8">{row.time}</small>
        </div>
      ),
    },
    {
      header: 'Kirim Ombori',
      cell: (row) => <span className="fw-medium text-main">{row.warehouseName}</span>,
    },
    {
      header: 'Mahsulotlar va Miqdor',
      cell: (row) => (
        <div>
          <span className="fw-bold text-primary fs-7 d-block">{row.productName}</span>
          <small className="text-success fw-semibold fs-8">+{row.quantity} dona/tn</small>
        </div>
      ),
    },
    {
      header: "Mas'ul Omborchi",
      cell: (row) => <small className="text-secondary fw-semibold">{row.performedBy}</small>,
    },
  ];

  return (
    <div className="purchase-detail-page animate-fade-in pb-5">
      <PageHeader
        title={`Xarid Hujjati №: ${purchase.purchaseNumber}`}
        subtitle={`Ta'minotchi: ${purchase.supplierName} — Status: ${purchase.statusName}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Xaridlar', path: ROUTES.PROTECTED.PURCHASING },
          { label: purchase.purchaseNumber },
        ]}
        actions={
          <Link to={ROUTES.PROTECTED.PURCHASING} className="btn btn-outline-secondary btn-sm">
            <LuChevronLeft className="me-1" /> Xaridlar Ro'yxatiga Qaytish
          </Link>
        }
      />

      <div className="row g-3">
        {/* Left Column - Summary Card */}
        <div className="col-12 col-lg-4">
          <Card className="p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                <LuShoppingBag />
              </div>
              <div>
                <h5 className="fw-bold text-main mb-0 font-heading">{purchase.purchaseNumber}</h5>
                <span
                  className={`badge ${
                    purchase.status === 'RECEIVED'
                      ? 'bg-success'
                      : purchase.status === 'DRAFT'
                      ? 'bg-secondary'
                      : 'bg-warning text-dark'
                  } fs-8`}
                >
                  {purchase.statusName}
                </span>
              </div>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Ta'minotchi Korxona:</small>
                <strong className="text-primary">{purchase.supplierName}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">Kirim Qilinadigan Ombor:</small>
                <span className="fw-bold text-main">{purchase.warehouseName}</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">Schyot-Faktura №:</small>
                <span className="fw-semibold text-main">{purchase.invoiceNumber || '—'}</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">Buyurtma Sanasi:</small>
                <span className="text-main">{purchase.orderDate}</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">Mas'ul Xodimi:</small>
                <span className="text-main fw-medium">{purchase.createdBy}</span>
              </div>
            </div>

            <hr className="border-custom my-3" />

            <div className="bg-body-custom p-3 rounded-3 border-custom">
              <div className="d-flex justify-content-between mb-1 fs-7">
                <span className="text-muted-custom">Oraliq Summa:</span>
                <span>{formatCurrency(purchase.subtotal, purchase.currency)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1 fs-7">
                <span>Soliq:</span>
                <span>+{formatCurrency(purchase.taxAmount, purchase.currency)}</span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top border-custom fw-bold text-primary fs-6">
                <span>Umumiy Summa:</span>
                <span>{formatCurrency(purchase.totalAmount, purchase.currency)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Items Table & Receipts */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            <Card title={`Xarid Qilinayotgan Mahsulotlar Ro'yxati (${purchase.items.length} tur)`}>
              <Table columns={itemsColumns} data={purchase.items} tableKey="purchase_items" />
            </Card>

            <Card title="Omborga Kirim Qilingan Harakatlar">
              {receipts.length === 0 ? (
                <p className="text-muted-custom fs-7 mb-0">Ushbu xarid bo'yicha omborga kirim harakati hali amalga oshirilmadi.</p>
              ) : (
                <Table columns={receiptColumns} data={receipts} tableKey="purchase_receipts" />
              )}
            </Card>

            <Card title="Xaridga Biriktirilgan Hujjatlar va Faktular">
              <div className="d-flex align-items-center gap-2 p-2 bg-body-custom rounded border-custom">
                <LuFileText className="text-primary fs-5" />
                <div className="flex-grow-1">
                  <span className="fw-semibold fs-7 d-block">Schyot_Faktura_PUR_7001.pdf</span>
                  <small className="text-muted-custom fs-8">2.4 MB — Imzolangan va tasdiqlangan</small>
                </div>
                <button className="btn btn-sm btn-outline-primary border-0 fs-8">Yuklab olish</button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
