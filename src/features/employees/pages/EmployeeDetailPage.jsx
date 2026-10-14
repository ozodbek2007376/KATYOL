import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/common/Card/Card';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { EmployeeActivityTimeline } from '../components/EmployeeActivityTimeline';
import { employeesApi } from '../api/employeesApi';
import { ERP_ICONS } from '@/shared/icons';
import { ROUTES } from '@/constants/routes.constants';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployeeDetails();
  }, [id]);

  const loadEmployeeDetails = async () => {
    setIsLoading(true);
    const [empRes, actRes] = await Promise.all([
      employeesApi.getEmployeeById(id),
      employeesApi.getEmployeeActivities(id),
    ]);
    if (empRes.success) setEmployee(empRes.data);
    if (actRes.success) setActivities(actRes.data);
    setIsLoading(false);
  };

  if (isLoading || !employee) {
    return (
      <div className="employee-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-detail-page animate-fade-in pb-5">

      <PageHeader
        title={`Xodim Profili: ${employee.fullName}`}
        subtitle={`${employee.positionName} — ${employee.phone}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Xodimlar', path: ROUTES.PROTECTED.EMPLOYEES },
          { label: employee.fullName },
        ]}
        actions={
          <Link to={ROUTES.PROTECTED.EMPLOYEES} className="btn btn-outline-secondary btn-sm">
            <i className={`bi ${ERP_ICONS.CHEVRON_LEFT} me-1`}></i> Ro'yxatga Qaytish
          </Link>
        }
      />

      <div className="row g-3">
        {/* Left Profile Overview Card */}
        <div className="col-12 col-lg-4">
          <Card className="text-center p-4">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3 mx-auto mb-3"
              style={{ width: '80px', height: '80px' }}
            >
              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
            </div>
            <h5 className="fw-bold text-main mb-1 font-heading">{employee.fullName}</h5>
            <span className="badge bg-secondary bg-opacity-10 text-secondary mb-2 d-inline-block">
              {employee.positionName}
            </span>
            <div className="d-flex justify-content-center mb-3">
              <StatusBadge status={employee.status} />
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Telefon Raqami:</small>
                <strong className="text-main">{employee.phone}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Email Manzili:</small>
                <strong className="text-main">{employee.email || 'Ko\'rsatilmadi'}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Pasport Seriyasi:</small>
                <strong className="text-main">{employee.passportNumber}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Ishga Kirgan Sana:</small>
                <strong className="text-main">{employee.hireDate}</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Details & Activity Tabs */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {/* Position & Salary Card */}
            <Card title="Lavozim va Maosh Shartlari">
              <div className="row g-3 fs-7">
                <div className="col-12 col-sm-6">
                  <small className="text-muted-custom d-block">Lavozim Nomi:</small>
                  <strong className="text-main fs-6">{employee.positionName}</strong>
                </div>
                <div className="col-12 col-sm-6">
                  <small className="text-muted-custom d-block">Tizim Roli:</small>
                  <strong className="text-main fs-6">{employee.role}</strong>
                </div>
                <div className="col-12 col-sm-6">
                  <small className="text-muted-custom d-block">Oylik Maosh Turi:</small>
                  <strong className="text-main fs-6">{employee.salaryTypeName}</strong>
                </div>
                <div className="col-12 col-sm-6">
                  <small className="text-muted-custom d-block">Maosh Stavkasi Summasi:</small>
                  <strong className="text-primary fs-5">{formatCurrency(employee.salaryAmount || 0)}</strong>
                </div>
              </div>
            </Card>

            {/* Notes Card */}
            <Card title="Qo'shimcha Izoh va Sertifikatlar">
              <p className="fs-7 text-main mb-0">{employee.notes || 'Hech qanday qo\'shimcha izoh kiritilmagan.'}</p>
            </Card>

            {/* Activity Log Card */}
            <Card title="Xodimning Barcha Harakatlar Tarixi">
              <EmployeeActivityTimeline activities={activities} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
