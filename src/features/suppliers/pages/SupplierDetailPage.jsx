import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuPhone, LuMail, LuMapPin, LuBuilding2, LuShoppingBag, LuBoxes, LuClock } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { suppliersApi } from '../api/suppliersApi';
import { ROUTES } from '@/constants/routes.constants';

export const SupplierDetailPage = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSupplierDetail();
  }, [id]);

  const loadSupplierDetail = async () => {
    setIsLoading(true);
    const [supRes, histRes] = await Promise.all([
      suppliersApi.getSupplierById(id),
      suppliersApi.getSupplierHistory(id),
    ]);

    if (supRes.success) setSupplier(supRes.data);
    if (histRes.success) setHistory(histRes.data);
    setIsLoading(false);
  };

  if (isLoading || !supplier) {
    return (
      <div className="supplier-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const historyColumns = [
    {
      header: 'Hujjat Sana & Vaqt',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7 d-block">{row.date}</strong>
          <small className="text-muted-custom fs-8">{row.time}</small>
        </div>
      ),
    },
    {
      header: 'Harakat / Voqea',
      cell: (row) => <strong className="text-primary fs-7">{row.title}</strong>,
    },
    {
      header: 'Tavsif',
      cell: (row) => <span className="fs-7 text-main">{row.description}</span>,
    },
    {
      header: 'Mas\'ul',
      cell: (row) => <small className="text-secondary fw-semibold">{row.user}</small>,
    },
  ];

  return (
    <div className="supplier-detail-page animate-fade-in pb-5">
      <PageHeader
        title={`Ta'minotchi Profil: ${supplier.name}`}
        subtitle={`Kategoriya: ${supplier.categoryName} — Status: ${supplier.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Ta\'minotchilar', path: ROUTES.PROTECTED.SUPPLIERS },
          { label: supplier.name },
        ]}
        actions={
          <Link to={ROUTES.PROTECTED.SUPPLIERS} className="btn btn-outline-secondary btn-sm">
            <LuChevronLeft className="me-1" /> Ta'minotchilar Ro'yxatiga Qaytish
          </Link>
        }
      />

      <div className="row g-3">
        {/* Left Card - Company Info */}
        <div className="col-12 col-lg-4">
          <Card className="p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                <LuBuilding2 />
              </div>
              <div>
                <h5 className="fw-bold text-main mb-0 font-heading">{supplier.name}</h5>
                <span className="badge bg-primary bg-opacity-10 text-primary fs-8">{supplier.categoryName}</span>
              </div>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Mas'ul Shaxs:</small>
                <strong className="text-main">{supplier.contactPerson}</strong>
              </div>

              <div>
                <small className="text-muted-custom d-block">Telefon Manzili:</small>
                <a href={`tel:${supplier.phone}`} className="text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                  <LuPhone /> {supplier.phone}
                </a>
              </div>

              <div>
                <small className="text-muted-custom d-block">Elektron Pochta:</small>
                <a href={`mailto:${supplier.email}`} className="text-main text-decoration-none d-flex align-items-center gap-1">
                  <LuMail /> {supplier.email}
                </a>
              </div>

              <div>
                <small className="text-muted-custom d-block">Yuridik Manzili:</small>
                <span className="text-main d-flex align-items-center gap-1">
                  <LuMapPin /> {supplier.address}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Section - Supplies & History */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            <Card title="Yetkazib Berilayotgan Xomashyo va Mahsulotlar">
              <p className="fs-7 text-muted-custom mb-0">
                Ushbu ta'minotchi orqali kirim qilingan metall va detallar kelgusi **Omborxona** modulida avtomatik bog'lanadi.
              </p>
            </Card>

            <Card title="Xaridlar va Shartnomalar Tarixi">
              <Table columns={historyColumns} data={history} tableKey="supplier_history" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
