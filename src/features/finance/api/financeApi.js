import { axiosInstance } from '@/api/axiosInstance';

const mapExpense = (item) => ({
  id: item.id,
  expenseNumber: item.transaction_number || `EXP-${item.id?.slice(0, 8)}`,
  expenseTypeId: item.expense_type_id || 'exp_type_1',
  expenseTypeName: item.expense_type_name || 'Operatsion Xarajat',
  amount: Number(item.amount) || 0,
  currency: item.currency || 'USD',
  paymentMethod: 'Bank O\'tkazmasi',
  createdBy: item.created_by || 'Joriy Foydalanuvchi',
  date: item.transaction_date || new Date().toISOString().split('T')[0],
  status: 'PAID',
  description: item.notes || '',
  attachments: [],
  timeline: [],
});

const mapIncome = (item) => ({
  id: item.id,
  incomeNumber: item.transaction_number || `INC-${item.id?.slice(0, 8)}`,
  source: item.notes || 'Mijoz to\'lovi',
  amount: Number(item.amount) || 0,
  currency: item.currency || 'USD',
  date: item.transaction_date || new Date().toISOString().split('T')[0],
  customerName: item.customer_name || 'Mijoz',
});

export const financeApi = {
  async getMetrics() {
    try {
      const response = await axiosInstance.get('/finance/transactions');
      const txs = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const incomes = txs.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const expenses = txs.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      const profit = incomes - expenses;
      const efficiencyVal = incomes > 0 ? Math.max(0, Math.min(100, (profit / incomes) * 100)) : 0;
      const roiVal = expenses > 0 ? (profit / expenses) * 100 : 0;

      return {
        success: true,
        data: {
          totalRevenue: `$${incomes.toLocaleString()}`,
          totalExpenses: `$${expenses.toLocaleString()}`,
          netProfit: `$${profit.toLocaleString()}`,
          efficiencyScore: `${efficiencyVal.toFixed(1)}%`,
          roiRate: `${roiVal >= 0 ? '+' : ''}${roiVal.toFixed(1)}%`,
        }
      };
    } catch (err) {
      console.error("getMetrics error:", err);
      return {
        success: false,
        data: { totalRevenue: "$0", totalExpenses: "$0", netProfit: "$0", efficiencyScore: "0.0%", roiRate: "0.0%" },
        error: err,
      };
    }
  },

  async getChartData() {
    return { success: true, data: {} };
  },

  async getFinanceSummary() {
    try {
      const response = await axiosInstance.get('/finance/transactions');
      const txs = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let todayIncome = 0;
      let todayExpense = 0;
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      const todayStr = new Date().toISOString().split('T')[0];
      const thisMonthStr = new Date().toISOString().slice(0, 7);

      txs.forEach((t) => {
        const amt = Number(t.amount) || 0;
        const isToday = t.transaction_date === todayStr;
        const isThisMonth = t.transaction_date && t.transaction_date.startsWith(thisMonthStr);

        if (t.type === 'INCOME') {
          if (isToday) todayIncome += amt;
          if (isThisMonth) monthlyIncome += amt;
        } else if (t.type === 'EXPENSE') {
          if (isToday) todayExpense += amt;
          if (isThisMonth) monthlyExpense += amt;
        }
      });

      return {
        success: true,
        data: {
          todayIncome,
          todayExpense,
          netProfit: monthlyIncome - monthlyExpense,
          monthlyIncome,
          monthlyExpense,
          pendingReceivables: 0,
        }
      };
    } catch (err) {
      console.error("getFinanceSummary error:", err);
      return {
        success: false,
        data: { todayIncome: 0, todayExpense: 0, netProfit: 0, monthlyIncome: 0, monthlyExpense: 0, pendingReceivables: 0 },
        error: err,
      };
    }
  },

  async getMonthlyTrends() {
    try {
      const response = await axiosInstance.get('/reports/finance');
      if (response && response.success && response.data?.monthlyComparison) {
        return { success: true, data: response.data.monthlyComparison };
      }
      return { success: true, data: [] };
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async getExpenseCategoriesBreakdown() {
    try {
      const response = await axiosInstance.get('/reports/finance');
      if (response && response.success && response.data?.expenseDistribution) {
        return { success: true, data: response.data.expenseDistribution };
      }
      return { success: true, data: [] };
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async getExpenses(params = {}) {
    try {
      const response = await axiosInstance.get('/finance/transactions');
      const txs = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = txs.filter((t) => t.type === 'EXPENSE').map(mapExpense);

      if (params.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (e) =>
            e.expenseNumber.toLowerCase().includes(q) ||
            e.expenseTypeName.toLowerCase().includes(q)
        );
      }

      if (params.expenseTypeId) {
        result = result.filter((e) => e.expenseTypeId === params.expenseTypeId);
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getExpenses error:", err);
      return { success: false, data: [], error: err };
    }
  },

  async getExpenseById(id) {
    try {
      const response = await axiosInstance.get('/finance/transactions');
      const txs = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const exp = txs.find((e) => String(e.id) === String(id));
      if (!exp) return { success: false, message: 'Xarajat hujjati topilmadi' };
      return { success: true, data: mapExpense(exp) };
    } catch (err) {
      return { success: false, message: 'Xarajat hujjati topilmadi', error: err };
    }
  },

  async createExpense(expenseData) {
    try {
      const payload = {
        transaction_number: expenseData.expenseNumber || `EXP-${Date.now()}`,
        type: 'EXPENSE',
        expense_type_id: expenseData.expenseTypeId || null,
        amount: Number(expenseData.amount) || 0,
        currency: expenseData.currency || 'USD',
        transaction_date: expenseData.date || new Date().toISOString().split('T')[0],
        notes: expenseData.description || null,
      };

      const response = await axiosInstance.post('/finance/transactions', payload);
      const itemData = response?.data || response;
      return { success: true, data: mapExpense(itemData), message: 'Xarajat muvaffaqiyatli saqlandi va moliya balansidan yechildi!' };
    } catch (err) {
      console.error("createExpense error:", err);
      return { success: false, error: err, message: "Xarajatni saqlashda xatolik yuz berdi." };
    }
  },

  async updateExpense(id, updatedData) {
    try {
      const payload = {
        transaction_number: updatedData.expenseNumber,
        type: 'EXPENSE',
        expense_type_id: updatedData.expenseTypeId || null,
        amount: Number(updatedData.amount) || 0,
        currency: updatedData.currency || 'USD',
        transaction_date: updatedData.date,
        notes: updatedData.description || null,
      };
      const response = await axiosInstance.put(`/finance/transactions/${id}`, payload);
      const itemData = response?.data || response;
      return { success: true, data: mapExpense(itemData), message: "Xarajat ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateExpense error:", err);
      return { success: false, error: err, message: "Xarajatni yangilashda xatolik yuz berdi." };
    }
  },

  async deleteExpense(id) {
    try {
      await axiosInstance.delete(`/finance/transactions/${id}`);
      return { success: true, message: "Xarajat hujjati bekor qilindi." };
    } catch (err) {
      console.error("deleteExpense error:", err);
      return { success: false, error: err, message: "Xarajatni bekor qilishda xatolik yuz berdi." };
    }
  },

  async getIncomes(params = {}) {
    try {
      const response = await axiosInstance.get('/finance/transactions');
      const txs = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      let result = txs.filter((t) => t.type === 'INCOME').map(mapIncome);

      if (params.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (i) =>
            i.incomeNumber.toLowerCase().includes(q) ||
            i.source.toLowerCase().includes(q)
        );
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getIncomes error:", err);
      return { success: false, data: [], error: err };
    }
  },
};
