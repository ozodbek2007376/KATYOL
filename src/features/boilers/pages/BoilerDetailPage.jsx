import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuFlame, LuShieldCheck, LuFileText, LuDollarSign, LuLayers } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { BoilersSubNav } from '../components/BoilersSubNav';
import { boilersApi } from '../api/boilersApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { ROUTES } from '@/constants/routes.constants';

export const BoilerDetailPage = () => {
  const { id } = useParams();
  const [boiler, setBoiler] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const allStages = dynamicSettingsService.getProductionStages();

  useEffect(() => {
    loadBoilerDetails();
  }, [id]);

  const loadBoilerDetails = async () => {
    setIsLoading(true);
    const res = await boilersApi.getBoilerById(id);
    if (res.success) setBoiler(res.data);
    setIsLoading(false);
  };

  if (isLoading || !boiler) {
    return (
      <div className="boiler-detail-page animate-fade-in pb-5">
        <BoilersSubNav />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const selectedStagesList = allStages.filter((s) => (boiler.selectedStageIds || []).includes(s.id));

  const attachmentColumns = [
    { header: 'Hujjat / Sertifikat Nomi', accessor: 'fileName' },
    { header: 'Hajmi', accessor: 'fileSize' },
    { header: 'Yuklangan Sana', accessor: 'uploadDate' },
    {
      header: 'Amal',
      cell: () => (
        <button className="btn btn-sm btn-outline-primary py-0 px-2 fs-8">Yuklab Olish</button>
      ),
    },
  ];

  const timelineItems = (boiler.timeline || []).map((tl) => ({
    id: tl.id,
    title: tl.title,
    description: tl.description,
    timestamp: tl.timestamp,
    icon: 'bi-flame',
  }));

  return (
    <div className="boiler-detail-page animate-fade-in pb-5">
      <BoilersSubNav />

      <PageHeader
        title={`Kotyol Modeli: ${boiler.modelName}`}
        subtitle={`Ichki Kod: ${boiler.internalCode} — Status: ${boiler.status}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Kotyol Turlari', path: ROUTES.PROTECTED.BOILERS },
          { label: boiler.modelName },
        ]}
        actions={
          <Link to={ROUTES.PROTECTED.BOILERS} className="btn btn-outline-secondary btn-sm">
            <LuChevronLeft className="me-1" /> Katalogga Qaytish
          </Link>
        }
      />

      <div className="row g-3">
        {/* Left Column: Boiler Profile Card & Cost Breakdown */}
        <div className="col-12 col-lg-4">
          <Card className="p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                <LuFlame />
              </div>
              <div>
                <h6 className="fw-bold text-main mb-0 font-heading">{boiler.modelName}</h6>
                <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">Kod: {boiler.internalCode}</span>
              </div>
            </div>

            <div className="mb-3">
              <span className={`badge ${boiler.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} fs-8`}>
                {boiler.status === 'ACTIVE' ? 'Faol Model' : 'Nofaol'}
              </span>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Biriktirilgan Retseptura:</small>
                <Link to={`${ROUTES.PROTECTED.RECIPES}/${boiler.recipeId}`} className="fw-bold text-primary text-decoration-none">
                  {boiler.recipeName}
                </Link>
              </div>
              <div>
                <small className="text-muted-custom d-block">Zavod Kafolati:</small>
                <strong className="text-main">{boiler.warrantyTypeName}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Sug'urta Sharti:</small>
                <strong className="text-main">{boiler.insuranceTypeName}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Yaratilgan Sana:</small>
                <strong className="text-main">{boiler.createdDate}</strong>
              </div>
            </div>

            <hr className="border-custom my-3" />

            {/* Cost Breakdown */}
            <h6 className="fw-bold text-main mb-2 font-heading fs-7 d-flex align-items-center gap-1">
              <LuDollarSign className="text-primary" /> <span>Taxminiy Tannarx Taqsimoti</span>
            </h6>

            <div className="text-start fs-7 d-flex flex-column gap-1 bg-body-custom p-3 rounded-3 border-custom">
              <div className="d-flex justify-content-between">
                <span className="text-muted-custom">Materiallar Xarajati:</span>
                <span>{formatCurrency(boiler.costBreakdown?.materialCost || 0)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted-custom">Bosqichlar Xarajati:</span>
                <span>{formatCurrency(boiler.costBreakdown?.stageCost || 0)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted-custom">Mehnat Sarfi:</span>
                <span>{formatCurrency(boiler.costBreakdown?.laborCost || 0)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold pt-2 border-top border-custom text-primary fs-6">
                <span>1 Birlik Tannarxi:</span>
                <span>{formatCurrency(boiler.costBreakdown?.totalCost || 0)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Stages Flow, Attachments & Timeline */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {/* Description */}
            <Card title="Model Texnik Xarakteristikasi va Izoh">
              <p className="fs-7 text-main mb-0">{boiler.description || 'Texnik izoh kiritilmagan.'}</p>
            </Card>

            {/* Production Flow Stages */}
            <Card title="Standart Ishlab Chiqarish Bosqichlari Ketma-ketligi (Production Flow)">
              <div className="d-flex flex-column gap-2">
                {selectedStagesList.map((stg) => (
                  <div key={stg.id} className="d-flex align-items-center justify-content-between p-2 bg-body-custom rounded-3 border-custom">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                        {stg.stageOrder}
                      </span>
                      <strong className="fs-7 text-main">{stg.stageName}</strong>
                      <small className="text-muted-custom">({stg.description})</small>
                    </div>
                    <strong className="fs-7 text-primary">{formatCurrency(stg.defaultPrice || 0)}</strong>
                  </div>
                ))}
              </div>
            </Card>

            {/* Technical Attachments */}
            <Card title="Texnik Chizmalar va Hujjatlar (Attachments)">
              <Table columns={attachmentColumns} data={boiler.attachments || []} />
            </Card>

            {/* Timeline */}
            <Card title="Model Harakatlari Tarixi (Activity Timeline)">
              <Timeline items={timelineItems} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
