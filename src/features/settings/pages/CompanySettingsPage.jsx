import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { Button } from '@/components/common/Button/Button';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { SettingsSubNav } from '../components/SettingsSubNav';
import { settingsApi } from '../api/settingsApi';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { ERP_ICONS } from '@/shared/icons';
import { getActiveCurrency } from '@/utils/currency.utils';

export const CompanySettingsPage = () => {

  const [formData, setFormData] = useState({
    name: 'Kotyol Manufacturing',
    phone: '+998 (90) 123-45-67',
    website: 'https://kotyol.uz',
    address: 'Toshkent sh., Chilonzor tumani, 5-daha',
    description: 'Yuqori sifatli isitish kotyollari ishlab chiqarish zavodi.',
    currency: getActiveCurrency(),
    timezone: 'Asia/Tashkent (UTC+5)',
    dateFormat: 'YYYY-MM-DD',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      const res = await settingsApi.getCompany();
      if (res.success && res.data) {
        setFormData(res.data);
      }
    };
    fetchCompanyData();
  }, []);

  const currencyOptions = dynamicSettingsService.getCurrencyOptions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await settingsApi.updateCompany(formData);
      if (res.success && res.data) {
        setFormData(res.data);
        setIsEditing(false);
        notifySuccess("Kompaniya rekvizitlari va sozlamalari saqlandi.");
      } else {
        notifyError("Kompaniya sozlamalarini saqlashda xatolik yuz berdi.");
      }
    } catch {
      notifyError("Kompaniya sozlamalarini saqlashda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  const cardAction = !isEditing && (
    <Button
      variant="outline-primary"
      size="sm"
      icon={ERP_ICONS.PENCIL}
      onClick={() => setIsEditing(true)}
    >
      Tahrirlash
    </Button>
  );

  return (
    <div className="company-settings-page animate-fade-in pb-5">
      <SettingsSubNav />

      <PageHeader
        title="Kompaniya Rekvizitlari va Sozlamalari"
        subtitle="Korxona rasmiy ma'lumotlari, valyutasi va vaqt mintaqasi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sozlamalar', path: '/settings' },
          { label: 'Kompaniya' },
        ]}
      />

      <Card title="Kompaniya Profil Sozlamalari" action={cardAction}>
        {!isEditing ? (
          <div className="row g-4 fs-7">
            <div className="col-12 col-md-6">
              <label className="text-muted-custom fs-8 d-block mb-1">Kompaniya Rasmiy Nomi</label>
              <div className="fw-semibold text-main fs-6">{formData.name || 'Kiritilmagan'}</div>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted-custom fs-8 d-block mb-1">Telefon Raqami</label>
              <div className="fw-semibold text-main fs-6">{formData.phone || 'Kiritilmagan'}</div>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted-custom fs-8 d-block mb-1">Rasmiy Vebsayt</label>
              <div className="fw-semibold text-main">{formData.website || '—'}</div>
            </div>
            <div className="col-12 col-md-6">
              <label className="text-muted-custom fs-8 d-block mb-1">Yuridik va Sex Manzili</label>
              <div className="fw-semibold text-main">{formData.address || '—'}</div>
            </div>
            <div className="col-12">
              <label className="text-muted-custom fs-8 d-block mb-1">Korxona Faoliyati Tavsifi</label>
              <div className="fw-semibold text-main p-3 rounded bg-body-custom border-custom">
                {formData.description || 'Kiritilmagan'}
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 rounded bg-body-custom border-custom text-center">
                <label className="text-muted-custom fs-8 d-block mb-1">Asosiy Hisob Valyutasi</label>
                <div className="fw-bold text-main fs-5">{formData.currency}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 rounded bg-body-custom border-custom text-center">
                <label className="text-muted-custom fs-8 d-block mb-1">Vaqt Mintaqasi</label>
                <div className="fw-semibold text-main">{formData.timezone}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 rounded bg-body-custom border-custom text-center">
                <label className="text-muted-custom fs-8 d-block mb-1">Sana Formati</label>
                <div className="fw-semibold text-main">{formData.dateFormat}</div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Input
                  label="Kompaniya Rasmiy Nomi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <Input
                  label="Telefon Raqami"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <Input
                  label="Rasmiy Vebsayt"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div className="col-12">
                <Input
                  label="Yuridik va Sex Manzili"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Korxona Faoliyati Tavsifi</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="col-12 col-md-4">
                <Select
                  label="Asosiy Hisob Valyutasi"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  options={currencyOptions}
                />
              </div>
              <div className="col-12 col-md-4">
                <Select
                  label="Vaqt Mintaqasi"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  options={[
                    { value: 'Asia/Tashkent (UTC+5)', label: 'Toshkent (UTC+5)' },
                    { value: 'UTC', label: 'UTC Universal' },
                  ]}
                />
              </div>
              <div className="col-12 col-md-4">
                <Select
                  label="Sana Formati"
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  options={[
                    { value: 'YYYY-MM-DD', label: '2026-07-20' },
                    { value: 'DD.MM.YYYY', label: '20.07.2026' },
                  ]}
                />
              </div>
              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Kompaniya Logotipi</label>
                <FileUpload label="Kompaniya logotipini yuklash uchun bosing" maxSizeMB={2} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-top border-custom d-flex justify-content-end gap-2">
              <Button type="button" variant="outline-secondary" onClick={() => setIsEditing(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading} icon={ERP_ICONS.CHECK}>
                Sozlamalarni Saqlash
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
