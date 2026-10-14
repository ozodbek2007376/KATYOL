import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '@/components/common/Card/Card';

export const FinanceCharts = ({ data = [] }) => {
  return (
    <Card title="Oylik Moliya Dinamikasi (Daromadlar, Xarajatlar va Sof Foyda Tahlili)">
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="month" stroke="var(--erp-text-muted)" fontSize={12} />
            <YAxis stroke="var(--erp-text-muted)" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--erp-card-bg)', borderColor: 'var(--erp-border)', borderRadius: '8px' }}
              formatter={(value) => [`$${value.toLocaleString()}`, '']}
            />
            <Area type="monotone" dataKey="income" name="Oylik Daromad" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expense" name="Oylik Xarajat" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
            <Area type="monotone" dataKey="profit" name="Sof Foyda" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
