import React, { useState, useEffect } from 'react';
import { LuPlus, LuClipboardCheck } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { InventoryCountModal } from '../components/InventoryCountModal';
import { warehouseApi } from '../api/warehouseApi';
import { notifySuccess } from '@/services/notification.service';

export const InventoryCountPage = () => {
  const [counts, setCounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCountsData();
  }, []);

  const loadCountsData = async () => {
    try {
      const [cntRes, stockRes] = await Promise.all([
        warehouseApi.getInventoryCounts(),
        warehouseApi.getCurrentStock(),
      ]);
      setCounts(cntRes?.data || []);
      setProducts(stockRes?.data || []);
    } catch (err) {
      console.error(err);
      setCounts([]);
      setProducts([]);
    }
  };

  const handleCreateCount = async (formData) => {
    try {
      const res = await warehouseApi.createInventoryCount(formData);
      notifySuccess(res?.message || "Sanoq saqlandi.");
      setIsModalOpen(false);
      await loadCountsData();
    } catch (err) {
      console.error(err);
      setIsModalOpen(false);
    }
  };

  const columns = [
    { header: 'Mahsulot Nomi', accessor: 'productName' },
    {
      header: 'Tizim Miqdori',
      cell: (row) => <span>{row.systemQuantity} {row.unitName}</span>,
    },
    {
      header: 'Sanalgan Miqdor',
      cell: (row) => <strong className="text-main">{row.actualQuantity} {row.unitName}</strong>,
    },
    {
      header: 'Farq',
      cell: (row) => (
        <span className={`fw-bold ${row.difference < 0 ? 'text-danger' : row.difference > 0 ? 'text-success' : 'text-main'}`}>
          {row.difference > 0 ? `+${row.difference}` : row.difference} {row.unitName}
        </span>
      ),
    },
    { header: 'Sanoq Sababi', accessor: 'reason' },
    {
      header: 'Status',
      cell: (row) => <span className="badge bg-success bg-opacity-10 text-success">Moslashtirildi</span>,
    },
    { header: 'Sana', accessor: 'countDate' },
  ];

  return (
    <div className="inventory-count-page animate-fade-in pb-5">

      <PageHeader
        title="Inventarizatsiya va Sanoq Natijalari"
        subtitle="Ombordagi fizik sanoq miqdorini tizimdagi balans bilan solishtirish va avtomatik moslashtirish"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Omborxona', path: '/warehouse' },
          { label: 'Inventarizatsiya' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <LuPlus className="me-1" /> Sanoq Natijasini Kiritish
          </Button>
        }
      />

      <Card title={`Bajarilgan Inventarizatsiya Sanoqlari Reyestri (${counts.length} ta)`}>
        <Table columns={columns} data={counts} />
      </Card>

      <InventoryCountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCount}
        products={products}
      />
    </div>
  );
};
