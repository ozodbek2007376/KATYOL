import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuClock, LuUser, LuExternalLink } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { activitiesApi } from '../api/activitiesApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { DEFAULT_PAGE_SIZE } from '@/constants/app.constants';

export const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    loadActivitiesData();
  }, [search, moduleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, moduleFilter, activities.length]);

  const loadActivitiesData = async () => {
    const res = await activitiesApi.getActivities({ search, moduleName: moduleFilter });
    if (res.success) setActivities(res.data);
  };

  usePageAutoRefresh(loadActivitiesData, { intervalMs: 15000 });

  const moduleOptions = [
    { value: '', label: 'Barcha Modullar' },
    { value: 'sales', label: 'Sotuv' },
    { value: 'services', label: 'Servis' },
    { value: 'production', label: 'Ishlab Chiqarish' },
    { value: 'warehouse', label: 'Ombor' },
    { value: 'finance', label: 'Moliya' },
    { value: 'orders', label: 'Buyurtmalar' },
    { value: 'customers', label: 'Mijozlar' },
  ];

  const handleReset = () => {
    setSearch('');
    setModuleFilter('');
  };

  const totalPages = Math.ceil(activities.length / pageSize) || 1;
  const displayedActivities = activities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="activities-page animate-fade-in pb-5">
      <PageHeader
        title="Global Faoliyatlar Jurnali"
        subtitle="ERP tizimidagi barcha modullar bo'yicha hodisalar va harakatlar tarixi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Faoliyatlar' },
        ]}
      />

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Hodisa, foydalanuvchi yoki tavsif bo'yicha qidiruv...",
        }}
        primarySelects={[
          { id: 'module', label: 'Tizim Moduli', value: moduleFilter, onChange: setModuleFilter, options: moduleOptions },
        ]}
        onReset={handleReset}
      />

      <Card title={`Tizim Hodisalari Tarixi (${activities.length} ta)`}>
        <div className="d-flex flex-column gap-3 mb-3">
          {displayedActivities.map((act) => (
            <div key={act.id} className="p-3 border-custom rounded-3 bg-body-custom hover-bg-light transition-all">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary fs-8 fw-bold">
                    {act.moduleLabel}
                  </span>
                  <strong className="text-main fs-6 fw-bold">{act.title}</strong>
                </div>
                <small className="text-muted-custom d-flex align-items-center gap-1 fs-8">
                  <LuClock /> {act.time}
                </small>
              </div>

              <p className="fs-7 text-main mb-2">{act.description}</p>

              <div className="d-flex align-items-center justify-content-between pt-2 border-top border-custom">
                <small className="text-secondary d-flex align-items-center gap-1 fs-8">
                  <LuUser /> Mas'ul: <strong>{act.user}</strong>
                </small>

                {act.linkPath && (
                  <Link to={act.linkPath} className="btn btn-sm btn-outline-primary border-0 py-0 px-2 fs-8">
                    <span>Tegishli ob'yektni ko'rish</span>
                    <LuExternalLink className="ms-1" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={activities.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>
    </div>
  );
};
