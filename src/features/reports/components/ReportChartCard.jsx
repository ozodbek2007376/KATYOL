import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card } from '@/components/common/Card/Card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportChartCard = ({
  title,
  type = 'bar', // 'bar' | 'line' | 'pie'
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  height = 320,
  barColor = '#3b82f6',
  lineColor = '#10b981',
}) => {
  return (
    <Card title={title}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey={nameKey} stroke="var(--erp-text-muted)" fontSize={12} />
              <YAxis stroke="var(--erp-text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--erp-card-bg)', borderColor: 'var(--erp-border)', borderRadius: '8px' }}
              />
              <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey={nameKey} stroke="var(--erp-text-muted)" fontSize={12} />
              <YAxis stroke="var(--erp-text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--erp-card-bg)', borderColor: 'var(--erp-border)', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey={dataKey} stroke={lineColor} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--erp-card-bg)', borderColor: 'var(--erp-border)', borderRadius: '8px' }}
              />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
