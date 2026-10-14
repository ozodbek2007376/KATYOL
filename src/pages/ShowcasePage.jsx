import React, { useState } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { Modal } from '@/components/common/Modal/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { useNotificationStore } from '@/store/useNotificationStore';

export const ShowcasePage = () => {
  const { addNotification } = useNotificationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const sampleTableData = [
    { id: '1', code: 'PRD-001', name: 'KV-200 Sanoat Kotyoli', status: 'Faol', price: '$12,500' },
    { id: '2', code: 'PRD-002', name: 'KV-500 Pechi', status: 'Jarayonda', price: '$28,000' },
  ];

  const sampleColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Kod', accessor: 'code' },
    { header: 'Nomi', accessor: 'name' },
    { header: 'Status', accessor: 'status' },
    { header: 'Narxi', accessor: 'price' },
  ];

  return (
    <div className="showcase-page animate-fade-in pb-5">
      <PageHeader
        title="Dizayn Sistemasi va Komponentlar Integratsiyasi"
        subtitle="KotyoI ERP loyihasi uchun barcha qayta ishlatiluvchi UI elementlar va vizual standartlar"
      />

      <FilterBar
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: "Kalit so'z bo'yicha qidiruv...",
        }}
        onReset={() => setSearchValue('')}
      />

      <Card title="Tizim Bildirishnomalari" className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-success"
            onClick={() => addNotification({ type: 'success', title: 'Muvaffaqiyatli!', message: 'Amal muvaffaqiyatli bajarildi' })}
          >
            Muvaffaqiyatli Xabar
          </button>
          <button
            className="btn btn-danger"
            onClick={() => addNotification({ type: 'error', title: 'Xatolik!', message: 'Tizimda xatolik yuz berdi' })}
          >
            Xatolik Xabari
          </button>
          <button
            className="btn btn-warning text-dark"
            onClick={() => addNotification({ type: 'warning', title: 'Ogohlantirish!', message: "Iltimos, ma'lumotlarni tekshiring" })}
          >
            Ogohlantirish Xabari
          </button>
        </div>
      </Card>

      <Card title="Tugmalar va Amallar" className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-primary">Asosiy Tugma</button>
          <button className="btn btn-secondary">Ikkinchi Darajali</button>
          <button className="btn btn-outline-primary">Ramkali Tugma</button>
          <button className="btn btn-danger" onClick={() => setIsConfirmOpen(true)}>
            O'chirish Tugmasi
          </button>
          <button className="btn btn-success" onClick={() => setIsModalOpen(true)}>
            Modal Paneli Ochish
          </button>
        </div>
      </Card>

      <Card title="Forma Boshqaruv Elementlari" className="mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <Input label="Mahsulot Nomi" placeholder="Nomi kiriting..." />
          </div>
          <div className="col-md-6">
            <Select
              label="Kategoriya"
              options={[
                { value: '1', label: 'Sanoat Pechlari' },
                { value: '2', label: 'Ehtiyot Qismlar' },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card title="Smart Jadval Komponenti">
        <Table columns={sampleColumns} data={sampleTableData} tableKey="showcase_table" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Test Modal Oyag'i">
        <p className="fs-7 text-main mb-0">Ushbu modal oyna qayta ishlatiluvchi Modal komponenti orqali yaratilgan.</p>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => setIsConfirmOpen(false)}
        title="O'chirishni Tasdiqlash"
        message="Haqiqatan ham ushbu ma'lumotni o'chirmoqchimisiz?"
      />
    </div>
  );
};
