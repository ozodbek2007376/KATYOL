import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { notifySuccess } from '@/services/notification.service';
import { ERP_ICONS } from '@/shared/icons';
import { getActiveCurrency } from '@/utils/currency.utils';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [organizationName, setOrganizationName] = useState(user?.organizationName || '');
  const [branchName, setBranchName] = useState(user?.branchName || '');

  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateUserProfile({ name, phone, department, organizationName, branchName });
    notifySuccess("Profil ma'lumotlari muvaffaqiyatli saqlandi.");
    setIsEditModalOpen(false);
  };

  return (
    <div className="profile-page animate-fade-in">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-main mb-1">Foydalanuvchi Profili</h4>
          <p className="text-muted-custom fs-7 mb-0">Shaxsiy ma'lumotlar va tizim sozlamalari</p>
        </div>
        <Button variant="primary" size="sm" icon={ERP_ICONS.PENCIL} onClick={() => setIsEditModalOpen(true)}>
          Profilni Tahrirlash
        </Button>
      </div>

      <div className="row g-4">
        {/* Profile Card Header */}
        <div className="col-12 col-lg-4">
          <Card className="text-center p-3">
            <div
              className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold display-5 mb-3 mx-auto shadow-sm"
              style={{ width: '96px', height: '96px' }}
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <h5 className="fw-bold text-main mb-1">{user?.name || 'Foydalanuvchi'}</h5>
            <p className="text-muted-custom fs-7 mb-2">@{user?.username || ''}</p>
            <div className="mb-3">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2">
                {user?.role || 'Xodim'}
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="fs-8 text-muted-custom">Hisob holati:</span>
              <StatusBadge status={user?.status || 'ACTIVE'} />
            </div>
          </Card>
        </div>

        {/* Profile Details List */}
        <div className="col-12 col-lg-8">
          <Card title="Batafsil Foydalanuvchi Ma'lumotlari">
            <div className="row g-3 fs-7">
              <div className="col-12 col-sm-6">
                <label className="text-muted-custom fs-8 d-block mb-1">Foydalanuvchi nomi</label>
                <div className="fw-semibold text-main">{user?.username}</div>
              </div>
              <div className="col-12 col-sm-6">
                <label className="text-muted-custom fs-8 d-block mb-1">Telefon raqami</label>
                <div className="fw-semibold text-main">{user?.phone}</div>
              </div>
              <div className="col-12 col-sm-6">
                <label className="text-muted-custom fs-8 d-block mb-1">Bo'lim va Lavozim</label>
                <div className="fw-semibold text-main">{user?.department || 'Xodim'}</div>
              </div>
              <div className="col-12 col-sm-6">
                <label className="text-muted-custom fs-8 d-block mb-1">Tashkilot</label>
                <div className="fw-semibold text-main">{user?.organizationName || 'Mavjud emas'}</div>
              </div>
              <div className="col-12 col-sm-6">
                <label className="text-muted-custom fs-8 d-block mb-1">Filial</label>
                <div className="fw-semibold text-main">{user?.branchName || 'Mavjud emas'}</div>
              </div>
              <div className="col-12 col-sm-6">
                <label className="text-muted-custom fs-8 d-block mb-1">Asosiy Valyuta</label>
                <div className="fw-semibold text-main">{getActiveCurrency()}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Profil Ma'lumotlarini Tahrirlash"
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Saqlash
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave}>
          <Input label="Foydalanuvchi ismi (F.I.SH.)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Telefon raqami" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Bo'lim va strukturasi" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Input label="Tashkilot nomi" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
          <Input label="Filial nomi" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
        </form>
      </Modal>
    </div>
  );
};
