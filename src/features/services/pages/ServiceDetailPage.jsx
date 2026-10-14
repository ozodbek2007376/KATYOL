import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuWrench, LuPrinter, LuShieldCheck, LuUser, LuFlame } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { servicesApi } from '../api/servicesApi';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const ServiceDetailPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServiceDetails();
  }, [id]);

  const loadServiceDetails = async () => {
    setIsLoading(true);
    const res = await servicesApi.getServiceById(id);
    if (res.success) setService(res.data);
    setIsLoading(false);
  };

  const handlePrintAct = () => {
    notifySuccess("Servis ko'rigi va bajarilgan ishlar dalolatnomasi chop etishga yuborildi.");
  };

  if (isLoading || !service) {
    return (
      <div className="service-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const attachmentColumns = [
    { header: 'Hujjat / Rasm Nomi', accessor: 'fileName' },
    { header: 'Hajmi', accessor: 'fileSize' },
    { header: 'Yuklangan Sana', accessor: 'uploadDate' },
    {
      header: 'Amal',
      cell: () => <button className="btn btn-sm btn-outline-primary py-0 px-2 fs-8">Yuklab Olish</button>,
    },
  ];

  const timelineItems = (service.timeline || []).map((tl) => ({
    id: tl.id,
    title: tl.title,
    description: tl.description,
    timestamp: tl.timestamp,
    icon: 'bi-wrench',
  }));

  return (
    <div className="service-detail-page animate-fade-in pb-5">

      <PageHeader
        title={`Servis Ariza №: ${service.serviceNumber}`}
        subtitle={`Mijoz: ${service.customerName} — Kotyol: ${service.boilerModelName}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Servislar', path: ROUTES.PROTECTED.SERVICES },
          { label: service.serviceNumber },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2">
            <Link to={ROUTES.PROTECTED.SERVICES} className="btn btn-outline-secondary btn-sm">
              <LuChevronLeft className="me-1" /> Ro'yxatga Qaytish
            </Link>

            <Button variant="outline-dark" size="sm" onClick={handlePrintAct}>
              <LuPrinter className="me-1" /> Dalolatnomani Chop Etish
            </Button>
          </div>
        }
      />

      <div className="row g-3">
        {/* Left Column: Service & Warranty Overview Card */}
        <div className="col-12 col-lg-4">
          <Card className="p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                <LuWrench />
              </div>
              <div>
                <h6 className="fw-bold text-main mb-0 font-heading">{service.serviceNumber}</h6>
                <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">Sana: {service.serviceDate}</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <StatusBadge status={service.status} />
              <span className={`badge ${service.isUnderWarranty ? 'bg-success' : 'bg-secondary'} fs-8 d-flex align-items-center gap-1`}>
                <LuShieldCheck /> {service.isUnderWarranty ? 'Kafolat Ostida' : 'Kafolat Tugagan'}
              </span>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Mijoz Korxona:</small>
                <Link to={`${ROUTES.PROTECTED.CUSTOMERS}/${service.customerId}`} className="fw-bold text-primary text-decoration-none">
                  {service.customerName}
                </Link>
              </div>

              <div>
                <small className="text-muted-custom d-block">Kotyol Modeli:</small>
                <Link to={`${ROUTES.PROTECTED.BOILERS}/${service.boilerId}`} className="fw-bold text-primary text-decoration-none">
                  {service.boilerModelName}
                </Link>
              </div>

              <div>
                <small className="text-muted-custom d-block">Servis Xizmati Turi:</small>
                <strong className="text-main">{service.serviceTypeName}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">Biriktirilgan Usta Xodim:</small>
                <strong className="text-main">{service.assignedEmployeeName || 'Biriktirilmagan'}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">Zavod Kafolati Holati:</small>
                <span className="fw-bold text-success">{service.warrantyPeriod}</span>
              </div>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-1 bg-body-custom p-3 rounded-3 border-custom">
              {service.saleInvoiceNumber && (
                <div className="d-flex justify-content-between">
                  <span className="text-muted-custom">Sotuv Fakturasi №:</span>
                  <Link to={`${ROUTES.PROTECTED.SALES}/${service.saleId}`} className="fw-bold text-primary text-decoration-none">
                    {service.saleInvoiceNumber}
                  </Link>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span className="text-muted-custom">Tegishli Buyurtma №:</span>
                <span className="fw-bold text-primary">{service.orderNumber}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted-custom">Tegishli Ishlab Chiqarish №:</span>
                <span className="fw-bold text-primary">{service.productionNumber}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Details, Attachments & Timeline */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {/* Warranty Status Banner */}
            <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 d-flex align-items-center gap-3">
              <LuShieldCheck className="text-success fs-2 flex-shrink-0" />
              <div>
                <strong className="text-success font-heading fs-6 d-block">Zavod Kafolati va Bepul Xizmat Manbai</strong>
                <span className="fs-7 text-main">
                  Ushbu sanoat pechi mahsulotiga zavod tomonidan 24 oylik kafolat biriktirilgan. Barcha profilaktika va ehtiyot qismlarni almashtirish kafolat bo'yicha amalga oshiriladi.
                </span>
              </div>
            </div>

            {/* Notes */}
            <Card title="Nosozlik Eslatmasi va Usta Xulosasi">
              <p className="fs-7 text-main mb-0">{service.notes || 'Izoh kiritilmagan.'}</p>
            </Card>

            {/* Attachments */}
            <Card title="Diagnostika Fotosuratlari va Hujjatlar (Attachments)">
              <Table columns={attachmentColumns} data={service.attachments || []} />
            </Card>

            {/* Audit Timeline */}
            <Card title="Servis Harakatlari Tarixi (Audit Timeline)">
              <Timeline items={timelineItems} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
