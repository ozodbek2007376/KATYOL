import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/common/Card/Card';

export const ProductionWarehouseChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { category: 'Kotyol K-50', production: 12, warehouse: 8 },
    { category: 'Kotyol K-100', production: 18, warehouse: 12 },
    { category: 'Aksessuarlar', production: 45, warehouse: 30 },
  ];

  return (
    <Card title="Kategoriyalar Bo'yicha Ishlab Chiqarish va Ombor Zaxiralari">
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-border-color)" />
            <XAxis dataKey="category" stroke="var(--erp-text-muted)" fontSize={12} />
            <YAxis stroke="var(--erp-text-muted)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--erp-bg-card)',
                borderColor: 'var(--erp-border-color)',
                color: 'var(--erp-text-main)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar name="Ishlab Chiqarilgan" dataKey="production" fill="var(--erp-primary)" radius={[4, 4, 0, 0]} />
            <Bar name="Omborda Mavjud" dataKey="warehouse" fill="var(--erp-info)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
