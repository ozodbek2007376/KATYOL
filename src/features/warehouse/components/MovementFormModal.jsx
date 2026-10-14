import React, { useState, useEffect } from 'react';
import { LuPlus, LuListFilter } from 'react-icons/lu';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { Button } from '@/components/common/Button/Button';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { employeesApi } from '@/features/employees/api/employeesApi';
import { productsApi } from '../api/productsApi';
import { useAuthStore } from '@/store/useAuthStore';
import { warehouseApi } from '../api/warehouseApi';
import { notifyError } from '@/services/notification.service';
import { getCurrencySymbol } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';
import { axiosInstance } from '@/api/axiosInstance';

export const MovementFormModal = ({ isOpen, onClose, onSubmit }) => {
  const user = useAuthStore((state) => state.user);
  const currentUser = user || { name: 'Mas\'ul Xodim' };
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isNewProductMode, setIsNewProductMode] = useState(true);

  const [formData, setFormData] = useState({
    customProductName: '',
    internalCode: '',
    categoryId: '',
    materialTypeId: '',
    productId: '',
    warehouseId: '',
    movementTypeCode: 'PURCHASE',
    quantity: '',
    unitId: '',
    unitName: '',
    unitPrice: '',
    createdBy: '',
    notes: '',
  });

  const movementTypeOptions = [
    { value: 'PURCHASE', label: "Ta'minotchidan Kirim (Xarid)" },
    { value: 'PRODUCTION_INPUT', label: 'Ishlab Chiqarishdan Omborga Kirim' },
    { value: 'RETURN', label: 'Mijoz Qaytargan Kirim' },
    { value: 'INITIAL_BALANCE', label: 'Boshlang\'ich Qoldiq Kiritish' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  const loadDropdownData = async () => {
    try {
      const [catRes, matRes, unitRes, whRes, prodRes, empRes] = await Promise.all([
        axiosInstance.get('/master-data/product-categories').catch(() => null),
        axiosInstance.get('/master-data/material-types').catch(() => null),
        axiosInstance.get('/master-data/units').catch(() => null),
        warehouseApi.getWarehouses().catch(() => null),
        productsApi.getProducts().catch(() => null),
        employeesApi.getEmployees().catch(() => null),
      ]);

      const cats = Array.isArray(catRes?.data) ? catRes.data : Array.isArray(catRes) ? catRes : [];
      const mats = Array.isArray(matRes?.data) ? matRes.data : Array.isArray(matRes) ? matRes : [];
      const units = Array.isArray(unitRes?.data) ? unitRes.data : Array.isArray(unitRes) ? unitRes : [];
      const warehouses = whRes?.success && Array.isArray(whRes.data) ? whRes.data : [];
      const productList = prodRes?.success && Array.isArray(prodRes.data) ? prodRes.data : [];
      const employeeList = empRes?.success && Array.isArray(empRes.data) ? empRes.data : [];

      const catOpts = cats.map(c => ({ value: c.id, label: c.name }));
      const matOpts = mats.map(m => ({ value: m.id, label: m.name }));
      const unitOpts = units.map(u => ({ value: u.id, label: `${u.name} (${u.symbol || u.short_name || u.shortName || 'dona'})`, symbol: u.symbol || u.short_name || u.shortName || 'dona' }));

      setCategoryOptions(catOpts);
      setMaterialOptions(matOpts);
      setUnitOptions(unitOpts);

      if (warehouses.length > 0) {
        setWarehouseOptions(warehouses.map(w => ({ value: w.id, label: w.name || w.label })));
      } else {
        setWarehouseOptions(dynamicSettingsService.getWarehouseOptions());
      }

      if (productList.length > 0) {
        setProducts(productList);
        setProductOptions(productList.map(p => ({ value: p.id || p.productId, label: `${p.name} (${p.internalCode || 'Kodsiz'})` })));
      }

      if (employeeList.length > 0) {
        setEmployees(employeeList);
      }

      const defaultName = currentUser?.name || currentUser?.full_name || (employeeList[0]?.fullName || '');
      setFormData(prev => ({
        ...prev,
        categoryId: prev.categoryId || catOpts[0]?.value || '',
        materialTypeId: prev.materialTypeId || matOpts[0]?.value || '',
        unitId: prev.unitId || unitOpts[0]?.value || '',
        unitName: prev.unitName || unitOpts[0]?.symbol || 'dona',
        warehouseId: prev.warehouseId || (warehouses[0]?.id || ''),
        createdBy: prev.createdBy || defaultName,
        internalCode: prev.internalCode || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      }));
    } catch (err) {
      console.error("Error loading dropdown data in MovementFormModal:", err);
    }
  };

  const handleAddNewWarehouse = (newRecord) => {
    const newWH = { value: `wh_${Date.now()}`, label: newRecord.name };
    setWarehouseOptions((prev) => [...prev, newWH]);
    setFormData((prev) => ({ ...prev, warehouseId: newWH.value }));
    return newWH;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let finalProductName = '';
    let finalUnitName = formData.unitName;

    if (isNewProductMode) {
      if (!formData.customProductName || !formData.customProductName.trim()) {
        notifyError("Mahsulot nomini kiriting!");
        return;
      }
      finalProductName = formData.customProductName.trim();
    } else {
      const selectedProd = products.find((p) => String(p.id || p.productId) === String(formData.productId));
      finalProductName = selectedProd ? selectedProd.productName || selectedProd.name : '';
      if (!finalProductName) {
        notifyError("Mavjud mahsulotni tanlang!");
        return;
      }
      if (selectedProd?.unitName) finalUnitName = selectedProd.unitName;
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      notifyError("Kirim miqdorini noldan yuqori kiriting!");
      return;
    }

    const selectedMType = movementTypeOptions.find((m) => m.value === formData.movementTypeCode);
    const selectedWH = warehouseOptions.find((w) => String(w.value) === String(formData.warehouseId));
    const selectedCat = categoryOptions.find((c) => String(c.value) === String(formData.categoryId));
    const selectedMat = materialOptions.find((m) => String(m.value) === String(formData.materialTypeId));

    onSubmit({
      ...formData,
      productName: finalProductName,
      internalCode: formData.internalCode,
      categoryId: formData.categoryId,
      categoryName: selectedCat ? selectedCat.label : '-',
      materialTypeId: formData.materialTypeId,
      materialTypeName: selectedMat ? selectedMat.label : '',
      unitName: finalUnitName || 'dona',
      movementTypeName: selectedMType ? selectedMType.label : 'Kirim',
      warehouseName: selectedWH ? selectedWH.label : 'Asosiy Ombor',
      quantity: parseFloat(formData.quantity) || 0,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      createdBy: formData.createdBy || currentUser?.name || currentUser?.full_name || 'Mas\'ul Xodim',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Omborga Kirim Qilish Hujjatini Rasmiylashtirish"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Kirimni Tasdiqlash va Saqlash
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Toggle Mode Segment */}
        <div className="d-flex align-items-center justify-content-between p-2 bg-body-custom rounded-3 border-custom mb-3">
          <span className="fs-8 fw-semibold text-muted-custom">Kirim Usulini Tanlang:</span>
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${isNewProductMode ? 'btn-primary' : 'btn-outline-secondary'} fs-8`}
              onClick={() => setIsNewProductMode(true)}
            >
              <LuPlus className="me-1" /> Yangi Mahsulot Nomi Bilan
            </button>
            <button
              type="button"
              className={`btn ${!isNewProductMode ? 'btn-primary' : 'btn-outline-secondary'} fs-8`}
              onClick={() => setIsNewProductMode(false)}
            >
              <LuListFilter className="me-1" /> Mavjud Mahsulot Ro'yxatidan
            </button>
          </div>
        </div>

        <div className="row g-3">
          {/* Mode 1: Custom Product Name Input */}
          {isNewProductMode ? (
            <>
              <div className="col-12">
                <Input
                  label="Mahsulot / Xomashyo Nomi *"
                  placeholder="Masalan: Kotyol Nasosi 25kW, Truba 50mm, Gaskat..."
                  value={formData.customProductName}
                  onChange={(e) => setFormData({ ...formData, customProductName: e.target.value })}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <DynamicSelect
                  label="Kategoriya"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={categoryOptions}
                  managePath={ROUTES.PROTECTED.SETTINGS_CATEGORIES}
                  entityTitle="Kategoriya"
                />
              </div>
              <div className="col-12 col-md-6">
                <DynamicSelect
                  label="Material Turi"
                  value={formData.materialTypeId}
                  onChange={(e) => setFormData({ ...formData, materialTypeId: e.target.value })}
                  options={materialOptions}
                  managePath={ROUTES.PROTECTED.SETTINGS_MATERIAL_TYPES}
                  entityTitle="Material Turi"
                />
              </div>
            </>
          ) : (
            /* Mode 2: Existing Product DynamicSelect */
            <div className="col-12 col-md-8">
              <DynamicSelect
                label="Mavjud Mahsulot Ro'yxati"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                options={productOptions}
                managePath={ROUTES.PROTECTED.PRODUCTS}
                entityKey="products"
                entityTitle="Mahsulot"
              />
            </div>
          )}

          {/* Dynamic Warehouse Select */}
          <div className="col-12 col-md-4">
            <DynamicSelect
              label="Qaysi Omborga"
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              options={warehouseOptions}
              managePath={ROUTES.PROTECTED.SETTINGS_WAREHOUSE}
              entityKey="warehouses"
              onAddNew={handleAddNewWarehouse}
              entityTitle="Ombor"
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <Input
              label="Kirim Miqdori *"
              placeholder="Masalan: 100"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>
          <div className="col-12 col-md-4">
            <DynamicSelect
              label="O'lchov Birligi"
              value={formData.unitId}
              onChange={(e) => {
                const selectedU = unitOptions.find((u) => String(u.value) === String(e.target.value));
                setFormData({
                  ...formData,
                  unitId: e.target.value,
                  unitName: selectedU ? selectedU.symbol : 'dona',
                });
              }}
              options={unitOptions}
              managePath={ROUTES.PROTECTED.SETTINGS_UNITS}
              entityTitle="O'lchov Birligi"
              disabled={!isNewProductMode}
            />
          </div>
          <div className="col-12 col-md-4">
            <Input
              label={`Birlik Kirim Narxi (${getCurrencySymbol()})`}
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-6">
            <Select
              label="Harakat / Kirim Turi"
              value={formData.movementTypeCode}
              onChange={(e) => setFormData({ ...formData, movementTypeCode: e.target.value })}
              options={movementTypeOptions}
            />
          </div>

          {/* Responsible Employee Selector */}
          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Mas'ul Xodim"
              value={formData.createdBy}
              onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
              options={
                employees.length > 0
                  ? employees.map((emp) => ({
                      value: emp.fullName,
                      label: `${emp.fullName} (${emp.positionName || 'Xodim'})`,
                    }))
                  : [{ value: currentUser?.name || currentUser?.full_name || 'Mas\'ul Xodim', label: currentUser?.name || currentUser?.full_name || 'Mas\'ul Xodim' }]
              }
              managePath={ROUTES.PROTECTED.EMPLOYEES}
              entityKey="employees"
              entityTitle="Xodim"
              required
            />
          </div>

          <div className="col-12">
            <Input
              label="Hujjat Izohi yoki Shartnoma Raqami (Ixtiyoriy)"
              placeholder="Masalan: Shartnoma №12-B, Mas'ul topshirdi..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
