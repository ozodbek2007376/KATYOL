import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuWrench, LuPlus, LuEye, LuPencil, LuTrash2, LuFileCheck } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ServicesFilterBar } from '../components/ServicesFilterBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { Modal } from '@/components/common/Modal/Modal';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { servicesApi } from '../api/servicesApi';
import { usePermission } from '@/hooks/usePermission';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';
import { formatCurrency } from '@/utils/currency.utils';

export const ServicesPage = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermission();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [customers, setCustomers] = useState([]);
  const [boilers, setBoilers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceStatuses, setServiceStatuses] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveServiceId, setResolveServiceId] = useState(null);
  const [resolveFormData, setResolveFormData] = useState({
    serviceCost: 0,
    employeeCost: 0,
  });

  useEffect(() => {
    loadServicesData();
  }, [search, customerFilter, serviceTypeFilter, statusFilter]);

  const loadServicesData = async () => {
    const [srvRes, custRes, boilRes, empRes, stRes, statRes] = await Promise.all([
      servicesApi.getServices({
        search,
        customerId: customerFilter,
        serviceTypeId: serviceTypeFilter,
        status: statusFilter,
      }),
      servicesApi.getCustomersList(),
      servicesApi.getBoilersList(),
      servicesApi.getEmployeesList(),
      servicesApi.getServiceTypes(),
      servicesApi.getServiceStatuses(),
    ]);

    if (srvRes.success) setServices(srvRes.data);
    if (custRes.success) setCustomers(custRes.data);
    if (boilRes.success) setBoilers(boilRes.data);
    if (empRes.success) setEmployees(empRes.data);
    if (stRes.success) setServiceTypes(stRes.data);
    if (statRes.success) setServiceStatuses(statRes.data);
  };

  usePageAutoRefresh(loadServicesData, { intervalMs: 15000, isEditing: isModalOpen || isConfirmOpen });

  const handleOpenAddModal = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, srv) => {
    e.stopPropagation();
    setSelectedService(srv);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (e, id) => {
    e.stopPropagation();
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleSaveService = async (formData) => {
    let res;
    if (selectedService?.id) {
      res = await servicesApi.updateService(selectedService.id, formData);
    } else {
      res = await servicesApi.createService(formData);
    }

    if (res.success) {
      notifySuccess(res.message || "Servis arizasi saqlandi.");
      setIsModalOpen(false);
      loadServicesData();
    } else {
      notifyError(res.message || "Servis arizasini saqlashda xatolik.");
    }
  };

  const handleDeleteService = async () => {
    if (!deleteId) return;
    const res = await servicesApi.deleteService(deleteId);
    if (res.success) {
      notifySuccess(res.message || "Servis arizasi o'chirildi.");
    } else {
      notifyError(res.message || "Servis arizasini o'chirishda xatolik.");
    }
    setIsConfirmOpen(false);
    setDeleteId(null);
    loadServicesData();
  };

  const handleOpenResolveModal = (e, id) => {
    e.stopPropagation();
    setResolveServiceId(id);
    setResolveFormData({ serviceCost: 0, employeeCost: 0 });
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveServiceId) return;
    const res = await servicesApi.completeService(resolveServiceId, resolveFormData);
    if (res.success) {
      notifySuccess(res.message || "Servis muvaffaqiyatli yakunlandi.");
      setIsResolveModalOpen(false);
      setResolveServiceId(null);
      loadServicesData();
    } else {
      notifyError(res.message || "Servisni yakunlashda xatolik.");
    }
  };

  const columns = [
    {
      header: 'Servis № va Hujjat',
      cell: (row) => (
        <div>
          <strong className="text-main fs-7 d-block">{row.serviceNumber}</strong>
          <small className="text-muted-custom fs-8">Sana: {row.serviceDate}</small>
        </div>
      ),
    },
    {
      header: 'Mijoz Korxona',
      cell: (row) => (
        <div>
          <span className="fw-semibold text-main fs-7 d-block">{row.customerName}</span>
          <small className="text-secondary fs-8">Kotyol: {row.boilerModelName}</small>
        </div>
      ),
    },
    {
      header: 'Servis Xizmati Turi',
      cell: (row) => <span className="badge bg-primary bg-opacity-10 text-primary fs-8">{row.serviceTypeName}</span>,
    },
    {
      header: 'Prioritet',
      cell: (row) => {
        const prioColors = {
          URGENT: 'bg-danger text-white',
          HIGH: 'bg-warning text-dark',
          NORMAL: 'bg-info text-white',
          LOW: 'bg-secondary text-white',
        };
        const badgeClass = prioColors[row.priority?.toUpperCase()] || 'bg-light text-dark border';
        return (
          <span className={`badge ${badgeClass} fs-8`}>
            {row.priority || 'NORMAL'}
          </span>
        );
      },
    },
    {
      header: 'Biriktirilgan Usta',
      cell: (row) => <span className="fw-medium text-main fs-7">{row.assignedEmployeeName || '— (Biriktirilmagan)'}</span>,
    },
    {
      header: 'Status',
      cell: (row) => {
        const found = serviceStatuses.find((s) => s.value === row.status || s.code === row.status);
        return (
          <div className="d-flex flex-column align-items-start">
            <span
              className={`badge ${
                row.status === 'COMPLETED'
                  ? 'bg-success'
                  : row.status === 'IN_PROGRESS'
                  ? 'bg-warning text-dark'
                  : 'bg-secondary'
              } fs-8`}
            >
              {found ? found.label || found.name : row.statusName || row.status}
            </span>
            {row.status === 'COMPLETED' && row.serviceCost > 0 && (
              <span className="text-success fs-8 fw-semibold mt-1">
                Qiymati: {formatCurrency(row.serviceCost)}
              </span>
            )}
            {row.status === 'COMPLETED' && row.employeeCost > 0 && (
              <span className="text-muted-custom fs-8">
                Usta: {formatCurrency(row.employeeCost)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Amallar',
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          {row.status !== 'COMPLETED' && (
            <button
              className="btn btn-xs btn-success px-2 py-1 fs-8 fw-semibold text-white d-flex align-items-center gap-1 me-1"
              onClick={(e) => handleOpenResolveModal(e, row.id)}
              title="Servisni yakunlash"
            >
              <LuFileCheck size={12} /> Yakunlash
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-primary p-1 border-0"
            onClick={() => navigate(`${ROUTES.PROTECTED.SERVICES}/${row.id}`)}
            title="Tafsilotini ko'rish"
          >
            <LuEye />
          </button>
          {canEdit && (
            <button
              className="btn btn-sm btn-outline-warning p-1 border-0"
              onClick={(e) => handleOpenEditModal(e, row)}
              title="Tahrirlash"
            >
              <LuPencil />
            </button>
          )}
          {canDelete && (
            <button
              className="btn btn-sm btn-outline-danger p-1 border-0"
              onClick={(e) => handleOpenDeleteConfirm(e, row.id)}
              title="O'chirish"
            >
              <LuTrash2 />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="services-page animate-fade-in pb-5">
      <PageHeader
        title="Servis va Kafolat Moduli"
        subtitle="Sotilgan sanoat kotyollari va pechlarining kafolatli va to'lovli texnik servisi"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Servis' },
        ]}
        actions={
          canCreate && (
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handleOpenAddModal}>
              <LuPlus />
              <span>Yangi Servis Ariza</span>
            </button>
          )
        }
      />

      <ServicesFilterBar
        search={search}
        onSearchChange={setSearch}
        customerFilter={customerFilter}
        onCustomerChange={setCustomerFilter}
        serviceTypeFilter={serviceTypeFilter}
        onServiceTypeChange={setServiceTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        customers={customers}
        serviceTypes={serviceTypes}
        serviceStatuses={serviceStatuses}
      />

      <Card title={`Servis Arizalari Ro'yxati (${services.length} ta)`}>
        <Table columns={columns} data={services} tableKey="services_list" />
      </Card>

      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceRecord={selectedService}
        onSubmit={handleSaveService}
        customers={customers}
        boilers={boilers}
        employees={employees}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteService}
        title="Servis Arizasini O'chirish"
        message="Haqiqatan ham ushbu servis arizasini tizimdan o'chirmoqchimisiz?"
      />

      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Servis Arizasini Yakunlash"
        size="md"
      >
        <form onSubmit={handleResolveSubmit} className="d-flex flex-column gap-3">
          <div className="bg-body-custom p-3 rounded-3 border-custom fs-7 text-main mb-2">
            Servis arizasini yakunlash uchun umumiy kelishilgan xizmat narxini kiritishingiz va mas'ul usta/xodimga beriladigan mukofot (agar mavjud bo'lsa) ulushini ko'rsatishingiz mumkin.
          </div>
          <div>
            <label className="form-label fs-7 fw-medium text-main">Servis Yakunlash Qiymati (Jami Narx)</label>
            <input
              type="number"
              className="form-control fs-7"
              value={resolveFormData.serviceCost}
              onChange={(e) => setResolveFormData({ ...resolveFormData, serviceCost: Number(e.target.value) })}
              required
              min="0"
              placeholder="Umumiy to'lov miqdori..."
            />
          </div>
          <div>
            <label className="form-label fs-7 fw-medium text-main">Xodim uchun pul (Usta ulushi — ixtiyoriy)</label>
            <input
              type="number"
              className="form-control fs-7"
              value={resolveFormData.employeeCost}
              onChange={(e) => setResolveFormData({ ...resolveFormData, employeeCost: Number(e.target.value) })}
              min="0"
              placeholder="Xodimga berilgan narx..."
            />
            <small className="text-muted-custom fs-8 mt-1 d-block">
              Ushbu narx xodim maoshiga avtomatik qo'shiladi va tizimda qayd etiladi.
            </small>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setIsResolveModalOpen(false)}
            >
              Bekor qilish
            </button>
            <button type="submit" className="btn btn-success btn-sm">
              Yakunlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
