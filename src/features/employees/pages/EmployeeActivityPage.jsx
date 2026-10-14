import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { EmployeeActivityTimeline } from '../components/EmployeeActivityTimeline';
import { employeesApi } from '../api/employeesApi';

export const EmployeeActivityPage = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    const res = await employeesApi.getEmployeeActivities();
    if (res.success) setActivities(res.data);
  };

  return (
    <div className="employee-activity-page animate-fade-in pb-5">

      <PageHeader
        title="Xodimlar Ish Faolligi va Harakatlar Jurnali"
        subtitle="Kadrlar bo'yicha barcha o'zgarishlar, maosh va rol yangilanishlari tarixi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Xodimlar', path: '/employees' },
          { label: 'Ish Faolligi' },
        ]}
      />

      <Card title="Kadrlar Operatsiyalari va O'zgarishlar Tarixi">
        <EmployeeActivityTimeline activities={activities} />
      </Card>
    </div>
  );
};
