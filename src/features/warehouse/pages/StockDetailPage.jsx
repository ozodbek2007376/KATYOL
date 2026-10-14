import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuBoxes, LuBadgeDollarSign, LuShoppingCart, LuSettings2 } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { warehouseApi } from '../api/warehouseApi';
import { formatCurrency } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const StockDetailPage = () => {
  const { id } = useParams();
  const [stockItem, setStockItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStockDetails();
  }, [id]);

  const loadStockDetails = async () => {
    setIsLoading(true);
    const [stockRes, movRes] = await Promise.all([
      warehouseApi.getStockById(id),
      warehouseApi.getMovements(),
    ]);
    if (stockRes.success) setStockItem(stockRes.data);
    if (movRes.success) setMovements(movRes.data);
    setIsLoading(false);
  };

  if (isLoading || !stockItem) {
    return (
      <div className="stock-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const timelineItems = movements.map((m) => ({
    id: m.id,
    title: `${m.movementTypeName}: ${m.quantity} ${m.unitName}`,
    description: `${m.warehouseName} — ${m.reason}. (${m.notes || 'Izoh yo\'q'})`,
    timestamp: m.createdDate,
    icon: 'bi-box-seam',
  }));

  return (
    <div className="stock-detail-page animate-fade-in pb-5">

      <PageHeader
        title={`Ombor Zaxira Kartochkasi: ${stockItem.productName}`}
        subtitle={`SKU: ${stockItem.internalCode} — ${stockItem.warehouseName}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Omborxona', path: ROUTES.PROTECTED.WAREHOUSE_STOCK },
          { label: stockItem.productName },
        ]}
        actions={
          <Link to={ROUTES.PROTECTED.WAREHOUSE_STOCK} className="btn btn-outline-secondary btn-sm">
            <LuChevronLeft className="me-1" /> Zaxiraga Qaytish
          </Link>
        }
      />

      <div className="row g-3">
        {/* Left Side: Summary Card */}
        <div className="col-12 col-lg-4">
          <Card className="p-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{ width: '56px', height: '56px' }}
              >
                <LuBoxes />
              </div>
              <div>
                <h6 className="fw-bold text-main mb-0 font-heading">{stockItem.productName}</h6>
                <small className="text-muted-custom">Kodi: {stockItem.internalCode}</small>
              </div>
            </div>

            <div className="mb-3 d-flex align-items-center justify-content-between">
              <StatusBadge status={stockItem.status} />
              <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">{stockItem.materialTypeName}</span>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Mavjud Ombor Zaxirasi:</small>
                <strong className={`fs-5 ${stockItem.quantity <= stockItem.minQuantity ? 'text-danger' : 'text-success'}`}>
                  {stockItem.quantity} {stockItem.unitName}
                </strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Minimal Chegara:</small>
                <strong className="text-main">{stockItem.minQuantity} {stockItem.unitName}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Birlik Narxi Stavkasi:</small>
                <strong className="text-main">{formatCurrency(stockItem.purchasePrice || stockItem.unitPrice)}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Jami Ombor Qiymati:</small>
                <strong className="text-primary fs-6">{formatCurrency(stockItem.currentValue)}</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Placeholders & Timeline */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {/* Purchase History Placeholder */}
            <Card title="Xaridlar va Ta'minot Kirimi Tarixi">
              <div className="p-3 bg-body-custom rounded-3 border-custom text-center">
                <LuBadgeDollarSign className="fs-3 text-muted-custom mb-2 d-block mx-auto" />
                <p className="fs-7 text-muted-custom mb-0">
                  Ushbu mahsulotning kirim va hisob-fakturalari **Xaridlar va Ta'minot** moduliga avtomatik bog'lanadi.
                </p>
              </div>
            </Card>

            {/* Production Usage Placeholder */}
            <Card title="Ishlab Chiqarish Sarfi va Liniya Topshiriqlari">
              <div className="p-3 bg-body-custom rounded-3 border-custom text-center">
                <LuSettings2 className="fs-3 text-muted-custom mb-2 d-block mx-auto" />
                <p className="fs-7 text-muted-custom mb-0">
                  Liniya topshiriqlari va BOM retseptlari bo'yicha xomashyo sarfi **Ishlab Chiqarish** modulida aks etadi.
                </p>
              </div>
            </Card>

            {/* Sales Placeholder */}
            <Card title="Sotuv va Mijozlarga Jo'natmalar">
              <div className="p-3 bg-body-custom rounded-3 border-custom text-center">
                <LuShoppingCart className="fs-3 text-muted-custom mb-2 d-block mx-auto" />
                <p className="fs-7 text-muted-custom mb-0">
                  Tijorat sotuvlari va ombordan mijozga yuklash hisoboti **Sotuv va CRM** modulida ko'rsatiladi.
                </p>
              </div>
            </Card>

            {/* Timeline */}
            <Card title="Ombor Zaxirasi Harakatlar Tarixi">
              <Timeline items={timelineItems} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
