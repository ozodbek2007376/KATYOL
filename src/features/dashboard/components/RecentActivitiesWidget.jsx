import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Timeline } from '@/components/common/Timeline/Timeline';

export const RecentActivitiesWidget = ({ activities = [] }) => {
  const timelineItems = activities.map(a => ({
    id: a.id,
    title: a.title,
    description: `${a.user}: ${a.description}`,
    time: a.timestamp,
  }));

  return (
    <Card title="So'nggi Harakatlar va Operatsiyalar Jurnali">
      <Timeline items={timelineItems.slice(0, 5)} />
    </Card>
  );
};
