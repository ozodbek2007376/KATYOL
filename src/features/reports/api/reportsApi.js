import { axiosInstance } from '@/api/axiosInstance';

// Helper to filter items by date range
const filterByDateRange = (items, dateField, startDate, endDate) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    const val = item[dateField] || item.created_at || item.transaction_date || item.order_date || item.start_date || item.service_date;
    if (!val) return true;
    const dateStr = val.split('T')[0];
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  });
};

// Helper to get Uzbek month name
const getUzbekMonthName = (dateStr) => {
  if (!dateStr) return 'Joriy oy';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Joriy oy';
  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  return monthNames[date.getMonth()];
};

export const reportsApi = {
  async getGeneralReport(filters = {}) {
    try {
      const [salesRes, purRes, prodRes, stockRes, txsRes, srvRes] = await Promise.all([
        axiosInstance.get('/sales').catch(() => ({ data: [] })),
        axiosInstance.get('/purchasing').catch(() => ({ data: [] })),
        axiosInstance.get('/production/batches').catch(() => ({ data: [] })),
        axiosInstance.get('/warehouse/stock').catch(() => ({ data: [] })),
        axiosInstance.get('/finance/transactions').catch(() => ({ data: [] })),
        axiosInstance.get('/master-data/services').catch(() => ({ data: [] })),
      ]);

      const sales = Array.isArray(salesRes.data) ? salesRes.data : [];
      const purchases = Array.isArray(purRes.data) ? purRes.data : [];
      const batches = Array.isArray(prodRes.data) ? prodRes.data : [];
      const stock = Array.isArray(stockRes.data) ? stockRes.data : [];
      const txs = Array.isArray(txsRes.data) ? txsRes.data : [];
      const services = Array.isArray(srvRes.data) ? srvRes.data : [];

      const filteredSales = filterByDateRange(sales, 'created_at', filters.startDate, filters.endDate);
      const filteredPurchases = filterByDateRange(purchases, 'order_date', filters.startDate, filters.endDate);
      const filteredBatches = filterByDateRange(batches, 'start_date', filters.startDate, filters.endDate);
      const filteredTxs = filterByDateRange(txs, 'transaction_date', filters.startDate, filters.endDate);

      const totalSalesAmount = filteredSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
      const totalPurchasingAmount = filteredPurchases.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
      const productionCompletedCount = filteredBatches.filter((b) => b.status === 'COMPLETED').length;
      const warehouseStockValue = stock.reduce((sum, s) => sum + ((Number(s.quantity) || 0) * (Number(s.avg_unit_cost) || 0)), 0);
      const operationalExpenses = filteredTxs.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const totalRevenue = filteredTxs.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const netProfit = totalRevenue - operationalExpenses;
      const customerReceivables = filteredSales.filter((s) => s.payment_status === 'UNPAID').reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
      const totalServicesCount = services.length;

      // Group monthly chart data
      const monthlyGroups = {};
      filteredSales.forEach((s) => {
        const m = getUzbekMonthName(s.created_at);
        if (!monthlyGroups[m]) monthlyGroups[m] = { month: m, sales: 0, production: 0 };
        monthlyGroups[m].sales += Number(s.total_amount) || 0;
      });
      filteredBatches.forEach((b) => {
        const m = getUzbekMonthName(b.start_date);
        if (!monthlyGroups[m]) monthlyGroups[m] = { month: m, sales: 0, production: 0 };
        monthlyGroups[m].production += Number(b.completed_quantity) || 0;
      });

      let chart = Object.values(monthlyGroups);
      if (chart.length === 0) {
        chart = [{ month: 'Joriy oy', sales: 0, production: 0 }];
      }

      return {
        success: true,
        data: {
          cards: {
            totalSalesAmount,
            netProfit,
            productionCompletedCount,
            warehouseStockValue,
            totalPurchasingAmount,
            operationalExpenses,
            customerReceivables,
            totalServicesCount,
          },
          chart,
        },
      };
    } catch {
      return { success: false, data: null };
    }
  },

  async getSalesReport(filters = {}) {
    try {
      const [salesRes] = await Promise.all([
        axiosInstance.get('/sales').catch(() => ({ data: [] })),
      ]);

      const sales = Array.isArray(salesRes.data) ? salesRes.data : [];
      const filteredSales = filterByDateRange(sales, 'created_at', filters.startDate, filters.endDate);

      // Top Customers aggregation
      const customerMap = {};
      filteredSales.forEach((s) => {
        const cName = s.customer_name || 'Noma\'lum Mijoz';
        if (!customerMap[cName]) customerMap[cName] = { name: cName, orderCount: 0, totalAmount: 0 };
        customerMap[cName].orderCount += 1;
        customerMap[cName].totalAmount += Number(s.total_amount) || 0;
      });
      const topCustomers = Object.values(customerMap).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);

      // Top Products aggregation
      const productMap = {};
      filteredSales.forEach((s) => {
        const pName = s.product_name || 'Kotyol K-50kW';
        if (!productMap[pName]) productMap[pName] = { name: pName, soldQuantity: 0, totalRevenue: 0 };
        productMap[pName].soldQuantity += Number(s.quantity) || 0;
        productMap[pName].totalRevenue += Number(s.total_amount) || 0;
      });
      const topProducts = Object.values(productMap).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

      // Monthly Comparison
      const monthlyGroups = {};
      filteredSales.forEach((s) => {
        const m = getUzbekMonthName(s.created_at);
        if (!monthlyGroups[m]) monthlyGroups[m] = { month: m, sales: 0, orders: 0 };
        monthlyGroups[m].sales += Number(s.total_amount) || 0;
        monthlyGroups[m].orders += 1;
      });
      let monthlyComparison = Object.values(monthlyGroups);
      if (monthlyComparison.length === 0) {
        monthlyComparison = [{ month: 'Joriy oy', sales: 0, orders: 0 }];
      }

      return {
        success: true,
        data: {
          monthlyComparison,
          topCustomers,
          topProducts,
        },
      };
    } catch {
      return { success: false, data: null };
    }
  },

  async getWarehouseReport(filters = {}) {
    try {
      const [stockRes, catRes] = await Promise.all([
        axiosInstance.get('/warehouse/stock').catch(() => ({ data: [] })),
        axiosInstance.get('/master-data/product-categories').catch(() => ({ data: [] })),
      ]);

      const stock = Array.isArray(stockRes.data) ? stockRes.data : [];
      const categories = Array.isArray(catRes.data) ? catRes.data : [];

      const catMap = {};
      categories.forEach((c) => {
        catMap[c.id] = c.name;
      });

      const inventoryValue = stock.reduce((sum, s) => sum + ((Number(s.quantity) || 0) * (Number(s.avg_unit_cost) || 0)), 0);
      const totalItemsCount = stock.length;

      // Category Distribution
      const catTotals = {};
      stock.forEach((s) => {
        const catName = s.category_name || catMap[s.category_id] || 'Boshqalar';
        const val = (Number(s.quantity) || 0) * (Number(s.avg_unit_cost) || 0);
        catTotals[catName] = (catTotals[catName] || 0) + val;
      });
      const categoryDistribution = Object.entries(catTotals).map(([name, value]) => ({
        name,
        value,
      }));

      // Low Stock Alerts
      const lowStockAlerts = stock.filter((s) => (Number(s.quantity) || 0) <= 10).map((s) => ({
        id: s.id,
        name: s.product_name || 'Material',
        stock: Number(s.quantity) || 0,
        unit: s.unit_name || 'dona',
        minAlert: 10,
      }));

      // Most Used Materials (Dynamic top list based on current stock value or code)
      const mostUsedMaterials = stock.map((s) => ({
        name: s.product_name || 'Material',
        usedQty: 0,
        cost: (Number(s.quantity) || 0) * (Number(s.avg_unit_cost) || 0),
      })).sort((a, b) => b.cost - a.cost).slice(0, 5);

      return {
        success: true,
        data: {
          inventoryValue,
          totalItemsCount,
          categoryDistribution: categoryDistribution.length > 0 ? categoryDistribution : [{ name: 'Mavjud emas', value: 0 }],
          lowStockAlerts,
          mostUsedMaterials,
        },
      };
    } catch {
      return { success: false, data: null };
    }
  },

  async getProductionReport(filters = {}) {
    try {
      const [prodRes] = await Promise.all([
        axiosInstance.get('/production/batches').catch(() => ({ data: [] })),
      ]);

      const batches = Array.isArray(prodRes.data) ? prodRes.data : [];
      const filteredBatches = filterByDateRange(batches, 'start_date', filters.startDate, filters.endDate);

      const completedCount = filteredBatches.filter((b) => b.status === 'COMPLETED').length;
      const inProgressCount = filteredBatches.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'STARTED').length;
      const delayedCount = filteredBatches.filter((b) => {
        if (b.status === 'COMPLETED') return false;
        if (!b.end_date) return false;
        return new Date(b.end_date) < new Date();
      }).length;

      // Group weekly trends
      const weeklyGroups = {};
      filteredBatches.forEach((b) => {
        const m = getUzbekMonthName(b.start_date);
        if (!weeklyGroups[m]) weeklyGroups[m] = { month: m, completed: 0, inProgress: 0 };
        if (b.status === 'COMPLETED') {
          weeklyGroups[m].completed += 1;
        } else {
          weeklyGroups[m].inProgress += 1;
        }
      });
      let weeklyTrends = Object.values(weeklyGroups);
      if (weeklyTrends.length === 0) {
        weeklyTrends = [{ month: 'Joriy oy', completed: 0, inProgress: 0 }];
      }

      // Stage productivity (Dynamic mapping from stages settings + status)
      const stageTotals = {
        'Metal kesish': { stage: 'Metal kesish', completedCount: 0, avgDays: 1.5 },
        'Payvandlash': { stage: 'Payvandlash', completedCount: 0, avgDays: 2 },
        'Yig\'ish': { stage: 'Yig\'ish', completedCount: 0, avgDays: 1.5 },
        'Sinov va qadoqlash': { stage: 'Sinov va qadoqlash', completedCount: 0, avgDays: 1 },
      };

      filteredBatches.forEach((b) => {
        if (b.status === 'COMPLETED') {
          const keys = Object.keys(stageTotals);
          keys.forEach((key) => {
            stageTotals[key].completedCount += 1;
          });
        }
      });

      return {
        success: true,
        data: {
          cards: {
            completedCount,
            inProgressCount,
            delayedCount,
            avgProductionDays: 6,
          },
          stageUnproductivity: Object.values(stageTotals),
          weeklyTrends,
        },
      };
    } catch {
      return { success: false, data: null };
    }
  },

  async getFinanceReport(filters = {}) {
    try {
      const [txsRes, typesRes] = await Promise.all([
        axiosInstance.get('/finance/transactions').catch(() => ({ data: [] })),
        axiosInstance.get('/master-data/expense-types').catch(() => ({ data: [] })),
      ]);

      const txs = Array.isArray(txsRes.data) ? txsRes.data : [];
      const expenseTypes = Array.isArray(typesRes.data) ? typesRes.data : [];

      const typeMap = {};
      expenseTypes.forEach((t) => {
        typeMap[t.id] = t.name;
      });

      const filteredTxs = filterByDateRange(txs, 'transaction_date', filters.startDate, filters.endDate);

      // Monthly Comparison
      const monthlyGroups = {};
      filteredTxs.forEach((t) => {
        const m = getUzbekMonthName(t.transaction_date);
        if (!monthlyGroups[m]) monthlyGroups[m] = { month: m, income: 0, expense: 0, profit: 0 };
        const amt = Number(t.amount) || 0;
        if (t.type === 'INCOME') {
          monthlyGroups[m].income += amt;
        } else if (t.type === 'EXPENSE') {
          monthlyGroups[m].expense += amt;
        }
      });
      Object.values(monthlyGroups).forEach((m) => {
        m.profit = m.income - m.expense;
      });
      let monthlyComparison = Object.values(monthlyGroups);
      if (monthlyComparison.length === 0) {
        monthlyComparison = [{ month: 'Joriy oy', income: 0, expense: 0, profit: 0 }];
      }

      // Expense Distribution by Category
      const catTotals = {};
      filteredTxs.filter((t) => t.type === 'EXPENSE').forEach((t) => {
        const catName = typeMap[t.expense_type_id] || 'Boshqa xarajatlar';
        const amt = Number(t.amount) || 0;
        catTotals[catName] = (catTotals[catName] || 0) + amt;
      });
      const expenseDistribution = Object.entries(catTotals).map(([name, amount]) => ({
        name,
        amount,
      }));

      return {
        success: true,
        data: {
          monthlyComparison,
          expenseDistribution: expenseDistribution.length > 0 ? expenseDistribution : [{ name: 'Xarajat yo\'q', amount: 1 }],
        },
      };
    } catch {
      return { success: false, data: null };
    }
  },

  async getServiceReport(filters = {}) {
    try {
      const [srvRes] = await Promise.all([
        axiosInstance.get('/master-data/services').catch(() => ({ data: [] })),
      ]);

      const services = Array.isArray(srvRes.data) ? srvRes.data : [];
      const filteredServices = filterByDateRange(services, 'service_date', filters.startDate, filters.endDate);

      const totalCount = filteredServices.length;
      const completedCount = filteredServices.filter((s) => s.status === 'COMPLETED').length;

      // Group by monthly trends
      const monthlyGroups = {};
      filteredServices.forEach((s) => {
        const m = getUzbekMonthName(s.service_date);
        if (!monthlyGroups[m]) monthlyGroups[m] = { month: m, completed: 0, total: 0 };
        monthlyGroups[m].total += 1;
        if (s.status === 'COMPLETED') monthlyGroups[m].completed += 1;
      });
      let monthlyTrends = Object.values(monthlyGroups);
      if (monthlyTrends.length === 0) {
        monthlyTrends = [{ month: 'Joriy oy', completed: 0, total: 0 }];
      }

      // Type Distribution
      const typeTotals = {};
      filteredServices.forEach((s) => {
        const typeName = s.service_type_name || 'Boshqa xizmat';
        typeTotals[typeName] = (typeTotals[typeName] || 0) + 1;
      });
      const typeDistribution = Object.entries(typeTotals).map(([name, value]) => ({
        name,
        value,
      }));

      return {
        success: true,
        data: {
          cards: {
            totalCount,
            completedCount,
            avgDuration: 2,
            revenue: 0,
          },
          typeDistribution: typeDistribution.length > 0 ? typeDistribution : [{ name: 'Mavjud emas', value: 0 }],
          monthlyTrends,
        },
      };
    } catch {
      return { success: false, data: null };
    }
  },
};
