import React, { useState, useEffect } from 'react';
import { LuPlus, LuBadgeDollarSign } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { RevaluationFormModal } from '../components/RevaluationFormModal';
import { warehouseApi } from '../api/warehouseApi';
import { notifySuccess } from '@/services/notification.service';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency.utils';

export const RevaluationPage = () => {
  const [revaluations, setRevaluations] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadRevaluationsData();
  }, []);

  const loadRevaluationsData = async () => {
    try {
      const [revRes, stockRes] = await Promise.all([
        warehouseApi.getRevaluations(),
        warehouseApi.getCurrentStock(),
      ]);
      setRevaluations(revRes?.data || []);
      setProducts(stockRes?.data || []);
    } catch (err) {
      console.error(err);
      setRevaluations([]);
      setProducts([]);
    }
  };

  const handleCreateRevaluation = async (formData) => {
    try {
      const res = await warehouseApi.createRevaluation(formData);
      notifySuccess(res?.message || "Qayta baholash saqlandi.");
      setIsModalOpen(false);
      await loadRevaluationsData();
    } catch (err) {
      console.error(err);
      setIsModalOpen(false);
    }
  };

  const columns = [
    { header: 'Mahsulot Nomi', accessor: 'productName' },
    {
      header: `Oldingi Narx (${getCurrencySymbol()})`,
      cell: (row) => <span>{formatCurrency(row.previousPrice)}</span>,
    },
    {
      header: `Yangi Narx (${getCurrencySymbol()})`,
      cell: (row) => <strong className="text-primary">{formatCurrency(row.newPrice)}</strong>,
    },
    {
      header: 'Farq',
      cell: (row) => (
        <span className={`fw-bold ${row.priceDifference >= 0 ? 'text-success' : 'text-danger'}`}>
          {row.priceDifference >= 0 ? `+${formatCurrency(row.priceDifference)}` : `-${formatCurrency(Math.abs(row.priceDifference))}`}
        </span>
      ),
    },
    { header: 'Qayta Baholash Sababi', accessor: 'reason' },
    { header: 'Bajaruvchi Xodim', accessor: 'createdBy' },
    { header: 'Sana', accessor: 'createdDate' },
  ];

  return (
    <div className="revaluation-page animate-fade-in pb-5">

      <PageHeader
        title="Qayta Baholash Jurnali"
        subtitle="Xomashyo va mahsulotlar birlik tannarxini bozor narxlariga mos ravishda qayta baholash"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Omborxona', path: '/warehouse' },
          { label: 'Qayta Baholash' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <LuPlus className="me-1" /> Yangi Qayta Baholash
          </Button>
        }
      />

      <Card title={`Amalga Oshirilgan Qayta Baholash Hujjatlari (${revaluations.length} ta)`}>
        <Table columns={columns} data={revaluations} />
      </Card>

      <RevaluationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRevaluation}
        products={products}
      />
    </div>
  );
};
