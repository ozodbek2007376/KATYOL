import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuShieldCheck, LuExternalLink } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { auditApi } from '../api/auditApi';
import { ROUTES } from '@/constants/routes.constants';

export const AuditDetailPage = () => {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuditDetail();
  }, [id]);

  const loadAuditDetail = async () => {
    setIsLoading(true);
    const res = await auditApi.getAuditLogById(id);
    if (res.success) setLog(res.data);
    setIsLoading(false);
  };

  if (isLoading || !log) {
    return (
      <div className="audit-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-detail-page animate-fade-in pb-5">
      <PageHeader
        title={`Audit Yozuvi №: ${log.id}`}
        subtitle={`Amal: ${log.actionLabel} — Foydalanuvchi: ${log.user}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Audit Jurnali', path: ROUTES.PROTECTED.AUDIT },
          { label: log.id },
        ]}
        actions={
          <Link to={ROUTES.PROTECTED.AUDIT} className="btn btn-outline-secondary btn-sm">
            <LuChevronLeft className="me-1" /> Audit Ro'yxatiga Qaytish
          </Link>
        }
      />

      <div className="row g-3">
        {/* Left Overview Card */}
        <div className="col-12 col-lg-4">
          <Card className="p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                <LuShieldCheck />
              </div>
              <div>
                <h6 className="fw-bold text-main mb-0 font-heading">{log.actionLabel}</h6>
                <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">Modul: {log.moduleLabel}</span>
              </div>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Bajaruvchi Foydalanuvchi:</small>
                <strong className="text-primary">{log.user}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">Sana va Vaqt:</small>
                <span className="fw-bold text-main">{log.date} {log.time}</span>
              </div>

              <div>
                <small className="text-muted-custom d-block">IP Manzil:</small>
                <code>{log.ipAddress}</code>
              </div>

              <div>
                <small className="text-muted-custom d-block">Tegishli Ob'yekt / Hujjat:</small>
                <Link to={log.linkPath} className="fw-bold text-primary text-decoration-none d-flex align-items-center gap-1 mt-1">
                  <span>{log.affectedRecord}</span>
                  <LuExternalLink />
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Values Comparison Card */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            <Card title="Harakat Izohi va Tafsilot">
              <p className="fs-7 text-main mb-0">{log.description}</p>
            </Card>

            <Card title="Qiymatlarning O'zgarish Taqqoslanishi">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3">
                    <strong className="text-danger font-heading fs-7 d-block mb-2">Eski Qiymatlar</strong>
                    <pre className="fs-8 text-main mb-0 bg-body-custom p-2 rounded border-custom">
                      {log.oldValues ? JSON.stringify(log.oldValues, null, 2) : "Eski qiymat mavjud emas (Yangi ob'yekt)"}
                    </pre>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3">
                    <strong className="text-success font-heading fs-7 d-block mb-2">Yangi Qiymatlar</strong>
                    <pre className="fs-8 text-main mb-0 bg-body-custom p-2 rounded border-custom">
                      {log.newValues ? JSON.stringify(log.newValues, null, 2) : "Yangi qiymat kiritilmadi"}
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
