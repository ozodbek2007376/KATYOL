import { axiosInstance } from '@/api/axiosInstance';

const mapEmployee = (user, positionsList = [], salaryTypesList = []) => {
  if (!user) return null;
  const nameParts = user.full_name?.trim().split(' ') || [];
  const isOwnerUser = user.role === 'OWNER' || user.role === 'ADMIN' || user.is_owner || false;

  let posName = user.position_name || user.position?.name;
  if (!posName && user.position_id) {
    const matchedPos = (Array.isArray(positionsList) ? positionsList : []).find(
      (p) => String(p.id) === String(user.position_id) || String(p.name) === String(user.position_id)
    );
    if (matchedPos) posName = matchedPos.name;
  }

  if (!posName && user.role && user.role !== 'EMPLOYEE' && user.role !== 'USER') {
    if (isOwnerUser) {
      posName = 'Tizim Egasi (Owner)';
    } else {
      posName = user.role;
    }
  }

  if (!posName) {
    posName = isOwnerUser ? 'Tizim Egasi (Owner)' : '-';
  }

  let salName = user.salary_type_name || user.salary_type?.name;
  if (!salName && user.salary_type_id) {
    const matchedSal = (Array.isArray(salaryTypesList) ? salaryTypesList : []).find(
      (s) => String(s.id) === String(user.salary_type_id)
    );
    if (matchedSal) salName = matchedSal.name;
  }

  return {
    id: user.id,
    code: user.code || (user.id ? String(user.id).substring(0, 8) : ''),
    firstName: nameParts[0] || 'Xodim',
    lastName: nameParts.slice(1).join(' ') || '',
    fullName: user.full_name || 'Xodim',
    phone: user.phone || '',
    email: user.email || '',
    role: isOwnerUser ? 'OWNER' : user.role || 'EMPLOYEE',
    isOwner: isOwnerUser,
    roleName: isOwnerUser ? 'OWNER' : user.role || 'Xodim',
    positionId: user.position_id || user.position || null,
    positionName: posName,
    department: user.department || 'Boshqaruv',
    status: user.status || 'ACTIVE',
    salaryAmount: Number(user.salary_amount) || 0,
    salaryTypeId: user.salary_type_id || null,
    salaryTypeName: salName || '-',
    hireDate: user.hire_date || '',
  };
};

export const employeesApi = {
  // Employees Endpoints
  getEmployees: async (filters = {}) => {
    try {
      const [response, posResponse, salResponse] = await Promise.all([
        axiosInstance.get('/auth/employees'),
        axiosInstance.get('/auth/positions').catch(() => null),
        axiosInstance.get('/master-data/salary-types').catch(() => null),
      ]);

      const items = response.data || response || [];
      const positions = posResponse?.data || posResponse || [];
      const salaryTypes = salResponse?.data || salResponse || [];

      const posMap = new Map(
        (Array.isArray(positions) ? positions : []).map((p) => [String(p.id), p.name])
      );
      const salMap = new Map(
        (Array.isArray(salaryTypes) ? salaryTypes : []).map((s) => [String(s.id), s.name])
      );

      let result = (Array.isArray(items) ? items : []).map((user) => {
        const emp = mapEmployee(user, positions, salaryTypes);
        if (emp.positionId && posMap.has(String(emp.positionId))) {
          emp.positionName = posMap.get(String(emp.positionId));
        }
        if (emp.salaryTypeId && salMap.has(String(emp.salaryTypeId))) {
          emp.salaryTypeName = salMap.get(String(emp.salaryTypeId));
        }
        return emp;
      });

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (e) =>
            e.firstName.toLowerCase().includes(q) ||
            e.lastName.toLowerCase().includes(q) ||
            e.fullName.toLowerCase().includes(q) ||
            e.phone.toLowerCase().includes(q)
        );
      }

      if (filters.status) {
        result = result.filter((e) => e.status === filters.status);
      }

      if (filters.positionId) {
        result = result.filter((e) => String(e.positionId) === String(filters.positionId));
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("getEmployees error:", err);
      return { success: false, data: [], error: err };
    }
  },

  getEmployeeById: async (id) => {
    try {
      const response = await axiosInstance.get('/auth/employees');
      const items = response.data || response || [];
      const emp = (Array.isArray(items) ? items : []).find((e) => String(e.id) === String(id));
      return { success: true, data: mapEmployee(emp) };
    } catch (err) {
      return { success: false, data: null, error: err };
    }
  },

  createEmployee: async (empData) => {
    try {
      const fName = (empData.firstName || '').trim();
      const lName = (empData.lastName || '').trim();
      const fullName = `${fName} ${lName}`.trim() || 'Xodim';
      const dept = (empData.department || '').trim() || 'Boshqaruv';
      const roleValue = empData.positionName || empData.positionId || 'EMPLOYEE';

      const payload = {
        phone: empData.phone,
        password: 'Password123!',
        full_name: fullName,
        role: roleValue,
        position_id: empData.positionId || null,
        salary_type_id: empData.salaryTypeId || null,
        salary_amount: empData.salaryAmount || 0,
        department: dept,
      };
      const response = await axiosInstance.post('/auth/employees/create', payload);
      return { success: true, data: response.data || response, message: "Yangi xodim qo'shildi." };
    } catch (err) {
      console.error("createEmployee error:", err);
      return { success: false, error: err, message: "Xodimlarni saqlashda xatolik yuz berdi." };
    }
  },

  updateEmployee: async (id, empData) => {
    try {
      const fName = (empData.firstName || '').trim();
      const lName = (empData.lastName || '').trim();
      const fullName = `${fName} ${lName}`.trim() || 'Xodim';
      const dept = (empData.department || '').trim() || 'Boshqaruv';
      const roleValue = empData.positionName || empData.positionId || 'EMPLOYEE';

      const payload = {
        phone: empData.phone,
        full_name: fullName,
        role: roleValue,
        position_id: empData.positionId || null,
        salary_type_id: empData.salaryTypeId || null,
        salary_amount: empData.salaryAmount || 0,
        department: dept,
      };
      const response = await axiosInstance.put(`/auth/employees/${id}`, payload);
      return { success: true, data: response.data || response, message: "Xodim ma'lumotlari yangilandi." };
    } catch (err) {
      console.error("updateEmployee error:", err);
      return { success: false, error: err, message: "Xodimni yangilashda xatolik yuz berdi." };
    }
  },

  deleteEmployee: async (id) => {
    try {
      await axiosInstance.delete(`/auth/employees/${id}/delete`);
      return { success: true, message: "Xodim tizimdan o'chirildi." };
    } catch (err) {
      return { success: false, error: err, message: "Xodimni o'chirishda xatolik yuz berdi." };
    }
  },

  // Positions Endpoints
  getPositions: async () => {
    try {
      const response = await axiosInstance.get('/auth/positions');
      const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { success: true, data: items };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createPosition: async (posData) => {
    try {
      const payload = {
        name: posData.name,
        description: posData.description || '',
        status: posData.status || 'ACTIVE',
        permissions: posData.permissions || '[]',
      };
      const response = await axiosInstance.post('/auth/positions/create', payload);
      return { success: true, data: response?.data || response, message: "Yangi lavozim yaratildi." };
    } catch (err) {
      return { success: false, error: err, message: "Lavozim yaratishda xatolik yuz berdi." };
    }
  },

  updatePosition: async (id, posData) => {
    try {
      const response = await axiosInstance.put(`/auth/positions/${id}`, posData);
      return { success: true, data: response?.data || response, message: "Lavozim yangilandi." };
    } catch (err) {
      return { success: false, error: err, message: "Lavozimni yangilashda xatolik yuz berdi." };
    }
  },

  deletePosition: async (id) => {
    try {
      const response = await axiosInstance.delete(`/auth/positions/${id}/delete`);
      return { success: true, message: "Lavozim o'chirildi." };
    } catch (err) {
      return { success: false, error: err, message: "Lavozimni o'chirishda xatolik yuz berdi." };
    }
  },

  // Salary Types Endpoints
  getSalaryTypes: async () => {
    try {
      const response = await axiosInstance.get('/master-data/salary-types');
      const items = response.data || response || [];
      return { success: true, data: Array.isArray(items) ? items : [] };
    } catch (err) {
      return { success: false, data: [], error: err };
    }
  },

  createSalaryType: async (salaryData) => {
    try {
      const payload = {
        code: salaryData.code || `SAL-${Date.now()}`,
        name: salaryData.name,
        amount: salaryData.amount || 0,
        description: salaryData.description || '',
      };
      const response = await axiosInstance.post('/master-data/salary-types/create', payload);
      return { success: true, data: response.data || response, message: "Yangi maosh turi yaratildi." };
    } catch (err) {
      return { success: false, error: err, message: "Maosh turi yaratishda xatolik yuz berdi." };
    }
  },

  updateSalaryType: async (id, salaryData) => {
    try {
      const payload = {
        code: salaryData.code,
        name: salaryData.name,
        amount: salaryData.amount || 0,
        description: salaryData.description || '',
      };
      const response = await axiosInstance.put(`/master-data/salary-types/${id}`, payload);
      return { success: true, data: response.data || response, message: "Maosh turi yangilandi." };
    } catch (err) {
      return { success: false, error: err, message: "Maosh turini yangilashda xatolik yuz berdi." };
    }
  },

  deleteSalaryType: async (id) => {
    try {
      await axiosInstance.delete(`/master-data/salary-types/${id}`);
      return { success: true, message: "Maosh turi o'chirildi." };
    } catch (err) {
      return { success: false, error: err, message: "Maosh turini o'chirishda xatolik yuz berdi." };
    }
  },

  getEmployeeActivities: async () => {
    try {
      const response = await axiosInstance.get('/audit-logs');
      const items = response.data || response || [];
      return { success: true, data: Array.isArray(items) ? items : [] };
    } catch (err) {
      return { success: true, data: [] };
    }
  },
};
