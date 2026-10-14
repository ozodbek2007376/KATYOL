import { STORAGE_KEYS } from '@/constants/storage.constants';

const DEFAULT_CURRENCIES = [];
import { dataIntegrityService } from './dataIntegrity.service';

export const DEFAULT_SUPPLIER_CATEGORIES = [];

export const INITIAL_DYNAMIC_SETTINGS = {
  productCategories: [
    { id: 'cat_1', name: 'Metall va Xomashyo', code: 'METAL', status: 'ACTIVE' },
    { id: 'cat_2', name: 'Trubalar', code: 'PIPES', status: 'ACTIVE' },
    { id: 'cat_3', name: 'Gorelkalar va Agregatlar', code: 'BURNERS', status: 'ACTIVE' },
    { id: 'cat_4', name: 'Avtomatika va Datchiklar', code: 'AUTOMATION', status: 'ACTIVE' },
    { id: 'cat_5', name: 'Izolyatsiya', code: 'INSULATION', status: 'ACTIVE' },
    { id: 'cat_6', name: 'Armatura va Klapanlar', code: 'VALVES', status: 'ACTIVE' },
    { id: 'cat_7', name: 'Nasoslar', code: 'PUMPS', status: 'ACTIVE' },
  ],
  units: [
    { id: 'u_1', name: 'Dona', code: 'dona', shortName: 'dona', status: 'ACTIVE' },
    { id: 'u_2', name: 'Metr', code: 'metr', shortName: 'm', status: 'ACTIVE' },
    { id: 'u_3', name: 'Kilogramm', code: 'kg', shortName: 'kg', status: 'ACTIVE' },
    { id: 'u_4', name: 'Rulon', code: 'rulon', shortName: 'rulon', status: 'ACTIVE' },
    { id: 'u_5', name: 'Komplekt', code: 'komplekt', shortName: 'kompl', status: 'ACTIVE' },
  ],
  materialTypes: [
    { id: 'mt_1', name: 'Asosiy Xomashyo', status: 'ACTIVE' },
    { id: 'mt_2', name: 'Yordamchi Material', status: 'ACTIVE' },
    { id: 'mt_3', name: 'Tayyor Butlovchi Qism', status: 'ACTIVE' },
  ],
  supplierCategories: [
    { id: 'sc_1', name: 'Metalloprokat yetkazib beruvchilar', status: 'ACTIVE' },
    { id: 'sc_2', name: 'Import agregatlar (Italiya, Turkiya)', status: 'ACTIVE' },
    { id: 'sc_3', name: 'Lokal butlovchilar', status: 'ACTIVE' },
  ],
  customerTypes: [
    { id: 'ctype_1', name: 'Jismoniy Shaxs', code: 'INDIVIDUAL', status: 'ACTIVE' },
    { id: 'ctype_2', name: 'Yuridik Shaxs (Korxona)', code: 'LEGAL', status: 'ACTIVE' },
  ],
  serviceTypes: [
    { id: 'st_1', name: 'Kafolatli Ta\'mirlash', status: 'ACTIVE' },
    { id: 'st_2', name: 'Mavsumiy Profilaktika', status: 'ACTIVE' },
    { id: 'st_3', name: 'Shoshilinch Avariyaviy Xizmat', status: 'ACTIVE' },
  ],
  warrantyTypes: [
    { id: 'wt_1', name: 'Standart Kafolat (12 oy)', duration: 12, status: 'ACTIVE' },
    { id: 'wt_2', name: 'Kengaytirilgan Kafolat (24 oy)', duration: 24, status: 'ACTIVE' },
    { id: 'wt_3', name: 'Premium Kafolat (36 oy)', duration: 36, status: 'ACTIVE' },
  ],
  priorities: [
    { id: 'p_1', name: 'Oddiy', code: 'NORMAL', status: 'ACTIVE' },
    { id: 'p_2', name: 'Yuqori', code: 'HIGH', status: 'ACTIVE' },
    { id: 'p_3', name: 'Shoshilinch (Urgent)', code: 'URGENT', status: 'ACTIVE' },
  ],
  orderStatuses: [
    { id: 'os_1', name: 'Yangi', code: 'NEW', status: 'ACTIVE' },
    { id: 'os_2', name: 'Ishlab chiqarishda', code: 'IN_PROGRESS', status: 'ACTIVE' },
    { id: 'os_3', name: 'Tayyor', code: 'READY', status: 'ACTIVE' },
    { id: 'os_4', name: 'Yetkazildi', code: 'COMPLETED', status: 'ACTIVE' },
    { id: 'os_5', name: 'Bekor qilingan', code: 'CANCELLED', status: 'ACTIVE' },
  ],
  paymentStatuses: [
    { id: 'pay_1', name: 'To\'langan', code: 'PAID', badgeClass: 'bg-success' },
    { id: 'pay_2', name: 'Qisman To\'langan', code: 'PARTIAL', badgeClass: 'bg-warning text-dark' },
    { id: 'pay_3', name: 'To\'lanmagan', code: 'UNPAID', badgeClass: 'bg-danger' },
  ],
  deliveryStatuses: [
    { id: 'del_1', name: 'Yetkazildi', code: 'DELIVERED', badgeClass: 'bg-success' },
    { id: 'del_2', name: 'Yo\'lda / Yetkazilmoqda', code: 'IN_TRANSIT', badgeClass: 'bg-primary' },
    { id: 'del_3', name: 'Kutilmoqda', code: 'PENDING', badgeClass: 'bg-secondary' },
  ],
  regions: [
    { id: 'reg_1', name: 'Toshkent shahri' },
    { id: 'reg_2', name: 'Toshkent viloyati' },
    { id: 'reg_3', name: 'Andijon viloyati' },
    { id: 'reg_4', name: 'Farg\'ona viloyati' },
    { id: 'reg_5', name: 'Namangan viloyati' },
    { id: 'reg_6', name: 'Samarqand viloyati' },
    { id: 'reg_7', name: 'Buxoro viloyati' },
    { id: 'reg_8', name: 'Xorazm viloyati' },
    { id: 'reg_9', name: 'Qashqadaryo viloyati' },
    { id: 'reg_10', name: 'Surxondaryo viloyati' },
    { id: 'reg_11', name: 'Navoiy viloyati' },
    { id: 'reg_12', name: 'Jizzax viloyati' },
    { id: 'reg_13', name: 'Sirdaryo viloyati' },
    { id: 'reg_14', name: 'Qoraqalpog\'iston Respublikasi' },
  ],
  warehouses: [
    { id: 'wh_1', name: 'Asosiy Ombor (Xomashyo)', code: 'WH-01', location: '1-Sex', status: 'ACTIVE' },
    { id: 'wh_2', name: 'Tayyor Mahsulotlar Ombori', code: 'WH-02', location: '2-Sex', status: 'ACTIVE' },
  ],
  positions: [
    { id: 'pos_1', name: 'Bosh muhandis', status: 'ACTIVE' },
    { id: 'pos_2', name: 'Katta usta-payvandchi', status: 'ACTIVE' },
    { id: 'pos_3', name: 'Ombor mudiri', status: 'ACTIVE' },
    { id: 'pos_4', name: 'Bosh hisobchi', status: 'ACTIVE' },
  ],
  salaryTypes: [
    { id: 'sal_1', name: 'Oylik oklad', status: 'ACTIVE' },
    { id: 'sal_2', name: 'Ishbay (Buyurtma bo\'yicha)', status: 'ACTIVE' },
  ],
  expenseTypes: [
    { id: 'exp_1', name: 'Xomashyo xaridi', status: 'ACTIVE' },
    { id: 'exp_2', name: 'Kommunal to\'lovlar', status: 'ACTIVE' },
    { id: 'exp_3', name: 'Transport va yetkazib berish', status: 'ACTIVE' },
    { id: 'exp_4', name: 'Xodimlar ish haqi', status: 'ACTIVE' },
  ],
  defectReasons: [
    { id: 'def_1', name: 'Payvand chokining nosozligi', status: 'ACTIVE' },
    { id: 'def_2', name: 'Gidro-bosim testida sizish', status: 'ACTIVE' },
    { id: 'def_3', name: 'Xomashyo nuqsoni (metall darzi)', status: 'ACTIVE' },
  ],
  productionStages: [
    { id: 'stg_1', name: 'Materiallarni bichish va kesish', defaultPrice: 1500000, status: 'ACTIVE' },
    { id: 'stg_2', name: 'Asosiy korpusni bukish va payvandlash', defaultPrice: 3500000, status: 'ACTIVE' },
    { id: 'stg_3', name: 'Gidravlik bosim sinovi (Gidro-test)', defaultPrice: 2000000, status: 'ACTIVE' },
    { id: 'stg_4', name: 'Izolyatsiya va qoplama o\'rnatish', defaultPrice: 1800000, status: 'ACTIVE' },
    { id: 'stg_5', name: 'Avtomatika va gorelka montaji', defaultPrice: 2200000, status: 'ACTIVE' },
  ],
  roles: [
    { id: 'role_1', name: 'Admin', code: 'ADMIN', status: 'ACTIVE' },
    { id: 'role_2', name: 'Boshqaruvchi', code: 'OWNER', status: 'ACTIVE' },
    { id: 'role_3', name: 'Omborchi', code: 'WAREHOUSE_KEEPER', status: 'ACTIVE' },
    { id: 'role_4', name: 'Ishlab chiqarish operatori', code: 'PRODUCTION_OPERATOR', status: 'ACTIVE' },
  ],
  movementTypes: [
    { code: 'IN', name: 'Kirim' },
    { code: 'OUT', name: 'Chiqim' },
    { code: 'TRANSFER', name: 'Ko\'chirish' },
  ],
  movementReasons: [
    { id: 'mr_1', name: 'Ta\'minotchidan kirim', status: 'ACTIVE' },
    { id: 'mr_2', name: 'Ishlab chiqarishga sarflash', status: 'ACTIVE' },
    { id: 'mr_3', name: 'Omborlararo ko\'chirish', status: 'ACTIVE' },
  ],
  revaluationReasons: [
    { id: 'rr_1', name: 'Bozor narxi o\'zgarishi', status: 'ACTIVE' },
    { id: 'rr_2', name: 'Valyuta kursi o\'zgarishi', status: 'ACTIVE' },
  ],
  inventoryReasons: [
    { id: 'ir_1', name: 'Rejali inventarizatsiya', status: 'ACTIVE' },
    { id: 'ir_2', name: 'Kamchilik / Ortiqchalikni hisobdan chiqarish', status: 'ACTIVE' },
  ],
};

class DynamicSettingsService {
  constructor() {
    this.storageKey = STORAGE_KEYS.DYNAMIC_SETTINGS || 'kotyol_erp_dynamic_settings';
  }

  getSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return { ...INITIAL_DYNAMIC_SETTINGS };
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  getList(key, options = {}) {
    const settings = this.getSettings();
    const list = settings[key] || INITIAL_DYNAMIC_SETTINGS[key] || [];

    if (options.includeArchived) {
      return list;
    }
    return list.filter((item) => item.status !== 'INACTIVE' && item.status !== 'ARCHIVED');
  }

  getItemById(key, id) {
    const list = this.getList(key, { includeArchived: true });
    return list.find((item) => item.id === id || item.code === id) || null;
  }

  addItem(key, item) {
    const settings = this.getSettings();
    const list = settings[key] || INITIAL_DYNAMIC_SETTINGS[key] || [];
    const newItem = { id: `${key}_${Date.now()}`, status: 'ACTIVE', ...item };
    settings[key] = [...list, newItem];
    this.saveSettings(settings);
    return newItem;
  }

  updateItem(key, id, updatedFields) {
    const settings = this.getSettings();
    const list = settings[key] || INITIAL_DYNAMIC_SETTINGS[key] || [];
    let updatedItem = null;
    settings[key] = list.map((item) => {
      if (item.id === id || item.code === id) {
        updatedItem = { ...item, ...updatedFields };
        return updatedItem;
      }
      return item;
    });
    this.saveSettings(settings);
    return updatedItem;
  }

  archiveItem(key, id) {
    return this.updateItem(key, id, { status: 'INACTIVE' });
  }

  restoreItem(key, id) {
    return this.updateItem(key, id, { status: 'ACTIVE' });
  }

  deleteItem(key, id, entityTypeForIntegrity) {
    if (entityTypeForIntegrity) {
      const integrity = dataIntegrityService.canDelete(entityTypeForIntegrity, id);
      if (!integrity.allowed) {
        return { success: false, reason: integrity.reason, canArchive: true };
      }
    }
    const settings = this.getSettings();
    const list = settings[key] || INITIAL_DYNAMIC_SETTINGS[key] || [];
    settings[key] = list.filter((item) => item.id !== id && item.code !== id);
    this.saveSettings(settings);
    return { success: true };
  }

  saveList(key, newList) {
    const settings = this.getSettings();
    settings[key] = newList;
    if (key === 'categories') settings['productCategories'] = newList;
    if (key === 'productCategories') settings['categories'] = newList;
    this.saveSettings(settings);
    return newList;
  }

  // Currencies
  getCurrencies() {
    return this.getList('currencies');
  }
  getCurrencyOptions() {
    return this.getCurrencies().map((c) => ({ value: c.code, label: `${c.name} (${c.symbol})` }));
  }

  // Warehouses
  getWarehouses() {
    return this.getList('warehouses');
  }

  addWarehouseOption(option) {
    const currentList = this.getWarehouses();
    const exists = currentList.some(w => w.id === option.value || w.name === option.label);
    if (!exists) {
      this.addItem('warehouses', {
        id: option.value,
        name: option.label,
      });
    }
  }

  getWarehouseOptions() {
    return this.getWarehouses().map((w) => ({ value: w.id || w.code, label: w.name }));
  }

  // Suppliers
  getSuppliers() {
    return [];
  }
  getSupplierOptions() {
    return [];
  }

  // Product Categories
  getCategories() {
    return this.getList('productCategories');
  }
  getCategoryOptions() {
    return this.getCategories().map((cat) => ({ value: cat.id, label: cat.name }));
  }

  // Supplier Categories
  getSupplierCategories() {
    return this.getList('supplierCategories');
  }
  getSupplierCategoryOptions() {
    return this.getSupplierCategories().map((c) => ({ value: c.id, label: c.name }));
  }

  // Material Types
  getMaterialTypes() {
    const list = this.getList('materialTypes');
    if (list && list.length > 0) return list;
    return [];
  }
  getMaterialTypeOptions() {
    return this.getMaterialTypes().map((m) => ({ value: m.id, label: m.name }));
  }

  // Measurement Units
  getUnits() {
    return this.getList('units');
  }
  getUnitOptions() {
    return this.getUnits().map((u) => ({ value: u.id, label: `${u.name} (${u.shortName || u.code || 'dona'})` }));
  }

  // Movement Types
  getMovementTypes() {
    return [
      { code: 'IN', name: 'Kirim' },
      { code: 'OUT', name: 'Chiqim' },
      { code: 'TRANSFER', name: 'Ko\'chirish' },
    ];
  }
  getMovementTypeOptions() {
    return this.getMovementTypes().map((mt) => ({ value: mt.code, label: mt.name }));
  }

  // Positions
  getPositions() {
    return this.getList('positions');
  }
  getPositionOptions() {
    return this.getPositions().map((p) => ({ value: p.id, label: p.name }));
  }

  // Salary Types
  getSalaryTypes() {
    return this.getList('salaryTypes');
  }
  getSalaryTypeOptions() {
    return this.getSalaryTypes().map((s) => ({ value: s.id, label: s.name }));
  }

  // Customer Types
  getCustomerTypes() {
    return this.getList('customerTypes');
  }
  getCustomerTypeOptions() {
    return this.getCustomerTypes().map((ct) => ({ value: ct.id, label: ct.name }));
  }

  // Inventory Reasons
  getInventoryReasons() {
    return this.getList('inventoryReasons');
  }
  getInventoryReasonOptions() {
    const list = this.getInventoryReasons();
    if (list && list.length > 0) {
      return list.map((r) => ({ value: r.id || r.name, label: r.name }));
    }
    return [
      { value: 'Rejalashtirilgan inventarizatsiya', label: 'Rejalashtirilgan inventarizatsiya' },
      { value: 'Texnik tafovutni tuzatish', label: 'Texnik tafovutni tuzatish' },
      { value: 'Kamchilik / Ortiqchalik', label: 'Kamchilik / Ortiqchalik' },
    ];
  }

  // Revaluation Reasons
  getRevaluationReasons() {
    return this.getList('revaluationReasons');
  }
  getRevaluationReasonOptions() {
    const list = this.getRevaluationReasons();
    if (list && list.length > 0) {
      return list.map((r) => ({ value: r.id || r.name, label: r.name }));
    }
    return [
      { value: 'Bozor narxi o\'zgarishi', label: 'Bozor narxi o\'zgarishi' },
      { value: 'Valyuta kursi o\'zgarishi', label: 'Valyuta kursi o\'zgarishi' },
      { value: 'Eskirish va sifat pasayishi', label: 'Eskirish va sifat pasayishi' },
    ];
  }

  // Movement Reasons
  getMovementReasons() {
    return this.getList('movementReasons');
  }
  getMovementReasonOptions() {
    const list = this.getMovementReasons();
    if (list && list.length > 0) {
      return list.map((r) => ({ value: r.id || r.name, label: r.name }));
    }
    return [
      { value: 'Ombor kirimi', label: 'Ombor kirimi' },
      { value: 'Ishlab chiqarishga topshirish', label: 'Ishlab chiqarishga topshirish' },
      { value: 'Omborlararo ko\'chirish', label: 'Omborlararo ko\'chirish' },
    ];
  }

  // Production Stages
  getProductionStages() {
    const list = this.getList('productionStages');
    return Array.isArray(list) ? list : [];
  }

  // Expense Types
  getExpenseTypes() {
    return this.getList('expenseTypes');
  }
  getExpenseTypeOptions() {
    return this.getExpenseTypes().map((e) => ({ value: e.id, label: e.name }));
  }

  // Defect Reasons
  getDefectReasons() {
    return this.getList('defectReasons');
  }

  // Service Types
  getServiceTypes() {
    return this.getList('serviceTypes');
  }
  getServiceTypeOptions() {
    return this.getServiceTypes().map((s) => ({ value: s.id, label: s.name }));
  }

  // Warranty Types
  getWarrantyTypes() {
    return this.getList('warrantyTypes');
  }
  getWarrantyTypeOptions() {
    return this.getWarrantyTypes().map((w) => ({ value: w.id, label: w.name }));
  }

  // Roles
  getRoles() {
    return this.getList('roles');
  }

  // Priorities
  getOrderPriorities() {
    return this.getList('priorities');
  }
  getOrderPriorityOptions() {
    return (this.getOrderPriorities() || []).map((p) => ({ value: p.code || p.id, label: p.name }));
  }

  // Order Statuses
  getOrderStatuses() {
    return this.getList('orderStatuses');
  }
  getOrderStatusOptions() {
    return (this.getOrderStatuses() || []).map((st) => ({ value: st.code || st.id, label: st.name }));
  }

  // Payment Statuses
  getPaymentStatuses() {
    return this.getList('paymentStatuses');
  }
  getPaymentStatusOptions() {
    return (this.getPaymentStatuses() || []).map((ps) => ({ value: ps.code || ps.id, label: ps.name }));
  }

  // Delivery Statuses
  getDeliveryStatuses() {
    return this.getList('deliveryStatuses');
  }
  getDeliveryStatusOptions() {
    return (this.getDeliveryStatuses() || []).map((ds) => ({ value: ds.code || ds.id, label: ds.name }));
  }

  // Regions
  getRegions() {
    return this.getList('regions');
  }
  getRegionOptions() {
    return (this.getRegions() || []).map((r) => ({ value: r.name, label: r.name }));
  }

  // Production Stage Options
  getProductionStageOptions() {
    return (this.getProductionStages() || []).map((st) => ({ value: st.id, label: st.name }));
  }

  // Boiler Types
  getBoilerTypes() {
    const list = this.getList('boilerTypes');
    if (list && list.length > 0) return list;
    return [
      { id: 'bt_1', name: 'Suv Isitish Kotyoli (Водогрейный)' },
      { id: 'bt_2', name: 'Bug\' Kotyoli (Паровой)' },
      { id: 'bt_3', name: 'Moyli Kotyol (Термомасляный)' },
    ];
  }
  getBoilerTypeOptions() {
    return (this.getBoilerTypes() || []).map((b) => ({ value: b.id || b.name, label: b.name }));
  }

  // Defect Reason Options
  getDefectReasonOptions() {
    return (this.getDefectReasons() || []).map((d) => ({ value: d.id || d.name, label: d.name }));
  }

  // Insurance Types
  getInsuranceTypes() {
    return this.getList('insuranceTypes');
  }
  getInsuranceTypeOptions() {
    return (this.getInsuranceTypes() || []).map((i) => ({ value: i.id, label: i.name }));
  }

  // Service Status Options
  getServiceStatusOptions() {
    return [
      { value: 'NEW', label: 'Yangi' },
      { value: 'IN_PROGRESS', label: 'Jarayonda' },
      { value: 'COMPLETED', label: 'Yakunlangan' },
      { value: 'CANCELLED', label: 'Bekor qilingan' },
    ];
  }
}

export const dynamicSettingsService = new DynamicSettingsService();
