import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes.constants';
import { SearchInput } from '@/components/common/SearchInput/SearchInput';
import { branchesApi } from '@/features/settings/api/branchesApi';
import { notifyInfo } from '@/services/notification.service';
import {
  LuMoon,
  LuSun,
  LuList,
  LuUserCheck,
  LuKey,
  LuLogOut,
  LuArrowLeft,
  LuGitBranch,
  LuRefreshCw,
} from 'react-icons/lu';

export const Navbar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toggleMobileSidebar } = useSidebarStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(
    localStorage.getItem('active_branch_id') || ''
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBranches();
    }
  }, [user]);

  const loadBranches = async () => {
    try {
      const res = await branchesApi.getBranches();
      if (res.success && res.data) {
        setBranches(res.data);
        if (!localStorage.getItem('active_branch_id') && user.branch_id) {
          localStorage.setItem('active_branch_id', user.branch_id);
          setActiveBranchId(user.branch_id);
        }
      }
    } catch (err) {
      console.error('Failed to load branches in Navbar', err);
    }
  };

  const handleBranchSwitch = (branchId) => {
    localStorage.setItem('active_branch_id', branchId);
    setActiveBranchId(branchId);
    window.location.reload();
  };

  const handlePageReload = async () => {
    setIsRefreshing(true);
    try {
      // 1. Refetch all active queries in TanStack React Query
      await queryClient.invalidateQueries();

      // 2. Dispatch custom event for non-react-query page states
      window.dispatchEvent(new Event('app-page-reload'));

      notifyInfo("Joriy sahifa ma'lumotlari yangilandi", 'Qayta yuklandi');
    } catch (err) {
      console.error('Page refresh error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  return (
    <header
      className="navbar navbar-expand bg-navbar-custom border-bottom border-custom sticky-top px-3 shadow-sm"
      style={{ height: '60px', backgroundColor: 'var(--erp-navbar-bg)', opacity: 1, zIndex: 1050 }}
    >
      <div className="container-fluid px-0 d-flex align-items-center justify-content-between">
        {/* Left Controls */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary border-custom bg-body-custom text-main d-flex d-md-none align-items-center justify-content-center p-2"
            onClick={toggleMobileSidebar}
          >
            <LuList className="fs-5" />
          </button>

          <button
            className="btn btn-sm btn-outline-secondary border-custom bg-body-custom text-main d-flex align-items-center justify-content-center gap-1 p-2"
            onClick={() => navigate(-1)}
            title="Orqaga"
          >
            <LuArrowLeft className="fs-5" />
            <span className="d-none d-md-inline fs-8 fw-semibold">Orqaga</span>
          </button>

          {/* Global Search */}
          <div className="d-none d-sm-block ms-2" style={{ width: '280px' }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Umumiy ERP qidiruv (Ctrl+K)..."
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-2">
          {localStorage.getItem('is_demo_mode') === 'true' && (
            <span
              className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle d-none d-md-inline-flex align-items-center gap-1 fs-8 py-1 px-2"
              title="Backend serverga ulanmasdan lokal (Demo) rejimda ishlamoqda"
            >
              <i className="bi bi-hdd-network-fill"></i>
              <span>Backendsiz Rejim</span>
            </span>
          )}

          {/* Page Data Reload Button */}
          <button
            className="btn btn-sm btn-outline-secondary border-custom bg-body-custom text-main p-2 d-flex align-items-center justify-content-center"
            onClick={handlePageReload}
            title="Joriy sahifa ma'lumotlarini qayta yangilash (API)"
            disabled={isRefreshing}
          >
            <LuRefreshCw className={`fs-6 ${isRefreshing ? 'spin-animation text-primary' : ''}`} />
          </button>

          {/* Branch Switcher Dropdown */}
          {branches.length > 0 && (
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-secondary border-custom bg-body-custom text-main d-flex align-items-center gap-1 p-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Filialni almashtirish"
              >
                <LuGitBranch className="text-primary fs-6" />
                <span className="d-none d-md-inline fs-8 fw-semibold">
                  {branches.find((b) => b.id === activeBranchId)?.name || 'Filial tanlash'}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end border-custom shadow-sm p-1 fs-7">
                <li className="dropdown-header text-uppercase text-muted-custom fs-8 py-1 px-3">
                  Filiallar
                </li>
                {branches.map((b) => (
                  <li key={b.id}>
                    <button
                      className={`dropdown-item py-2 d-flex align-items-center justify-content-between ${
                        b.id === activeBranchId ? 'active bg-primary text-white fw-bold' : ''
                      }`}
                      onClick={() => handleBranchSwitch(b.id)}
                    >
                      {b.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            className="btn btn-sm btn-outline-secondary border-custom bg-body-custom text-main p-2 d-flex align-items-center justify-content-center"
            onClick={toggleTheme}
            title={`${theme === 'light' ? 'Tungi' : 'Kunduzgi'} rejimga o'tish`}
          >
            {theme === 'light' ? (
              <LuMoon className="text-warning fs-6" />
            ) : (
              <LuSun className="text-warning fs-6" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="dropdown ms-2">
            <button
              className="btn btn-sm btn-outline-secondary border-custom bg-body-custom text-main d-flex align-items-center gap-2 p-1 pe-2"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="d-none d-lg-block text-start" style={{ lineHeight: '1.2' }}>
                <span className="fw-semibold text-main fs-8 d-block">
                  {user?.name || 'Foydalanuvchi'}
                </span>
                <small className="text-muted-custom fs-8">
                  {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER'
                    ? 'OWNER'
                    : user?.role || 'OWNER'}
                </small>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end border-custom shadow-sm p-1 fs-7">
              <li className="px-3 py-2 border-bottom border-custom">
                <span className="fw-bold d-block text-main">{user?.name || 'Foydalanuvchi'}</span>
                <small className="text-muted-custom">{user?.phone || ''}</small>
              </li>
              <li>
                <Link className="dropdown-item py-2 mt-1" to={ROUTES.PROTECTED.PROFILE}>
                  <LuUserCheck className="me-2 text-primary" /> Profil
                </Link>
              </li>
              <li>
                <Link className="dropdown-item py-2" to={ROUTES.PROTECTED.CHANGE_PASSWORD}>
                  <LuKey className="me-2 text-warning" /> Parolni O'zgartirish
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider my-1 border-custom" />
              </li>
              <li>
                <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                  <LuLogOut className="me-2" /> Chiqish
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};
