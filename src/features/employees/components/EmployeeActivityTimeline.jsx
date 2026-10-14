import React from 'react';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { formatCurrency } from '@/utils/currency.utils';

const ACTION_MAP = {
  CREATE: "Yangi ma'lumot yaratildi",
  UPDATE: "Ma'lumotlar tahrirlandi",
  DELETE: "Ma'lumot o'chirildi",
};

const ENTITY_MAP = {
  'SALARY-TYPES': 'Oylik maosh turi',
  SALARY_TYPES: 'Oylik maosh turi',
  EMPLOYEES: 'Xodim kadrlar hisobi',
  POSITIONS: 'Lavozimlar katalogi',
  AUTH: 'Tizimga kirish',
};

const ACTION_ICONS = {
  CREATE: 'bi-plus-circle-fill',
  UPDATE: 'bi-pencil-square',
  DELETE: 'bi-trash-fill',
};

export const EmployeeActivityTimeline = ({ activities = [] }) => {
  const formattedItems = activities.map((act) => {
    const actionText = ACTION_MAP[act.action] || act.action || 'Operatsiya bajarildi';
    const entityText = ENTITY_MAP[act.entity_name] || act.entity_name || 'Tizim operatsiyasi';

    const title = act.title || `${entityText} — ${actionText}`;

    let timestamp = act.created_at || act.timestamp || '';
    if (timestamp) {
      try {
        const d = new Date(timestamp);
        timestamp = d.toLocaleString('uz-UZ', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        timestamp = String(timestamp);
      }
    }

    let description = act.description || '';
    if (!description && act.new_values) {
      const nv = act.new_values;
      const parts = [];
      if (nv.name) parts.push(`Nomi: "${nv.name}"`);
      if (nv.amount !== undefined && nv.amount !== null) {
        parts.push(`Narxi: ${formatCurrency(nv.amount)}`);
      }
      if (nv.full_name) parts.push(`Xodim: "${nv.full_name}"`);
      if (nv.role) parts.push(`Lavozim: "${nv.role}"`);
      description = parts.join(' | ');
    }

    if (!description) {
      description = `${entityText} bo'yicha ${actionText.toLowerCase()} amali bajarildi.`;
    }

    const icon = act.icon || ACTION_ICONS[act.action] || 'bi-clock-history';

    return {
      id: act.id,
      title,
      timestamp,
      description,
      icon,
    };
  });

  return <Timeline items={formattedItems} />;
};
