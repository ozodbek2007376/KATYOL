import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/api/axiosInstance';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { Button } from '@/components/common/Button/Button';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import { CalculationBreakdown } from '@/components/common/CalculationBreakdown/CalculationBreakdown';
import { ordersApi } from '../api/ordersApi';
import { employeesApi } from '@/features/employees/api/employeesApi';
import { businessRulesService } from '@/services/businessRules.service';
import { documentNumberingService } from '@/services/documentNumbering.service';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { ROUTES } from '@/constants/routes.constants';
import { LuChevronDown, LuChevronUp, LuSlidersHorizontal, LuBoxes, LuBookmarkCheck, LuUserCheck } from 'react-icons/lu';

export const OrderFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  order = null,
  customers = [],
  boilers = [],
}) => {
  const [customerOptions, setCustomerOptions] = useState(customers.map((c) => ({ value: c.id, label: c.customerName || c.name })));
  const [boilerOptions, setBoilerOptions] = useState(boilers.map((b) => ({ value: b.id, label: `${b.modelName} v${b.version}` })));
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [customerList, setCustomerList] = useState(customers);
  const [boilerList, setBoilerList] = useState(boilers);
  const [employeeList, setEmployeeList] = useState([]);

  const [priorityOptions, setPriorityOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availabilityCheck, setAvailabilityCheck] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const res = await employeesApi.getEmployees();
    if (res.success && Array.isArray(res.data)) {
      setEmployeeList(res.data);
      setEmployeeOptions(res.data.map((e) => ({ value: e.id, label: `${e.fullName} (${e.positionName || 'Xodim'})` })));
    }
  };

  useEffect(() => {
    setCustomerOptions(customers.map((c) => ({ value: c.id, label: c.customerName || c.name })));
    setCustomerList(customers);
    setBoilerOptions(boilers.map((b) => ({ value: b.id, label: `${b.modelName} v${b.version}` })));
    setBoilerList(boilers);
  }, [customers, boilers]);

  useEffect(() => {
    if (isOpen) {
      axiosInstance.get('/master-data/priorities')
        .then((res) => {
          const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          if (items.length > 0) {
            setPriorityOptions(items.map((p) => ({ value: p.code || p.id, label: p.name })));
          } else {
            setPriorityOptions(dynamicSettingsService.getOrderPriorityOptions());
          }
        })
        .catch(() => {
          setPriorityOptions(dynamicSettingsService.getOrderPriorityOptions());
        });

      axiosInstance.get('/master-data/order-statuses')
        .then((res) => {
          const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          if (items.length > 0) {
            setStatusOptions(items.map((st) => ({ value: st.code || st.id, label: st.name })));
          } else {
            setStatusOptions(dynamicSettingsService.getOrderStatusOptions());
          }
        })
        .catch(() => {
          setStatusOptions(dynamicSettingsService.getOrderStatusOptions());
        });
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    orderNumber: '',
    orderName: '',
    orderDate: new Date().toISOString().split('T')[0],
    customerId: '',
    boilerId: '',
    quantity: 1,
    depositAmount: 5000000,
    priority: 'MEDIUM',
    expectedDeliveryDate: '',
    autoDiscountOnLate: true,
    lateDiscountRate: 0.5,
    assignedEmployeeId: '',
    assignedEmployeeName: '',
    notes: '',
    isReserved: false,
    status: 'PENDING',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        orderNumber: order.orderNumber || '',
        orderName: order.orderName || '',
        orderDate: order.orderDate || new Date().toISOString().split('T')[0],
        customerId: order.customerId || (customerOptions[0]?.value || ''),
        boilerId: order.boilerId || (boilerOptions[0]?.value || ''),
        quantity: order.quantity || 1,
        depositAmount: order.depositAmount !== undefined ? order.depositAmount : 5000000,
        priority: order.priority || 'MEDIUM',
        expectedDeliveryDate: order.expectedDeliveryDate || '',
        autoDiscountOnLate: order.autoDiscountOnLate !== undefined ? order.autoDiscountOnLate : true,
        lateDiscountRate: order.lateDiscountRate !== undefined ? order.lateDiscountRate : 0.5,
        assignedEmployeeId: order.assignedEmployeeId || '',
        assignedEmployeeName: order.assignedEmployeeName || '',
        notes: order.notes || '',
        isReserved: order.isReserved || false,
        status: order.status || 'PENDING',
      });
    } else if (isOpen) {
      const autoNum = documentNumberingService.generateNumber('ORDERS');
      const firstCust = customerList[0];
      const firstBoil = boilerList[0];

      const d = new Date();
      d.setDate(d.getDate() + 14);
      const deliveryDateStr = d.toISOString().split('T')[0];

      setFormData({
        orderNumber: autoNum,
        orderName: '',
        orderDate: new Date().toISOString().split('T')[0],
        customerId: firstCust ? firstCust.id : '',
        boilerId: firstBoil ? firstBoil.id : '',
        quantity: 1,
        depositAmount: 5000000,
        priority: 'MEDIUM',
        expectedDeliveryDate: deliveryDateStr,
        autoDiscountOnLate: true,
        lateDiscountRate: 0.5,
        assignedEmployeeId: '',
        assignedEmployeeName: '',
        notes: '',
        isReserved: true,
        status: 'PENDING',
      });
      setShowAdvanced(false);
    }
  }, [order, isOpen]);

  // Live Auto Availability Check & Cost Calculation
  useEffect(() => {
    if (formData.boilerId && formData.quantity > 0) {
      runAvailabilityCheck();
    }
  }, [formData.boilerId, formData.quantity]);

  const runAvailabilityCheck = async () => {
    const res = await ordersApi.checkBoilerOrderAvailability(formData.boilerId, formData.quantity);
    if (res) {
      setAvailabilityCheck(res);
    }
  };

  const handleAddNewCustomer = (newRecord) => {
    const newCust = { id: `c_${Date.now()}`, name: newRecord.name };
    setCustomerList((prev) => [...prev, newCust]);
    const opt = { value: newCust.id, label: newCust.name };
    setCustomerOptions((prev) => [...prev, opt]);
    setFormData((prev) => ({ ...prev, customerId: opt.value }));
    return opt;
  };

  const handleAddNewBoiler = (newRecord) => {
    const newBoil = { id: `boiler_${Date.now()}`, modelName: newRecord.name, version: '1.0', basePrice: 15000 };
    setBoilerList((prev) => [...prev, newBoil]);
    const opt = { value: newBoil.id, label: `${newBoil.modelName} v1.0` };
    setBoilerOptions((prev) => [...prev, opt]);
    setFormData((prev) => ({ ...prev, boilerId: opt.value }));
    return opt;
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.boilerId || formData.quantity <= 0) return;

    const selectedCust = customerList.find((c) => c.id === formData.customerId);
    const selectedBoil = boilerList.find((b) => b.id === formData.boilerId);
    const selectedEmp = employeeList.find((e) => String(e.id) === String(formData.assignedEmployeeId));

    const unitPrice = availabilityCheck ? availabilityCheck.unitPrice : (selectedBoil?.basePrice || 15000);
    const totalAmount = availabilityCheck ? availabilityCheck.totalAmount : (unitPrice * formData.quantity);

    onSubmit({
      ...formData,
      customerName: selectedCust ? selectedCust.name : '',
      boilerModelName: selectedBoil ? selectedBoil.modelName : '',
      unitPrice,
      totalAmount,
      assignedEmployeeName: selectedEmp ? selectedEmp.fullName : formData.assignedEmployeeName,
    });
  };

  const selectedBoiler = boilerList.find((b) => b.id === formData.boilerId);
  const rawTotal = (availabilityCheck?.totalAmount) || ((selectedBoiler?.basePrice || 15000) * formData.quantity);


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? "Buyurtmani Tahrirlash" : "Yangi Buyurtma Rasmiylashtirish"}
      size="xl"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {order ? 'Saqlash' : "Buyurtmani Rasmiylashtirish"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Core Primary Fields */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-4">
            <Input
              label="Buyurtma Nomi / Hujjat №"
              placeholder="Masalan: Navoiy Azot Uchun Kotyol"
              value={formData.orderName}
              onChange={(e) => handleFieldChange('orderName', e.target.value)}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label="Zakaz Berilgan Sana"
              type="date"
              value={formData.orderDate}
              onChange={(e) => handleFieldChange('orderDate', e.target.value)}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <DynamicSelect
              label="Buyurtma Statusi"
              value={formData.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              options={statusOptions}
              managePath={`${ROUTES.PROTECTED.MASTER_DATA}?type=orderStatuses`}
              entityTitle="Status"
            />
          </div>
        </div>

        <div className="row g-3 mb-3">
          {/* Dynamic Customer Select */}
          <div className="col-12 col-md-4">
            <DynamicSelect
              label="Buyurtmachi Mijoz Korxona"
              value={formData.customerId}
              onChange={(e) => handleFieldChange('customerId', e.target.value)}
              options={customerOptions}
              managePath={ROUTES.PROTECTED.CUSTOMERS}
              onAddNew={handleAddNewCustomer}
              entityTitle="Mijoz"
              required
            />
          </div>

          {/* Dynamic Boiler Model Select */}
          <div className="col-12 col-md-5">
            <DynamicSelect
              label="Kotyol Modeli"
              value={formData.boilerId}
              onChange={(e) => handleFieldChange('boilerId', e.target.value)}
              options={boilerOptions}
              managePath={ROUTES.PROTECTED.BOILERS}
              onAddNew={handleAddNewBoiler}
              entityTitle="Kotyol Modeli"
              required
            />
          </div>

          <div className="col-12 col-md-3">
            <Input
              label="Buyurtma Miqdori (dona)"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleFieldChange('quantity', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Assigned Employee (Xodim Biriktirish) Row */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Biriktirilgan Mas'ul Xodim"
              value={formData.assignedEmployeeId}
              onChange={(e) => {
                const empId = e.target.value;
                const matched = employeeList.find((emp) => String(emp.id) === String(empId));
                setFormData((prev) => ({
                  ...prev,
                  assignedEmployeeId: empId,
                  assignedEmployeeName: matched ? matched.fullName : '',
                }));
              }}
              options={employeeOptions}
              managePath={ROUTES.PROTECTED.EMPLOYEES}
              entityTitle="Xodim"
            />
          </div>

          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Prioritet"
              value={formData.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value)}
              options={priorityOptions}
              managePath={`${ROUTES.PROTECTED.MASTER_DATA}?type=priorities`}
              entityTitle="Prioritet"
            />
          </div>
        </div>

        {/* Automatic Read-Only Material & Cost Availability Check Card */}
        {availabilityCheck && (
          <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 mb-3 fs-7">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold text-primary d-flex align-items-center gap-1 font-heading">
                <LuBoxes /> Avtomatik Resurs va Materiallar Yetarliligi Tekshiruvi
              </span>
              <span className={`badge ${availabilityCheck.materialAvailabilityStatus === 'AVAILABLE' ? 'bg-success' : 'bg-warning text-dark'} fs-8`}>
                {availabilityCheck.materialAvailabilityStatus === 'AVAILABLE' ? 'Materiallar Mavjud' : 'Qisman Yetarli'}
              </span>
            </div>

            <div className="row g-2 text-main">
              <div className="col-6 col-md-3">
                <small className="text-muted-custom d-block">Retsept Versiyasi:</small>
                <strong>v{availabilityCheck.recipeVersion} ({availabilityCheck.recipeName || 'Standart'})</strong>
              </div>
              <div className="col-6 col-md-3">
                <small className="text-muted-custom d-block">Taxminiy Ishlab Chiqarish:</small>
                <strong>{availabilityCheck.estimatedProductionDays} ish kuni</strong>
              </div>
              <div className="col-6 col-md-3">
                <small className="text-muted-custom d-block">1 Birlik Narxi:</small>
                <strong>{formatCurrency(availabilityCheck.unitPrice)}</strong>
              </div>
              <div className="col-6 col-md-3 text-end">
                <small className="text-muted-custom d-block">Baza Summasi:</small>
                <strong className="text-primary fs-6">{formatCurrency(availabilityCheck.totalAmount)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Deposit & Late Delivery Discount Card */}
        <div className="card glass-card p-3 mb-3 border-success bg-success bg-opacity-10 fs-7">
          <h6 className="fw-bold text-success mb-2 font-heading">Zaklad va Kechikish Chegirmasi Shartlari:</h6>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <Input
                label="Zaklad Miqdori (Avans To'landi)"
                type="number"
                placeholder="5000000"
                value={formData.depositAmount}
                onChange={(e) => handleFieldChange('depositAmount', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <Input
                label="Yetkazib Berish Sanasi (Reja)"
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => handleFieldChange('expectedDeliveryDate', e.target.value)}
                required
              />
            </div>
            <div className="col-12">
              <div className="p-2 bg-body-custom rounded border">
                <div className="form-check form-switch d-flex align-items-center gap-2 mb-0">
                  <input
                    className="form-check-input ms-0 cursor-pointer"
                    type="checkbox"
                    id="autoDiscountOrderSwitch"
                    checked={formData.autoDiscountOnLate}
                    onChange={(e) => handleFieldChange('autoDiscountOnLate', e.target.checked)}
                  />
                  <label className="form-check-label fs-7 fw-semibold text-main cursor-pointer mb-0" htmlFor="autoDiscountOrderSwitch">
                    Sanadan o'tib ketsa avtomatik kotyol narxi arzonlashsin (Kechikish chegirmasi: kuniga {formData.lateDiscountRate}%)
                  </label>
                </div>
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
              <span>Qo'shimcha Parametrlar va Rezerv</span>
            </div>
            {showAdvanced ? <LuChevronUp /> : <LuChevronDown />}
          </button>

          {showAdvanced && (
            <div className="row g-3 pt-3 border-top border-custom mt-2">
              <div className="col-12 col-md-6 d-flex align-items-center pt-4">
                <div className="form-check form-switch cursor-pointer">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    id="reservationSwitch"
                    checked={formData.isReserved}
                    onChange={(e) => handleFieldChange('isReserved', e.target.checked)}
                  />
                  <label className="form-check-label fs-7 fw-semibold text-main ms-2 cursor-pointer" htmlFor="reservationSwitch">
                    <LuBookmarkCheck className="text-info me-1" /> Materiallarni Rezerv Qilish
                  </label>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Buyurtma Izohi va Eslatmalar</label>
                <textarea
                  className="form-control fs-7"
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Maxsus shartlar..."
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Shartnoma Hujjatlarini Yuklash</label>
                <FileUpload label="Buyurtma shartnomasi hujjatini yuklash" maxSizeMB={5} />
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
