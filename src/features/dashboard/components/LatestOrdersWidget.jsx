import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { formatCurrency } from '@/utils/currency.utils';

const columns = [
  { header: 'Buyurtma #', accessor: 'orderNumber' },
  { header: 'Buyurtmachi Kompaniya', accessor: 'customerName' },
  { header: 'Kotyol Modeli', accessor: 'boilerModelName' },
  { header: 'Miqdori', accessor: 'quantity' },
  { header: 'Umumiy Summa', cell: (row) => formatCurrency(row.totalAmount) },
  { header: 'Hujjat Holati', cell: (row) => <StatusBadge status={row.status} /> },
];

export const LatestOrdersWidget = ({ orders = [] }) => {
  return (
    <Card title="So'nggi Kelib Tushgan Buyurtmalar">
      <Table columns={columns} data={orders.slice(0, 5)} />
    </Card>
  );
};
