import {
  initialMockUsers,
  initialMockBranches,
  initialMockCustomers,
  initialMockBoilers,
  initialMockRecipes,
  initialMockProducts,
  initialMockOrders,
  initialMockEmployees,
  initialMockTransactions,
  initialMockProductionOrders,
  initialMockNotifications,
} from './mockData';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';

const STORAGE_KEYS = {
  CUSTOMERS: 'kotyol_mock_customers',
  BOILERS: 'kotyol_mock_boilers',
  RECIPES: 'kotyol_mock_recipes',
  PRODUCTS: 'kotyol_mock_products',
  ORDERS: 'kotyol_mock_orders',
  EMPLOYEES: 'kotyol_mock_employees',
  TRANSACTIONS: 'kotyol_mock_transactions',
  PRODUCTION_ORDERS: 'kotyol_mock_production_orders',
  NOTIFICATIONS: 'kotyol_mock_notifications',
  BRANCHES: 'kotyol_mock_branches',
};

class MockBackend {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    const initIfMissing = (key, initial) => {
      try {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(initial));
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    };

    initIfMissing(STORAGE_KEYS.CUSTOMERS, initialMockCustomers);
    initIfMissing(STORAGE_KEYS.BOILERS, initialMockBoilers);
    initIfMissing(STORAGE_KEYS.RECIPES, initialMockRecipes);
    initIfMissing(STORAGE_KEYS.PRODUCTS, initialMockProducts);
    initIfMissing(STORAGE_KEYS.ORDERS, initialMockOrders);
    initIfMissing(STORAGE_KEYS.EMPLOYEES, initialMockEmployees);
    initIfMissing(STORAGE_KEYS.TRANSACTIONS, initialMockTransactions);
    initIfMissing(STORAGE_KEYS.PRODUCTION_ORDERS, initialMockProductionOrders);
    initIfMissing(STORAGE_KEYS.NOTIFICATIONS, initialMockNotifications);
    initIfMissing(STORAGE_KEYS.BRANCHES, initialMockBranches);
  }

  getList(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  setList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      console.warn('MockBackend setList error:', e);
    }
  }

  handleRequest(config) {
    const rawUrl = config.url || '';
    // Normalize URL: remove origin and base /api/v1
    const cleanUrl = rawUrl
      .replace(/^https?:\/\/[^\/]+/, '')
      .replace(/^\/api\/v1/, '')
      .replace(/\/$/, '')
      .split('?')[0];

    const method = (config.method || 'get').toLowerCase();
    const data = typeof config.data === 'string' ? (JSON.parse(config.data || '{}')) : (config.data || {});
    const params = config.params || {};

    // 1. Auth endpoints
    if (cleanUrl === '/auth/login' || cleanUrl === '/auth/login/') {
      const user = initialMockUsers[0];
      return {
        status: 200,
        data: {
          success: true,
          access_token: 'mock-access-token-' + Date.now(),
          refresh_token: 'mock-refresh-token-' + Date.now(),
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            department: user.department,
            organization_name: user.organizationName,
            branch_name: user.branchName,
            organization_id: user.organization_id,
            branch_id: user.branch_id,
            currency: user.currency,
          },
        },
      };
    }

    if (cleanUrl === '/auth/register') {
      return {
        status: 200,
        data: {
          success: true,
          message: "Ro'yxatdan o'tildi (Demo rejim).",
        },
      };
    }

    if (cleanUrl === '/auth/refresh') {
      return {
        status: 200,
        data: {
          access_token: 'mock-access-token-' + Date.now(),
          refresh_token: 'mock-refresh-token-' + Date.now(),
        },
      };
    }

    // Branches
    if (cleanUrl === '/auth/branches' || cleanUrl === '/master-data/branches' || cleanUrl === '/branches') {
      const branches = this.getList(STORAGE_KEYS.BRANCHES);
      return {
        status: 200,
        data: {
          success: true,
          data: branches,
        },
      };
    }

    if (cleanUrl === '/auth/branches/stats') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            totalBranches: 2,
            activeBranches: 2,
            totalStaff: 15,
            totalTurnover: 192000000,
          },
        },
      };
    }

    // 2. Dashboard Endpoints
    if (cleanUrl === '/dashboard/summary') {
      const orders = this.getList(STORAGE_KEYS.ORDERS);
      const activeOrders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
      return {
        status: 200,
        data: {
          success: true,
          data: {
            activeOrders,
            activeProduction: 2,
            totalStockQuantity: 587,
            lowStockAlerts: 1,
            monthlyRevenue: 192000000,
            monthlyExpenses: 24700000,
          },
        },
      };
    }

    if (cleanUrl === '/dashboard/charts') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            salesExpenses: [
              { month: 'Yan', sales: 42000000, expenses: 28000000 },
              { month: 'Fev', sales: 58000000, expenses: 35000000 },
              { month: 'Mar', sales: 72000000, expenses: 48000000 },
              { month: 'Apr', sales: 65000000, expenses: 41000000 },
              { month: 'May', sales: 89000000, expenses: 53000000 },
              { month: 'Iyn', sales: 110000000, expenses: 60000000 },
            ],
            prodWarehouse: [
              { month: 'Yan', production: 8, warehouse: 15 },
              { month: 'Fev', production: 12, warehouse: 18 },
              { month: 'Mar', production: 14, warehouse: 22 },
              { month: 'Apr', production: 11, warehouse: 19 },
              { month: 'May', production: 16, warehouse: 25 },
              { month: 'Iyn', production: 18, warehouse: 28 },
            ],
          },
        },
      };
    }

    if (cleanUrl === '/notifications') {
      const notifications = this.getList(STORAGE_KEYS.NOTIFICATIONS);
      return {
        status: 200,
        data: {
          success: true,
          data: notifications,
        },
      };
    }

    if (cleanUrl === '/system/status') {
      return {
        status: 200,
        data: {
          success: true,
          data: { status: 'ONLINE', mode: 'STANDALONE_DEMO' },
        },
      };
    }

    // 3. Customers
    if (cleanUrl === '/master-data/customers' || cleanUrl === '/customers') {
      let customers = this.getList(STORAGE_KEYS.CUSTOMERS);
      if (method === 'get') {
        return {
          status: 200,
          data: {
            success: true,
            data: customers,
          },
        };
      }
      if (method === 'post') {
        const newCustomer = {
          id: `cust_${Date.now()}`,
          name: data.name || data.customerName,
          contact_name: data.contact_name || data.contactPerson || '',
          phone: data.phone || '',
          email: data.email || '',
          code: data.code || `CUST-${Date.now().toString().slice(-4)}`,
          address: typeof data.address === 'string' ? data.address : JSON.stringify(data.address || {}),
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        };
        customers.unshift(newCustomer);
        this.setList(STORAGE_KEYS.CUSTOMERS, customers);
        return {
          status: 200,
          data: {
            success: true,
            data: newCustomer,
            message: "Mijoz muvaffaqiyatli saqlandi.",
          },
        };
      }
    }

    const customerMatch = cleanUrl.match(/^\/master-data\/customers\/([^\/]+)$/) || cleanUrl.match(/^\/customers\/([^\/]+)$/);
    if (customerMatch) {
      const custId = customerMatch[1];
      let customers = this.getList(STORAGE_KEYS.CUSTOMERS);
      if (method === 'get') {
        const found = customers.find((c) => String(c.id) === String(custId));
        return { status: 200, data: { success: true, data: found || null } };
      }
      if (method === 'put') {
        customers = customers.map((c) => (String(c.id) === String(custId) ? { ...c, ...data } : c));
        this.setList(STORAGE_KEYS.CUSTOMERS, customers);
        const updated = customers.find((c) => String(c.id) === String(custId));
        return { status: 200, data: { success: true, data: updated, message: "Mijoz yangilandi." } };
      }
      if (method === 'delete') {
        customers = customers.filter((c) => String(c.id) !== String(custId));
        this.setList(STORAGE_KEYS.CUSTOMERS, customers);
        return { status: 200, data: { success: true, message: "Mijoz o'chirildi." } };
      }
    }

    // 4. Orders
    if (cleanUrl === '/orders' || cleanUrl === '/orders/create') {
      let orders = this.getList(STORAGE_KEYS.ORDERS);
      if (method === 'get') {
        return {
          status: 200,
          data: {
            success: true,
            data: orders,
          },
        };
      }
      if (method === 'post') {
        const newOrder = {
          id: `ord_${Date.now()}`,
          order_number: data.order_number || `ORD-${Date.now().toString().slice(-4)}`,
          order_name: data.order_name || 'Yangi buyurtma',
          customer_id: data.customer_id,
          customer_name: data.customer_name || 'Mijoz',
          boiler_id: data.boiler_id,
          boiler_model_name: data.boiler_model_name || 'Kotyol',
          quantity: Number(data.quantity) || 1,
          unit_price: Number(data.unit_price) || 45000000,
          total_amount: Number(data.total_amount) || (Number(data.unit_price || 45000000) * Number(data.quantity || 1)),
          deposit_amount: Number(data.deposit_amount) || 15000000,
          expected_delivery_date: data.expected_delivery_date || '',
          priority: data.priority || 'NORMAL',
          status: data.status || 'NEW',
          production_status: 'PENDING',
          payment_status: 'PARTIAL',
          notes: data.notes || '',
          created_at: new Date().toISOString(),
        };
        orders.unshift(newOrder);
        this.setList(STORAGE_KEYS.ORDERS, orders);
        return {
          status: 200,
          data: {
            success: true,
            data: newOrder,
            message: "Buyurtma muvaffaqiyatli rasmiylashtirildi.",
          },
        };
      }
    }

    const orderMatch = cleanUrl.match(/^\/orders\/([^\/]+)$/);
    if (orderMatch) {
      const ordId = orderMatch[1];
      let orders = this.getList(STORAGE_KEYS.ORDERS);
      if (method === 'get') {
        const found = orders.find((o) => String(o.id) === String(ordId));
        return { status: 200, data: { success: true, data: found || null } };
      }
      if (method === 'put') {
        orders = orders.map((o) => (String(o.id) === String(ordId) ? { ...o, ...data } : o));
        this.setList(STORAGE_KEYS.ORDERS, orders);
        const updated = orders.find((o) => String(o.id) === String(ordId));
        return { status: 200, data: { success: true, data: updated, message: "Buyurtma yangilandi." } };
      }
      if (method === 'delete') {
        orders = orders.filter((o) => String(o.id) !== String(ordId));
        this.setList(STORAGE_KEYS.ORDERS, orders);
        return { status: 200, data: { success: true, message: "Buyurtma o'chirildi." } };
      }
    }

    if (cleanUrl.includes('/start-production')) {
      return {
        status: 200,
        data: {
          success: true,
          message: "Buyurtma bo'yicha ishlab chiqarish boshlandi va sexga yuborildi!",
        },
      };
    }

    // 5. Boilers
    if (cleanUrl === '/master-data/boilers' || cleanUrl === '/boilers') {
      let boilers = this.getList(STORAGE_KEYS.BOILERS);
      if (method === 'get') {
        return { status: 200, data: { success: true, data: boilers } };
      }
      if (method === 'post') {
        const newBoiler = {
          id: `b_${Date.now()}`,
          name: data.modelName || data.name,
          modelName: data.modelName || data.name,
          code: data.code || `KV-${Date.now().toString().slice(-4)}`,
          internalCode: data.code || `KV-${Date.now().toString().slice(-4)}`,
          unit_price: Number(data.unit_price || data.totalCost || 40000000),
          recipe_id: data.recipeId || data.recipe_id || '',
          recipe_name: data.recipeName || data.recipe_name || 'BOM',
          warranty_duration: data.warrantyDuration || 12,
          warranty_type_name: data.warrantyTypeName || '12 oy',
          status: 'ACTIVE',
          description: data.description || '',
          created_at: new Date().toISOString(),
        };
        boilers.unshift(newBoiler);
        this.setList(STORAGE_KEYS.BOILERS, boilers);
        return { status: 200, data: { success: true, data: newBoiler, message: "Kotyol modeli saqlandi." } };
      }
    }

    const boilerMatch = cleanUrl.match(/^\/master-data\/boilers\/([^\/]+)$/) || cleanUrl.match(/^\/boilers\/([^\/]+)$/);
    if (boilerMatch) {
      const bId = boilerMatch[1];
      let boilers = this.getList(STORAGE_KEYS.BOILERS);
      const found = boilers.find((b) => String(b.id) === String(bId));
      return { status: 200, data: { success: true, data: found || null } };
    }

    // 6. Recipes
    if (cleanUrl === '/recipes' || cleanUrl === '/production/recipes') {
      let recipes = this.getList(STORAGE_KEYS.RECIPES);
      return { status: 200, data: { success: true, data: recipes } };
    }

    const recipeMatch = cleanUrl.match(/^\/recipes\/([^\/]+)$/);
    if (recipeMatch) {
      const rId = recipeMatch[1];
      const recipes = this.getList(STORAGE_KEYS.RECIPES);
      const found = recipes.find((r) => String(r.id) === String(rId));
      return { status: 200, data: { success: true, data: found || null } };
    }

    // 7. Warehouse, Products, Stocks
    if (
      cleanUrl === '/warehouse/stocks' ||
      cleanUrl === '/warehouse/stock' ||
      cleanUrl === '/products' ||
      cleanUrl === '/products/'
    ) {
      let products = this.getList(STORAGE_KEYS.PRODUCTS);
      if (method === 'get') {
        return { status: 200, data: { success: true, data: products } };
      }
      if (method === 'post') {
        const newProduct = {
          id: `prod_${Date.now()}`,
          product_id: `prod_${Date.now()}`,
          name: data.name || data.productName,
          product_name: data.name || data.productName,
          code: data.code || `MAT-${Date.now().toString().slice(-4)}`,
          product_code: data.code || `MAT-${Date.now().toString().slice(-4)}`,
          quantity: Number(data.quantity) || 10,
          reserved_quantity: 0,
          unit_name: data.unitName || data.unit_name || 'dona',
          avg_unit_cost: Number(data.purchasePrice || data.unitPrice) || 1000000,
          purchasePrice: Number(data.purchasePrice || data.unitPrice) || 1000000,
          category_name: data.categoryName || 'Xomashyo',
          warehouse_id: 'wh_1',
          warehouse_name: 'Asosiy Ombor (Xomashyo)',
          status: 'ACTIVE',
        };
        products.unshift(newProduct);
        this.setList(STORAGE_KEYS.PRODUCTS, products);
        return { status: 200, data: { success: true, data: newProduct, message: "Mahsulot saqlandi." } };
      }
    }

    if (cleanUrl === '/warehouse/stats') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            totalQuantity: 587,
            totalValuation: 245000000,
            lowStockAlerts: 1,
            reservedStock: 104,
          },
        },
      };
    }

    if (cleanUrl === '/master-data/warehouses' || cleanUrl === '/warehouses') {
      return {
        status: 200,
        data: {
          success: true,
          data: [
            { id: 'wh_1', name: 'Asosiy Ombor (Xomashyo)', code: 'WH-01', location: '1-Sex' },
            { id: 'wh_2', name: 'Tayyor Mahsulotlar Ombori', code: 'WH-02', location: '2-Sex' },
          ],
        },
      };
    }

    // 8. Employees
    if (cleanUrl === '/master-data/employees' || cleanUrl === '/employees') {
      let employees = this.getList(STORAGE_KEYS.EMPLOYEES);
      if (method === 'get') {
        return { status: 200, data: { success: true, data: employees } };
      }
      if (method === 'post') {
        const newEmp = {
          id: `emp_${Date.now()}`,
          code: `EMP-${Date.now().toString().slice(-3)}`,
          full_name: data.fullName || data.full_name || 'Xodim',
          phone: data.phone || '',
          email: data.email || '',
          role: data.role || 'EMPLOYEE',
          roleName: data.role || 'Xodim',
          position_name: data.positionName || 'Mutaxassis',
          department: data.department || 'Boshqaruv',
          status: 'ACTIVE',
          salary_amount: Number(data.salaryAmount) || 8000000,
        };
        employees.unshift(newEmp);
        this.setList(STORAGE_KEYS.EMPLOYEES, employees);
        return { status: 200, data: { success: true, data: newEmp, message: "Xodim saqlandi." } };
      }
    }

    // 9. Finance Transactions
    if (cleanUrl === '/finance/transactions' || cleanUrl === '/reports/finance') {
      let transactions = this.getList(STORAGE_KEYS.TRANSACTIONS);
      if (method === 'get') {
        return { status: 200, data: { success: true, data: transactions } };
      }
      if (method === 'post') {
        const newTx = {
          id: `tx_${Date.now()}`,
          transaction_number: `${data.type === 'INCOME' ? 'INC' : 'EXP'}-${Date.now().toString().slice(-4)}`,
          type: data.type || 'INCOME',
          amount: Number(data.amount) || 1000000,
          currency: data.currency || 'UZS',
          transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
          notes: data.notes || '',
          customer_name: data.customer_name || 'Mijoz',
          expense_type_name: data.expense_type_name || 'Operatsion xarajat',
        };
        transactions.unshift(newTx);
        this.setList(STORAGE_KEYS.TRANSACTIONS, transactions);
        return { status: 200, data: { success: true, data: newTx, message: "Tranzaksiya saqlandi." } };
      }
    }

    // 10. Production Orders
    if (cleanUrl === '/production/orders' || cleanUrl === '/production/work-orders') {
      const prodOrders = this.getList(STORAGE_KEYS.PRODUCTION_ORDERS);
      return { status: 200, data: { success: true, data: prodOrders } };
    }

    // 11. Generic Master Data endpoints (/master-data/:apiKey)
    const masterDataMatch = cleanUrl.match(/^\/master-data\/([^\/]+)$/);
    if (masterDataMatch) {
      const entityKey = masterDataMatch[1];
      // Convert hyphenated to camelCase
      const camelKey = entityKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      const list = dynamicSettingsService.getList(camelKey, { includeArchived: true });
      return {
        status: 200,
        data: {
          success: true,
          data: list || [],
        },
      };
    }

    // Default safe fallback for unhandled GET requests
    if (method === 'get') {
      return {
        status: 200,
        data: {
          success: true,
          data: [],
          message: "Demo ma'lumot",
        },
      };
    }

    // Default safe fallback for unhandled POST/PUT/DELETE
    return {
      status: 200,
      data: {
        success: true,
        data: { id: `item_${Date.now()}`, ...data },
        message: "Muvaffaqiyatli bajarildi (Demo).",
      },
    };
  }
}

export const mockBackend = new MockBackend();
