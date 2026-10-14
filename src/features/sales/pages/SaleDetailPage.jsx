import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuShoppingCart, LuBuilding2, LuFlame, LuFileText, LuDollarSign, LuWarehouse, LuAward, LuPrinter } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { InsurancePolicyModal } from '@/components/common/InsurancePolicyModal/InsurancePolicyModal';
import { SaleReceiptModal } from '@/components/common/SaleReceiptModal/SaleReceiptModal';
import { salesApi } from '../api/salesApi';
import { formatCurrency } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const SaleDetailPage = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    loadSaleDetail();
  }, [id]);

  const loadSaleDetail = async () => {
    setIsLoading(true);
    const res = await salesApi.getSaleById(id);
    if (res.success) setSale(res.data);
    setIsLoading(false);
  };

  if (isLoading || !sale) {
    return (
      <div className="sale-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sale-detail-page animate-fade-in pb-5">
      <PageHeader
        title={`Sotuv Fakturasi №: ${sale.invoiceNumber}`}
        subtitle={`Mijoz: ${sale.customerName} — Status: ${sale.statusName}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sotuvlar', path: ROUTES.PROTECTED.SALES },
          { label: sale.invoiceNumber },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" icon={<LuAward />} onClick={() => setIsInsuranceModalOpen(true)}>
              Sug'urta Polisi va Bepul Servis Qog'ozi
            </Button>
            <Link to={ROUTES.PROTECTED.SALES} className="btn btn-outline-secondary btn-sm">
              <LuChevronLeft className="me-1" /> Sotuvlar Ro'yxatiga Qaytish
            </Link>
          </div>
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
                <LuShoppingCart />
              </div>
              <div>
                <h5 className="fw-bold text-main mb-0 font-heading">{sale.invoiceNumber}</h5>
                <span className="badge bg-success fs-8">{sale.statusName}</span>
              </div>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Mijoz Korxona:</small>
                <strong className="text-primary">{sale.customerName}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">Kotyol Modeli:</small>
                <span className="fw-bold text-main">{sale.boilerModelName}</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">Sotuv Miqdori:</small>
                <span className="fw-semibold text-main">{sale.quantity} dona</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">Sotuv Sanasi:</small>
                <span className="text-main">{sale.saleDate}</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">Sotuvchi Mas'ul:</small>
                <span className="text-main fw-medium">{sale.assignedEmployeeName || sale.createdBy || 'Biriktirilmagan'}</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">Yetkazib Berilgan Manzil:</small>
                <span className="text-main">{sale.deliveryLocation || 'Ko\'rsatilmagan'}</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">Kafolat Muddati:</small>
                <span className="fw-bold text-success">
                  {sale.warrantyPeriod || 'Kafolatsiz'} 
                  {sale.warrantyStartDate && ` (${sale.warrantyStartDate} dan — ${sale.warrantyEndDate || 'muddatsiz'} gacha)`}
                </span>
              </div>
            </div>

            <hr className="border-custom my-3" />

            <div className="bg-body-custom p-3 rounded-3 border-custom">
              <div className="d-flex justify-content-between mb-1 fs-7">
                <span className="text-muted-custom">Subtotal (Birlik × Miqdor):</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1 fs-7">
                <span>Chegirma:</span>
                <span className="text-danger">-{formatCurrency(sale.discountAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1 fs-7">
                <span>Soliq (QQS 12%):</span>
                <span>+{formatCurrency(sale.taxAmount)}</span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top border-custom fw-bold text-primary fs-6">
                <span>Umumiy Sotuv Summasi:</span>
                <span>{formatCurrency(sale.totalAmount)}</span>
              </div>
            </div>

            <div className="mt-3 d-flex flex-column gap-2">
              <Button
                variant="outline-success"
                size="sm"
                className="w-100"
                icon={<LuAward />}
                onClick={() => setIsInsuranceModalOpen(true)}
              >
                Sug'urta Polisi & Servis Guvohnomasini Chop Etish
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                className="w-100"
                icon={<LuPrinter />}
                onClick={() => setIsReceiptModalOpen(true)}
              >
                Sotuv Chekini Chop Etish
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Financial Breakdown & Profit Margins */}
        <div className="col-12 col-lg-8">
          <Card className="p-4 mb-3" title="Sotuv Rentabelligi va Foyda Tahlili">
            <div className="row g-3 fs-7">
              <div className="col-6 col-md-4">
                <div className="p-3 bg-body-custom rounded-3 border-custom">
                  <small className="text-muted-custom d-block mb-1">Tannarx (Ishlab Chiqarish):</small>
                  <strong className="text-secondary fs-6">{formatCurrency(sale.actualCost)}</strong>
                </div>
              </div>

              <div className="col-6 col-md-4">
                <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
                  <small className="text-success d-block mb-1">Sof Foyda (Profit):</small>
                  <strong className="text-success fs-6">+{formatCurrency(sale.profit)}</strong>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25">
                  <small className="text-primary d-block mb-1">Rentabellik Margini (%):</small>
                  <strong className="text-primary fs-6">{sale.profitMarginPercent}%</strong>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4" title="Izoh va Shartlar">
            <p className="text-muted-custom fs-7 mb-0">
              {sale.notes || "Ushbu sotuv bo'yicha qo'shimcha maxsus izoh kiritilmagan."}
            </p>
          </Card>
        </div>
      </div>

      <InsurancePolicyModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        data={sale}
      />

      <SaleReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        saleId={id}
      />
    </div>
  );
};
