import { formatCurrency, getActiveCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuUsers, LuPhone, LuMail, LuMapPin, LuPlus, LuShoppingBag, LuShoppingCart, LuWrench, LuFileText, LuPrinter, LuCalendar, LuDollarSign, LuShieldCheck, LuTriangleAlert, LuAward } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { CustomersSubNav } from '../components/CustomersSubNav';
import { CustomerReceiptModal } from '@/components/common/CustomerReceiptModal/CustomerReceiptModal';
import { InsurancePolicyModal } from '@/components/common/InsurancePolicyModal/InsurancePolicyModal';
import { customersApi } from '../api/customersApi';
import { salesApi } from '@/features/sales/api/salesApi';
import { servicesApi } from '@/features/services/api/servicesApi';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [servicesHistory, setServicesHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  useEffect(() => {
    loadCustomerDetails();
  }, [id]);

  const loadCustomerDetails = async () => {
    setIsLoading(true);
    const [custRes, salesRes, srvRes] = await Promise.all([
      customersApi.getCustomerById(id),
      salesApi.getSales().catch(() => ({ success: false, data: [] })),
      servicesApi.getServices().catch(() => ({ success: false, data: [] })),
    ]);
    
    if (custRes.success) setCustomer(custRes.data);
    
    if (salesRes.success) {
      const filteredSales = (salesRes.data || []).filter((s) => String(s.customerId) === String(id));
      setSales(filteredSales);
    }
    
    if (srvRes.success) {
      const filteredServices = (srvRes.data || []).filter((s) => String(s.customerId) === String(id));
      setServices(filteredServices);
    }
    setIsLoading(false);
  };

  const handleQuickAction = (actionName) => {
    notifySuccess(`'${actionName}' funksiyasi muvaffaqiyatli bajarildi.`);
  };

  if (isLoading || !customer) {
    return (
      <div className="customer-detail-page animate-fade-in pb-5">
        <CustomersSubNav />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const totalAmount = parseFloat(customer.totalAmount) || 18000000;
  const depositAmount = parseFloat(customer.depositAmount) || 5000000;
  const orderDate = customer.orderDate || customer.createdDate || todayStr;
  const deliveryDate = customer.deliveryDate || '';
  const autoDiscountOnLate = customer.autoDiscountOnLate !== false;
  const lateDiscountRate = parseFloat(customer.lateDiscountRate) || 0.5;

  let daysLate = 0;
  let daysRemaining = 0;
  let isOverdue = false;
  if (deliveryDate) {
    const tDate = new Date(todayStr);
    const dDate = new Date(deliveryDate);
    const diffDays = Math.round((dDate - tDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      isOverdue = true;
      daysLate = Math.abs(diffDays);
    } else {
      daysRemaining = diffDays;
    }
  }

  const discountPercent = (autoDiscountOnLate && isOverdue) ? Math.min(50, daysLate * lateDiscountRate) : 0;
  const lateDiscountAmount = Math.round((totalAmount * discountPercent) / 100);
  const finalPrice = Math.max(0, totalAmount - lateDiscountAmount);
  const remainingAmount = Math.max(0, finalPrice - depositAmount);

  const salesColumns = [
    {
      header: 'Hujjat №',
      cell: (row) => (
        <Link to={`${ROUTES.PROTECTED.SALES}/${row.id}`} className="fw-bold text-primary text-decoration-none">
          {row.invoiceNumber}
        </Link>
      ),
    },
    { header: 'Kotyol Modeli', accessor: 'boilerModelName' },
    { header: 'Miqdor', cell: (row) => `${row.quantity} dona` },
    { header: 'Jami Summa', cell: (row) => formatCurrency(row.totalAmount) },
    { header: 'Sana', accessor: 'saleDate' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.paymentStatus} /> },
  ];

  const serviceColumns = [
    {
      header: 'Servis №',
      cell: (row) => (
        <Link to={`${ROUTES.PROTECTED.SERVICES}/${row.id}`} className="fw-bold text-primary text-decoration-none">
          {row.serviceNumber}
        </Link>
      ),
    },
    { header: 'Kotyol Modeli', accessor: 'boilerModelName' },
    { header: 'Xizmat Turi', accessor: 'serviceTypeName' },
    { header: 'Usta', accessor: 'assignedEmployeeName' },
    { header: 'Sana', accessor: 'serviceDate' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="customer-detail-page animate-fade-in pb-5">
      <CustomersSubNav />

      <PageHeader
        title={`Mijoz: ${customer.customerName}`}
        subtitle={`ID: ${customer.id} | Barcha zakladlar, zakaz muddatlari va hisob-kitoblar`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Mijozlar', path: ROUTES.PROTECTED.CUSTOMERS },
          { label: customer.customerName },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2">
            <Link to={ROUTES.PROTECTED.CUSTOMERS} className="btn btn-outline-secondary btn-sm">
              <LuChevronLeft className="me-1" /> Katalogga Qaytish
            </Link>

            <Button variant="primary" size="sm" icon={<LuPrinter />} onClick={() => setIsReceiptOpen(true)}>
              Chek Chop Etish
            </Button>

            <Button variant="outline-success" size="sm" icon={<LuAward />} onClick={() => setIsInsuranceModalOpen(true)}>
              Sug'urta Polisi
            </Button>
          </div>
        }
      />

      <div className="row g-3">
        {/* Left Column: Customer Profile Card */}
        <div className="col-12 col-lg-4">
          <Card className="p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-info text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                <LuUsers />
              </div>
              <div>
                <h6 className="fw-bold text-main mb-0 font-heading">{customer.customerName}</h6>
                <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">{customer.customerTypeName}</span>
              </div>
            </div>

            <div className="mb-3">
              <span className={`badge ${customer.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} fs-8`}>
                {customer.status === 'ACTIVE' ? 'Faol Hamkor' : 'Nofaol'}
              </span>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                <LuPhone className="text-primary" />
                <span>Asosiy Tel: <strong>{customer.phone}</strong></span>
              </div>
              {customer.altPhone && (
                <div className="d-flex align-items-center gap-2">
                  <LuPhone className="text-muted-custom" />
                  <span>Qo'shimcha: <strong>{customer.altPhone}</strong></span>
                </div>
              )}
              {customer.email && (
                <div className="d-flex align-items-center gap-2">
                  <LuMail className="text-info" />
                  <span>Email: <strong>{customer.email}</strong></span>
                </div>
              )}
              <div className="d-flex align-items-center gap-2">
                <LuMapPin className="text-danger" />
                <span>Manzil: <strong>{customer.region}, {customer.district || ''} {customer.address || ''}</strong></span>
              </div>
            </div>
          </Card>

          {/* Quick Receipt Action Card */}
          <Card className="p-3 bg-primary bg-opacity-10 border-primary">
            <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
              <LuPrinter />
              <span>Buyurtma va Zaklad Cheki</span>
            </h6>
            <p className="small text-muted mb-3">
              Mijozga to'langan zaklad, zakaz sanasi, yetkazib berish muddati va kechikish chegirmalari ko'rsatilgan rasmiy chekni chop etib bering.
            </p>
            <Button variant="primary" className="w-100" icon={<LuPrinter />} onClick={() => setIsReceiptOpen(true)}>
              Chekni Chiqarish va Chop Etish
            </Button>
          </Card>
        </div>

        {/* Right Column: Order, Deposit & Contract Details */}
        <div className="col-12 col-lg-8">
          {/* Order & Deposit Financial Overview */}
          <Card className="mb-3" title="Buyurtma, Zaklad va Yetkazish Muddatlari">
            <div className="row g-3 fs-7">
              <div className="col-12 col-md-6">
                <div className="p-3 rounded bg-body-custom border-custom">
                  <span className="text-muted-custom fs-8 d-block mb-1">Buyurtma Qilingan Kotyol Modeli</span>
                  <strong className="text-main fs-6">{customer.boilerModelName || 'Kotyol K-50kW'}</strong>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded bg-body-custom border-custom">
                  <span className="text-muted-custom fs-8 d-block mb-1">Kotyol Shartnoma Summasi</span>
                  <strong className="text-primary fs-6">{formatCurrency(totalAmount)}</strong>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded bg-success bg-opacity-10 border-success border">
                  <span className="text-success fs-8 d-block mb-1 fw-bold">Zaklad Miqdori (Avans To'langan):</span>
                  <strong className="text-success fs-5">{formatCurrency(depositAmount)}</strong>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded bg-warning bg-opacity-25 border-warning border">
                  <span className="text-dark fs-8 d-block mb-1 fw-bold">Qolgan To'lanadigan Summa:</span>
                  <strong className="text-danger fs-5">{formatCurrency(remainingAmount)}</strong>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded bg-body-custom border-custom">
                  <span className="text-muted-custom fs-8 d-block mb-1">Zakaz Berilgan Sana</span>
                  <strong className="text-main">{orderDate}</strong>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded bg-body-custom border-custom">
                  <span className="text-muted-custom fs-8 d-block mb-1">Yetib Borishi Kerak Bo'lgan Sana (Reja)</span>
                  <strong className={isOverdue ? "text-danger" : "text-primary"}>
                    {deliveryDate || 'Belgilanmagan'}
                  </strong>
                </div>
              </div>

              {/* Late Delivery Status & Discount Calculation */}
              <div className="col-12">
                <div className="p-3 rounded border bg-body-custom">
                  <h6 className="fw-bold fs-7 mb-2 d-flex align-items-center gap-2">
                    <LuCalendar className="text-primary" />
                    <span>Sanadan O'tgandagi Avtomatik Arzonlashuv Holati:</span>
                  </h6>

                  {autoDiscountOnLate ? (
                    <div>
                      <div className="text-success fs-8 d-flex align-items-center gap-1 mb-2">
                        <LuShieldCheck />
                        <span><strong>Avtomatik chegirma faol:</strong> Rejadagi sanadan kechikilsa, kuniga {lateDiscountRate}% kotyol narxidan arzonlashtiriladi.</span>
                      </div>

                      {isOverdue ? (
                        <div className="alert alert-warning mb-0 fs-8 d-flex align-items-center gap-2">
                          <LuTriangleAlert className="fs-5 text-warning" />
                          <div>
                            <strong>Kechikish mavjud:</strong> BelGilangan sanadan <strong>{daysLate} kun</strong> o'tdi.
                            <div>Narx <strong>{discountPercent}%</strong> ga arzonlashdi (-{formatCurrency(lateDiscountAmount)}).</div>
                            <div>Yangi Kotyol Narxi: <strong className="text-success">{formatCurrency(finalPrice)}</strong></div>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-info mb-0 fs-8 d-flex align-items-center gap-2">
                          <span><strong>Yetkazib berish vaqti:</strong> Rejadagi sanagacha dinamik <strong>{daysRemaining} kun</strong> qoldi.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted fs-8">
                      Kechikganda avtomatik arzonlashuv opsiyasi o'chirilgan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs border-custom mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active fw-bold' : 'text-muted-custom'}`}
                onClick={() => setActiveTab('overview')}
              >
                <LuShoppingBag className="me-1" /> Sotuvlar Tarixi ({sales.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'services' ? 'active fw-bold' : 'text-muted-custom'}`}
                onClick={() => setActiveTab('services')}
              >
                <LuWrench className="me-1" /> Servis Xizmatlari ({services.length})
              </button>
            </li>
          </ul>

          {/* Tab Contents */}
          {activeTab === 'overview' && (
            <Card title="Mijoz Sotuvlari Xaridi">
              <Table columns={salesColumns} data={sales} tableKey="customer_sales_history" />
            </Card>
          )}

          {activeTab === 'services' && (
            <Card title="Servis va Kafolat Xizmatlari Tarixi">
              <Table columns={serviceColumns} data={services} tableKey="customer_services_history" />
            </Card>
          )}
        </div>
      </div>

      {/* Customer Printable Receipt Modal */}
      <CustomerReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        customerData={customer}
      />

      <InsurancePolicyModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        data={customer}
      />
    </div>
  );
};
