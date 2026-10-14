import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuClipboardList, LuPlay, LuPrinter, LuX, LuBoxes, LuBookmarkCheck, LuDollarSign, LuCalendar, LuTriangleAlert, LuShieldCheck, LuAward } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { OrdersSubNav } from '../components/OrdersSubNav';
import { CustomerReceiptModal } from '@/components/common/CustomerReceiptModal/CustomerReceiptModal';
import { InsurancePolicyModal } from '@/components/common/InsurancePolicyModal/InsurancePolicyModal';
import { ordersApi } from '../api/ordersApi';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    setIsLoading(true);
    const res = await ordersApi.getOrderById(id);
    if (res.success) setOrder(res.data);
    setIsLoading(false);
  };

  const handleStartProduction = async () => {
    if (!order) return;
    const res = await ordersApi.startProductionOrder(order.id);
    notifySuccess(res.message);
    loadOrderDetails();
  };

  if (isLoading || !order) {
    return (
      <div className="order-detail-page animate-fade-in pb-5">
        <OrdersSubNav />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const totalAmount = parseFloat(order.totalAmount) || 0;
  const depositAmount = parseFloat(order.depositAmount) || 5000000;
  const deliveryDate = order.expectedDeliveryDate || '';
  const autoDiscountOnLate = order.autoDiscountOnLate !== false;
  const lateDiscountRate = parseFloat(order.lateDiscountRate) || 0.5;

  let daysLate = 0;
  let isOverdue = false;
  if (deliveryDate && deliveryDate < todayStr) {
    const d1 = new Date(todayStr);
    const d2 = new Date(deliveryDate);
    daysLate = Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
    isOverdue = daysLate > 0;
  }

  const discountPercent = (autoDiscountOnLate && isOverdue) ? Math.min(50, daysLate * lateDiscountRate) : 0;
  const lateDiscountAmount = Math.round((totalAmount * discountPercent) / 100);
  const finalPrice = Math.max(0, totalAmount - lateDiscountAmount);
  const remainingAmount = Math.max(0, finalPrice - depositAmount);

  const attachmentColumns = [
    { header: 'Hujjat Nomi', accessor: 'fileName' },
    { header: 'Hajmi', accessor: 'fileSize' },
    { header: 'Yuklangan Sana', accessor: 'uploadDate' },
    {
      header: 'Amal',
      cell: () => (
        <button className="btn btn-sm btn-outline-primary py-0 px-2 fs-8">Yuklab Olish</button>
      ),
    },
  ];

  const timelineItems = (order.timeline || []).map((tl) => ({
    id: tl.id,
    title: tl.title,
    description: tl.description,
    timestamp: tl.timestamp,
    icon: 'bi-clipboard-check',
  }));

  return (
    <div className="order-detail-page animate-fade-in pb-5">
      <OrdersSubNav />

      <PageHeader
        title={`Buyurtma №: ${order.orderNumber}`}
        subtitle={`Mijoz: ${order.customerName} — Kotyol Modeli: ${order.boilerModelName}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Buyurtmalar', path: ROUTES.PROTECTED.ORDERS },
          { label: order.orderNumber },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2">
            <Link to={ROUTES.PROTECTED.ORDERS} className="btn btn-outline-secondary btn-sm">
              <LuChevronLeft className="me-1" /> Ro'yxatga Qaytish
            </Link>

            <Button variant="primary" size="sm" onClick={() => setIsReceiptOpen(true)}>
              <LuPrinter className="me-1" /> Chek Chop Etish
            </Button>

            <Button variant="outline-success" size="sm" onClick={() => setIsInsuranceModalOpen(true)}>
              <LuAward className="me-1" /> Sug'urta Polisi
            </Button>

            {order.status !== 'IN_PRODUCTION' && order.status !== 'COMPLETED' && (
              <Button variant="success" size="sm" onClick={handleStartProduction}>
                <LuPlay className="me-1" /> Ishlab Chiqarishni Boshlash
              </Button>
            )}
          </div>
        }
      />

      <div className="row g-3">
        {/* Main Details Panel */}
        <div className="col-12 col-lg-8">
          <Card className="p-4 mb-3" title="Buyurtma va Shartnoma Ma'lumotlari">
            <div className="row g-3 fs-7">
              <div className="col-6 col-md-4">
                <span className="text-muted-custom d-block">Buyurtmachi Mijoz:</span>
                <strong className="text-primary fs-6">{order.customerName}</strong>
              </div>
              <div className="col-6 col-md-4">
                <span className="text-muted-custom d-block">Kotyol Modeli:</span>
                <strong className="text-main fs-6">{order.boilerModelName}</strong>
              </div>
              <div className="col-6 col-md-4">
                <span className="text-muted-custom d-block">Miqdori:</span>
                <strong className="text-main fs-6">{order.quantity} dona</strong>
              </div>

              <div className="col-6 col-md-4">
                <span className="text-muted-custom d-block">Mas'ul Xodim:</span>
                <strong className="text-primary fs-6">
                  {order.assignedEmployeeName || 'Biriktirilmagan'}
                </strong>
              </div>

              <div className="col-6 col-md-4">
                <span className="text-muted-custom d-block">Umumiy Summa:</span>
                <strong className="text-main fs-6">{formatCurrency(totalAmount)}</strong>
              </div>

              <div className="col-6 col-md-4">
                <div className="p-2 rounded bg-success bg-opacity-10 border border-success">
                  <span className="text-success fs-8 d-block fw-bold">Zaklad (Avans):</span>
                  <strong className="text-success fs-6">{formatCurrency(depositAmount)}</strong>
                </div>
              </div>

              <div className="col-6 col-md-4">
                <div className="p-2 rounded bg-warning bg-opacity-25 border border-warning">
                  <span className="text-dark fs-8 d-block fw-bold">Qolgan Summa:</span>
                  <strong className="text-danger fs-6">{formatCurrency(remainingAmount)}</strong>
                </div>
              </div>

              <div className="col-6 col-md-4">
                <span className="text-muted-custom d-block">Buyurtma Sanasi:</span>
                <strong className="text-main">{order.orderDate}</strong>
              </div>

              <div className="col-6 col-md-4">
                <span className="text-muted-custom d-block">Yetkazish Sanasi (Reja):</span>
                <strong className={isOverdue ? "text-danger" : "text-primary"}>
                  {deliveryDate || 'Belgilanmagan'}
                </strong>
              </div>

              <div className="col-6 col-md-4">
                <span className="text-muted-custom d-block">Status:</span>
                <StatusBadge status={order.status} />
              </div>

              {/* Late Delivery Status & Discount */}
              <div className="col-12 mt-3">
                <div className="p-3 rounded border bg-body-custom">
                  <h6 className="fw-bold fs-7 mb-2 d-flex align-items-center gap-2">
                    <LuCalendar className="text-primary" />
                    <span>Sanadan O'tgandagi Avtomatik Arzonlashuv Holati:</span>
                  </h6>

                  {autoDiscountOnLate ? (
                    <div>
                      <div className="text-success fs-8 d-flex align-items-center gap-1 mb-2">
                        <LuShieldCheck />
                        <span><strong>Avtomatik chegirma faol:</strong> Sanadan kechikilsa, kuniga {lateDiscountRate}% kotyol narxi arzonlashadi.</span>
                      </div>

                      {isOverdue ? (
                        <div className="alert alert-warning mb-0 fs-8 d-flex align-items-center gap-2">
                          <LuTriangleAlert className="fs-5 text-warning" />
                          <div>
                            <strong>Kechikish mavjud:</strong> Rejadagi sanadan <strong>{daysLate} kun</strong> o'tdi.
                            <div>Narx <strong>{discountPercent}%</strong> ga arzonlashdi (-{formatCurrency(lateDiscountAmount)}).</div>
                            <div>Yakuniy Narx: <strong className="text-success">{formatCurrency(finalPrice)}</strong></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted fs-8">
                          Hozircha yetkazib berish muddati kechikmagan. Narx o'zgarishsiz.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted fs-8">
                      Kechikganda avtomatik arzonlashuv opsiyasi o'chirilgan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Timeline & Receipt Card */}
        <div className="col-12 col-lg-4">
          <Card className="p-3 mb-3 bg-primary bg-opacity-10 border-primary">
            <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
              <LuPrinter />
              <span>Mijoz Uchun Chek Chop Etish</span>
            </h6>
            <p className="small text-muted mb-3">
              Mijozga zaklad summasi, yetkazish kuni va kechikish shartlari aks etgan rasmiy kvitansiya chekini chiqarib bering.
            </p>
            <Button variant="primary" className="w-100" icon={<LuPrinter />} onClick={() => setIsReceiptOpen(true)}>
              Chekni Chiqarish
            </Button>
          </Card>

          <Card title="Buyurtma Jarayoni Tarixi (Timeline)">
            <Timeline items={timelineItems} />
          </Card>
        </div>
      </div>

      <CustomerReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        customerData={{
          id: order.customerId,
          customerName: order.customerName,
          phone: order.phone || '',
          boilerModelName: order.boilerModelName,
          totalAmount: order.totalAmount,
          depositAmount: order.depositAmount,
          orderDate: order.orderDate,
          deliveryDate: order.expectedDeliveryDate,
          autoDiscountOnLate: order.autoDiscountOnLate,
          lateDiscountRate: order.lateDiscountRate,
          receiptNumber: order.orderNumber,
        }}
      />

      <InsurancePolicyModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        data={order}
      />
    </div>
  );
};
