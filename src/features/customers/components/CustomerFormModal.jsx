import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { Button } from '@/components/common/Button/Button';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { useFormDraftStore } from '@/store/useFormDraftStore';
import { ROUTES } from '@/constants/routes.constants';
import { boilersApi } from '@/features/boilers';
import { LuChevronDown, LuChevronUp, LuSlidersHorizontal, LuFileCheck, LuShoppingCart, LuCalendar, LuDollarSign, LuShieldAlert, LuSearch } from 'react-icons/lu';

export const CustomerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  customer = null,
}) => {
  const FORM_KEY = customer ? `draft_customer_${customer.id}` : 'draft_customer_new';
  const { saveDraft, getDraft, clearDraft } = useFormDraftStore();

  const [customerTypeOptions, setCustomerTypeOptions] = useState(dynamicSettingsService.getCustomerTypeOptions());
  const [regionOptions, setRegionOptions] = useState(dynamicSettingsService.getRegionOptions());

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  // Boiler selector states
  const [boilerOptions, setBoilerOptions] = useState([]);
  const [isBoilerDropdownOpen, setIsBoilerDropdownOpen] = useState(false);
  const [boilerSearch, setBoilerSearch] = useState('');
  const boilerRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDeliveryStr = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerTypeId: customerTypeOptions[0]?.value || '',
    customerName: '',
    phone: '',
    altPhone: '',
    email: '',
    tin: '',
    passport: '',
    region: regionOptions[0]?.value || 'Toshkent shahri',
    district: '',
    address: '',
    notes: '',
    boilerModelName: '',
    totalAmount: '',
    depositAmount: '',
    orderDate: todayStr,
    deliveryDate: defaultDeliveryStr,
    autoDiscountOnLate: true,
    lateDiscountRate: 0.5,
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (isOpen) {
      boilersApi.getBoilers().then((res) => {
        if (res?.success) {
          setBoilerOptions(res.data || []);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boilerRef.current && !boilerRef.current.contains(event.target)) {
        setIsBoilerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (customer) {
      setFormData({
        customerTypeId: customer.customerTypeId || (customerTypeOptions[0]?.value || ''),
        customerName: customer.customerName || '',
        phone: customer.phone || '',
        altPhone: customer.altPhone || '',
        email: customer.email || '',
        tin: customer.tin || '',
        passport: customer.passport || '',
        region: customer.region || 'Toshkent shahri',
        district: customer.district || '',
        address: customer.address || '',
        notes: customer.notes || '',
        boilerModelName: customer.boilerModelName || '',
        totalAmount: customer.totalAmount !== undefined ? customer.totalAmount : '',
        depositAmount: customer.depositAmount !== undefined ? customer.depositAmount : '',
        orderDate: customer.orderDate || todayStr,
        deliveryDate: customer.deliveryDate || defaultDeliveryStr,
        autoDiscountOnLate: customer.autoDiscountOnLate !== undefined ? customer.autoDiscountOnLate : true,
        lateDiscountRate: customer.lateDiscountRate !== undefined ? customer.lateDiscountRate : 0.5,
        status: customer.status || 'ACTIVE',
      });
      setIsDraftRestored(false);
    } else if (isOpen) {
      const savedDraft = getDraft(FORM_KEY);
      if (savedDraft) {
        setFormData(savedDraft);
        setIsDraftRestored(true);
      } else {
        setFormData({
          customerTypeId: customerTypeOptions[0]?.value || '',
          customerName: '',
          phone: '',
          altPhone: '',
          email: '',
          tin: '',
          passport: '',
          region: 'Toshkent shahri',
          district: '',
          address: '',
          notes: '',
          boilerModelName: '',
          totalAmount: '',
          depositAmount: '',
          orderDate: todayStr,
          deliveryDate: defaultDeliveryStr,
          autoDiscountOnLate: true,
          lateDiscountRate: 0.5,
          status: 'ACTIVE',
        });
        setIsDraftRestored(false);
      }
      setShowAdvanced(false);
    }
  }, [customer, isOpen]);

  // Real-time draft auto-save
  const handleFieldChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (!customer) {
      saveDraft(FORM_KEY, updated);
    }
  };

  const handleAddNewCustomerType = (newRecord) => {
    const newCT = { value: `ctype_${Date.now()}`, label: newRecord.name };
    setCustomerTypeOptions((prev) => [...prev, newCT]);
    handleFieldChange('customerTypeId', newCT.value);
    return newCT;
  };

  const handleAddNewRegion = (newRecord) => {
    const newReg = { value: newRecord.name, label: newRecord.name };
    setRegionOptions((prev) => [...prev, newReg]);
    handleFieldChange('region', newReg.value);
    return newReg;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedType = customerTypeOptions.find((ct) => ct.value === formData.customerTypeId);

    clearDraft(FORM_KEY);
    onSubmit({
      ...formData,
      customerTypeName: selectedType ? selectedType.label : '',
    });
  };

  const selectedBoilers = formData.boilerModelName
    ? formData.boilerModelName.split(', ').filter(Boolean)
    : [];

  const handleToggleBoiler = (modelName) => {
    let updated;
    if (selectedBoilers.includes(modelName)) {
      updated = selectedBoilers.filter((name) => name !== modelName);
    } else {
      updated = [...selectedBoilers, modelName];
    }
    handleFieldChange('boilerModelName', updated.join(', '));
  };

  const filteredBoilers = boilerOptions.filter((b) =>
    (b.modelName || '').toLowerCase().includes(boilerSearch.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2">
          <span>{customer ? "Mijoz Ma'lumotlarini Tahrirlash" : "Yangi Mijoz va Buyurtma Qo'shish"}</span>
          {isDraftRestored && (
            <span className="badge bg-success bg-opacity-10 text-success fs-8 d-flex align-items-center gap-1">
              <LuFileCheck /> Qoralama saqlangan ma'lumotdan tiklandi
            </span>
          )}
        </div>
      }
      size="xl"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {customer ? 'Saqlash' : "Mijoz va Zakladni Saqlash"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Core Primary Fields */}
        <div className="row g-3 mb-3">
          {/* Dynamic Customer Type Select */}
          <div className="col-12 col-md-4">
            <DynamicSelect
              label="Mijoz Turi"
              value={formData.customerTypeId}
              onChange={(e) => handleFieldChange('customerTypeId', e.target.value)}
              options={customerTypeOptions}
              managePath={`${ROUTES.PROTECTED.MASTER_DATA}?type=customerTypes`}
              onAddNew={handleAddNewCustomerType}
              entityTitle="Mijoz Turi"
              required
            />
          </div>

          <div className="col-12 col-md-5">
            <Input
              label="Mijoz F.I.SH / Korxona Nomi"
              placeholder="Orienta Sanoat MCHJ yoki Alisher Qodirov"
              value={formData.customerName}
              onChange={(e) => handleFieldChange('customerName', e.target.value)}
              required
            />
          </div>

          <div className="col-12 col-md-3">
            <Input
              label="Asosiy Telefon Raqami"
              type="tel"
              placeholder="+998 90 123 45 67"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Dedicated Order, Deposit & Delivery Dates Section */}
        <div className="card glass-card p-3 mb-3 border-primary bg-primary bg-opacity-10">
          <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
            <LuShoppingCart />
            <span>Buyurtma, Zaklad va Muddatlar (Shartnoma):</span>
          </h6>

          <div className="row g-3">
            <div className="col-12 col-md-4 position-relative" ref={boilerRef}>
              <label className="form-label fs-7 fw-medium text-main mb-1">
                Kotyol Modellari
              </label>
              <button
                type="button"
                className="form-control text-start fs-7 d-flex align-items-center justify-content-between border-custom bg-body-custom text-main"
                onClick={() => setIsBoilerDropdownOpen(!isBoilerDropdownOpen)}
                style={{
                  height: '40px',
                  paddingLeft: '0.85rem',
                  paddingRight: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <span className="text-truncate">
                  {selectedBoilers.length > 0
                    ? selectedBoilers.join(', ')
                    : "Kotyol tanlang..."}
                </span>
                <LuChevronDown className="fs-6 text-muted-custom flex-shrink-0 ms-2" />
              </button>

              {isBoilerDropdownOpen && (
                <div
                  className="dropdown-menu show w-100 p-2 shadow-lg border-custom bg-body-custom animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 1070,
                  }}
                >
                  {/* Sticky Search Bar inside Dropdown */}
                  <div className="input-group input-group-sm mb-2">
                    <span className="input-group-text bg-body-custom border-custom text-muted-custom">
                      <LuSearch className="fs-7" />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-body-custom text-main border-custom fs-8"
                      placeholder="Qidirish..."
                      value={boilerSearch}
                      onChange={(e) => setBoilerSearch(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Scrollable Checklist Options */}
                  <div className="options-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredBoilers.length > 0 ? (
                      filteredBoilers.map((boiler) => {
                        const isChecked = selectedBoilers.includes(boiler.modelName);
                        return (
                          <div
                            key={boiler.id}
                            className="d-flex align-items-center gap-2 dropdown-item rounded-2 py-2 px-3 fs-7 mb-1 text-main"
                            onClick={() => handleToggleBoiler(boiler.modelName)}
                            style={{ cursor: 'pointer' }}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input-custom"
                              checked={isChecked}
                              readOnly
                              style={{
                                cursor: 'pointer',
                                width: '15px',
                                height: '15px',
                                accentColor: 'var(--bs-primary)',
                              }}
                            />
                            <span className="text-truncate text-main" style={{ cursor: 'pointer', userSelect: 'none' }}>
                              {boiler.modelName}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-3 text-muted-custom fs-8">
                        Ma'lumot topilmadi
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="col-12 col-md-4">
              <Input
                label="Kotyol Shartnoma Narxi"
                type="number"
                placeholder="18000000"
                value={formData.totalAmount}
                onChange={(e) => handleFieldChange('totalAmount', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <Input
                label="Zaklad Miqdori (Avans)"
                type="number"
                placeholder="5000000"
                value={formData.depositAmount}
                onChange={(e) => handleFieldChange('depositAmount', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Input
                label="Zakaz Berilgan Sana"
                type="date"
                value={formData.orderDate}
                onChange={(e) => handleFieldChange('orderDate', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Input
                label="Yetib Borishi Kerak Bo'lgan Sana (Reja)"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
              />
            </div>

            {/* Late Delivery Automatic Discount Toggle */}
            <div className="col-12">
              <div className="p-3 rounded border bg-body-custom">
                <div className="form-check form-switch d-flex align-items-center gap-2 mb-0">
                  <input
                    className="form-check-input ms-0 cursor-pointer"
                    type="checkbox"
                    id="autoDiscountSwitch"
                    checked={formData.autoDiscountOnLate}
                    onChange={(e) => handleFieldChange('autoDiscountOnLate', e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold text-main cursor-pointer" htmlFor="autoDiscountSwitch">
                    Sanadan o'tib ketsa avtomatik kotyol narxi arzonlashsin (Kechikish chegirmasi)
                  </label>
                </div>

                {formData.autoDiscountOnLate && (
                  <div className="mt-2 pt-2 border-top border-custom text-muted fs-8 d-flex align-items-center gap-2 flex-wrap">
                    <LuShieldAlert className="text-warning fs-6" />
                    <span>Belgilangan sanadan kechikkan har bir kun uchun chegirma:</span>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-sm text-center fw-bold"
                      style={{ width: '80px' }}
                      value={formData.lateDiscountRate}
                      onChange={(e) => handleFieldChange('lateDiscountRate', e.target.value)}
                    />
                    <span>% / kun (Misol: 0.5% chegirma / kun kechikishda kotyol narxidan ayiriladi).</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Section for Progressive Disclosure */}
        <div className="border-custom rounded-3 p-2 mb-3 bg-body-custom">
          <button
            type="button"
            className="btn btn-link text-decoration-none text-main fs-7 fw-semibold d-flex align-items-center justify-content-between w-100 p-1"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="d-flex align-items-center gap-2">
              <LuSlidersHorizontal className="text-primary" />
              <span>Qo'shimcha Rekvizitlar (Manzil, Pasport, Shartnoma Izohi)</span>
            </div>
            {showAdvanced ? <LuChevronUp /> : <LuChevronDown />}
          </button>

          {showAdvanced && (
            <div className="row g-3 pt-3 border-top border-custom mt-2">
              <div className="col-12 col-md-6">
                <Input
                  label="Qo'shimcha Telefon Raqami"
                  type="tel"
                  placeholder="+998 71 200 11 22"
                  value={formData.altPhone}
                  onChange={(e) => handleFieldChange('altPhone', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  options={[
                    { value: 'ACTIVE', label: 'Faol — Hamkorlikda' },
                    { value: 'INACTIVE', label: 'Nofaol' },
                  ]}
                />
              </div>

              {/* Dynamic Region Select */}
              <div className="col-12 col-md-4">
                <DynamicSelect
                  label="Viloyat / Hudud"
                  value={formData.region}
                  onChange={(e) => handleFieldChange('region', e.target.value)}
                  options={regionOptions}
                  managePath={ROUTES.PROTECTED.SETTINGS}
                  onAddNew={handleAddNewRegion}
                  entityTitle="Viloyat"
                />
              </div>

              <div className="col-12 col-md-4">
                <Input
                  label="Tuman / Shahar"
                  placeholder="Yakkasaroy tumani"
                  value={formData.district}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <Input
                  label="Ko'cha va Uy Manzili"
                  placeholder="Shota Rustaveli ko'chasi, 45-uy"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Shartnoma Izohi va Eslatmalar</label>
                <textarea
                  className="form-control fs-7"
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Xarid afzalliklari yoki maxsus shartlar..."
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Shartnoma, Pasport va Soliq Hujjatlarini Yuklash</label>
                <FileUpload label="Mijoz hujjatlarini yuklash" maxSizeMB={5} />
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
