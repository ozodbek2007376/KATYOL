import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Button } from '@/components/common/Button/Button';
import { formatCurrency, getActiveCurrency } from '@/utils/currency.utils';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { customersApi } from '@/features/customers/api/customersApi';
import { LuPrinter, LuShieldCheck, LuCalendar, LuAward, LuFileText, LuUser, LuPackage, LuCircleCheck, LuClock } from 'react-icons/lu';

export const InsurancePolicyModal = ({
  isOpen,
  onClose,
  data = null, // Can be sale object, order object, or customer record
}) => {
  const printRef = useRef(null);

  const formatAddress = (addressField) => {
    if (!addressField) return '—';
    try {
      const parsed = JSON.parse(addressField);
      if (parsed && typeof parsed === 'object') {
        const parts = [
          parsed.region,
          parsed.district,
          parsed.address
        ].filter(Boolean);
        return parts.join(', ') || '—';
      }
    } catch (e) {
      // Fallback
    }
    return addressField;
  };
  const [warrantyTypes, setWarrantyTypes] = useState([]);
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [company, setCompany] = useState({
    name: 'Kotyol Manufacturing',
    phone: '+998 (90) 123-45-67',
    website: 'https://kotyol.uz',
    address: 'Toshkent sh., Chilonzor tumani, 5-daha',
    description: 'Yuqori sifatli isitish kotyollari ishlab chiqarish zavodi.',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('—');
  const [customerAddress, setCustomerAddress] = useState('—');

  useEffect(() => {
    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && data) {
      const custId = data.customerId || data.customer_id || (data.customer && data.customer.id) || (data.customerName ? null : data.id);
      if (custId) {
        customersApi.getCustomerById(custId).then((res) => {
          if (res.success && res.data) {
            setCustomerPhone(res.data.phone || '—');
            setCustomerAddress(res.data.address || '—');
          } else {
            setCustomerPhone(data.phone || '—');
            setCustomerAddress(data.address || '—');
          }
        }).catch(() => {
          setCustomerPhone(data.phone || '—');
          setCustomerAddress(data.address || '—');
        });
      } else {
        setCustomerPhone(data.phone || '—');
        setCustomerAddress(data.address || '—');
      }
    }
  }, [isOpen, data]);

  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      const [wRes, iRes, cRes] = await Promise.all([
        settingsApi.getWarrantyTypes().catch(() => ({ success: false, data: [] })),
        settingsApi.getInsuranceTypes().catch(() => ({ success: false, data: [] })),
        settingsApi.getCompany().catch(() => ({ success: false, data: null })),
      ]);
      if (wRes.success && Array.isArray(wRes.data)) setWarrantyTypes(wRes.data);
      if (iRes.success && Array.isArray(iRes.data)) setInsuranceTypes(iRes.data);
      if (cRes.success && cRes.data) setCompany(cRes.data);
    } catch (_err) {
      // API fallback empty array handled cleanly
    } finally {
      setIsLoading(false);
    }
  };

  if (!data) return null;

  const currency = getActiveCurrency();
  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamic entity mapping
  const customerName = data.customerName || data.customer_name || data.name || 'Mijoz';
  const phone = data.phone || data.customerPhone || 'Kiritilmagan';
  const region = data.region || 'Toshkent';
  const address = data.address || '';
  const boilerModelName = data.boilerModelName || data.boiler_model_name || data.boilerName || 'Sanoat Isitish Kotyoli (Standart)';
  const totalAmount = parseFloat(data.totalAmount || data.total_amount || data.price || 15000000);
  
  // Date calculations
  const issueDate = data.orderDate || data.saleDate || data.createdDate || todayStr;
  
  // Dynamic Warranty Duration (Months) & Insurance Coverage
  let durationMonths = 24; // Default 2 years if unassigned
  if (data.warrantyDurationMonths) {
    durationMonths = parseInt(data.warrantyDurationMonths);
  } else if (warrantyTypes.length > 0) {
    const matched = warrantyTypes.find((w) => w.id === data.warrantyTypeId || w.status === 'ACTIVE');
    if (matched && matched.durationMonths) {
      durationMonths = parseInt(matched.durationMonths);
    }
  }

  // Calculate dynamic free service end date: issueDate + durationMonths
  const computeFreeServiceEndDate = (startIso, months) => {
    try {
      const d = new Date(startIso);
      if (isNaN(d.getTime())) return todayStr;
      d.setMonth(d.getMonth() + months);
      return d.toISOString().split('T')[0];
    } catch (_e) {
      return todayStr;
    }
  };

  const freeServiceUntilDate = computeFreeServiceEndDate(issueDate, durationMonths);

  // Dynamic status of warranty
  const isCurrentlyFree = freeServiceUntilDate >= todayStr;

  // Dynamic Insurance Type & Coverage
  const activeInsuranceObj = insuranceTypes.find((i) => i.status === 'ACTIVE') || insuranceTypes[0] || {};
  const insuranceName = activeInsuranceObj.name || 'To\'liq Kafolatlangan Texnik Sug\'urta Polisi';
  const coverageAmount = activeInsuranceObj.coverageAmount || Math.round(totalAmount * 1.5);

  const policyNumber = data.policyNumber || `POL-2026-${(data.id || Date.now().toString()).slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2">
          <LuAward className="text-primary fs-5" />
          <span>Rasmiy Sug'urta Polisi va Bepul Servis Guvohnomasi</span>
        </div>
      }
      size="xl"
      footer={
        <div className="d-flex justify-content-between align-items-center w-100">
          <span className="text-muted fs-8">Polis №: {policyNumber} | Berilgan sana: {issueDate}</span>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={onClose}>
              Yopish
            </Button>
            <Button variant="primary" size="sm" icon={<LuPrinter />} onClick={handlePrint}>
              Sug'urta Qog'ozini Chop Etish
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Policy Certificate Layout */}
      <div ref={printRef} className="insurance-policy-container p-4 bg-white text-dark rounded border shadow-sm position-relative">
        <style>{`
          @media print {
            /* Force vector text rendering and disable browser print rasterization */
            *, *::before, *::after {
              transition: none !important;
              transform: none !important;
              animation: none !important;
              filter: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
              -webkit-filter: none !important;
              perspective: none !important;
              backface-visibility: visible !important;
            }
            
            /* Hide all siblings of modal at body level */
            body > :not(.modal) {
              display: none !important;
            }
            
            .modal-backdrop,
            .modal-header,
            .modal-footer {
              display: none !important;
            }

            body {
              background: #fff !important;
              color: #000 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              height: auto !important;
            }

            .modal {
              position: relative !important;
              display: block !important;
              overflow: visible !important;
              height: auto !important;
              left: auto !important;
              top: auto !important;
              opacity: 1 !important;
              background: none !important;
              padding: 0 !important;
            }

            .modal-dialog {
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
            }

            .modal-content {
              border: none !important;
              box-shadow: none !important;
              background: none !important;
              height: auto !important;
              overflow: visible !important;
            }

            .modal-body {
              padding: 0 !important;
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
            }

            .insurance-policy-container, .insurance-policy-container * {
              visibility: visible !important;
              color: #000 !important;
            }

            .insurance-policy-container {
              position: relative !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 20px !important;
              box-sizing: border-box !important;
              background: #fff !important;
              border: 2px solid #0d6efd !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Certificate Decorative Border */}
        <div className="p-3 border border-3 border-primary rounded-3 position-relative" style={{ backgroundColor: '#fafafa' }}>
          
          {/* Top Header */}
          <div className="d-flex justify-content-between align-items-center border-bottom border-2 border-primary pb-3 mb-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fs-3 fw-bold text-primary tracking-wide text-uppercase">{company.name}</span>
                <span className="badge bg-success text-white fs-8 px-2 py-1">KAFOLAT KARTA</span>
              </div>
              <p className="small text-secondary mb-0 fw-semibold">{company.description || 'Sanoat isitish uskunalarini ishlab chiqarish va texnik sug\'urtalash majmuasi'}</p>
              <p className="small text-muted mb-0">Rasmiy Servis Markazi | Tel: {company.phone} | Vebsayt: {company.website || '—'}</p>
            </div>

            <div className="text-end">
              <div className="p-2 bg-primary bg-opacity-10 border border-primary rounded text-center" style={{ minWidth: '180px' }}>
                <div className="small text-primary fw-bold">SUG'URTA POLISI №</div>
                <div className="fw-bold fs-5 text-dark font-monospace">{policyNumber}</div>
              </div>
            </div>
          </div>

          {/* Certificate Title Banner */}
          <div className="text-center bg-primary text-white py-2 rounded-2 mb-4 shadow-sm">
            <h5 className="mb-0 fw-bold text-uppercase tracking-wider">
              RASMIY SUG'URTA POLISI VA BEPUL SERVIS GUVOHNOMASI
            </h5>
            <small className="opacity-90">Ushbu hujjat mijozga sotilgan kotyolning bepul servis muddati va texnik sug'urtasini tasdiqlaydi</small>
          </div>

          {/* Main Grid: Customer & Boiler Specifications */}
          <div className="row g-3 mb-4">
            {/* Customer Box */}
            <div className="col-12 col-md-6">
              <div className="p-3 bg-white border rounded-3 h-100 shadow-sm">
                <h6 className="fw-bold text-primary border-bottom pb-2 mb-2 d-flex align-items-center gap-1">
                  <LuUser className="fs-5" />
                  <span>Mijoz (Sug'urtalanuvchi):</span>
                </h6>
                <div className="row g-2 small">
                  <div className="col-5 text-muted">F.I.SH / Korxona:</div>
                  <div className="col-7 fw-bold text-dark">{customerName}</div>

                  <div className="col-5 text-muted">Telefon Raqam:</div>
                  <div className="col-7 fw-bold text-dark">{customerPhone}</div>

                  <div className="col-5 text-muted">Manzil / Hudud:</div>
                  <div className="col-7 text-dark">{data.region || 'Toshkent'}, {formatAddress(customerAddress)}</div>
                </div>
              </div>
            </div>

            {/* Boiler Box */}
            <div className="col-12 col-md-6">
              <div className="p-3 bg-white border rounded-3 h-100 shadow-sm">
                <h6 className="fw-bold text-primary border-bottom pb-2 mb-2 d-flex align-items-center gap-1">
                  <LuPackage className="fs-5" />
                  <span>Sotilgan Kotyol Ma'lumotlari:</span>
                </h6>
                <div className="row g-2 small">
                  <div className="col-5 text-muted">Kotyol Modeli:</div>
                  <div className="col-7 fw-bold text-primary">{boilerModelName}</div>

                  <div className="col-5 text-muted">Shartnoma Narxi:</div>
                  <div className="col-7 fw-bold text-dark">{formatCurrency(totalAmount)}</div>

                  <div className="col-5 text-muted">Sotuv / Xarid Sanasi:</div>
                  <div className="col-7 text-dark fw-semibold">{issueDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Banner: FREE SERVICE UNTIL DATE ("Servis qachongacha bepul") */}
          <div className="p-3 bg-success bg-opacity-10 border border-2 border-success rounded-3 mb-4 text-dark shadow-sm">
            <div className="row align-items-center">
              <div className="col-12 col-md-7">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <LuClock className="text-success fs-4" />
                  <span className="fw-bold fs-6 text-success">BEPUL TEXNIK SERVIS MUDDATI:</span>
                </div>
                <div className="fs-7 text-secondary">
                  Ishlab chiqaruvchi tomonidan berilgan to'liq bepul kafolat muddati: <strong>{durationMonths} oy</strong>.
                </div>
              </div>

              <div className="col-12 col-md-5 text-md-end mt-2 mt-md-0">
                <div className="d-inline-block bg-white p-2 px-3 border border-success rounded text-center">
                  <span className="small text-muted d-block fw-semibold">SERVIS QACHONGACHA BEPUL:</span>
                  <span className="fs-4 fw-bold text-success font-monospace">{freeServiceUntilDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-top border-success border-opacity-25 fs-8 text-success d-flex align-items-center gap-1">
              <LuCircleCheck />
              <span>
                <strong>Kafolat Holati:</strong> {isCurrentlyFree ? `BEPUL KAFOLATLI SERVIS FAOL (${freeServiceUntilDate} gacha 100% BEPUL)` : `Kafolat muddati tugagan`}
              </span>
            </div>
          </div>

          {/* Insurance Policy Coverage Box */}
          <div className="p-3 bg-light border rounded-3 mb-4">
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1">
              <LuShieldCheck className="text-primary fs-5" />
              <span>Sug'urta Shartlari va Maksimal Qoplama Summasi:</span>
            </h6>
            <div className="row g-3 small">
              <div className="col-12 col-md-6">
                <div className="p-2 bg-white rounded border">
                  <span className="text-muted d-block">Sug'urta Dasturi:</span>
                  <strong className="text-primary">{insuranceName}</strong>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="p-2 bg-white rounded border">
                  <span className="text-muted d-block">Maksimal Sug'urta Qoplamasi Summasi:</span>
                  <strong className="text-success fs-6">{formatCurrency(coverageAmount)}</strong>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 bg-white rounded border fs-8 text-secondary">
                  <strong className="text-dark d-block mb-1">Sug'urta va Bepul Servis Qoidalari:</strong>
                  <ol className="mb-0 ps-3">
                    <li className="mb-1">Kafolat muddati ({freeServiceUntilDate} gacha) davomida uskunadagi har qanday zavod defekti yoki nosozliklar bo'yicha barcha ehtiyot qismlar va ustalar mehnati <strong>100% BEPUL</strong> almashtiriladi.</li>
                    <li className="mb-1">Servis chaqiruvi tushgandan so'ng, servis brigadasi 24 soat ichida ob'ektga yetib borishi kafolatlanadi.</li>
                    <li className="mb-0">Sug'urta bosim oshishi, elektr kuchlanishi tebranishi yoki fors-major avariyalarda mijozga ko'rilgan zararni tiklashni o'z ichiga oladi.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Signatures, Barcode & Official Stamp */}
          <div className="pt-3 border-top border-2 border-secondary mt-4">
            <div className="row align-items-center text-center">
              <div className="col-4">
                <div className="small text-muted mb-4">{company.name} Servis Boshlig'i</div>
                <div className="border-bottom mx-auto w-75"></div>
                <div className="fs-8 text-muted mt-1">(Imzo va Mas'ul Shaxs)</div>
              </div>

              <div className="col-4">
                <div className="d-inline-block p-2 border rounded bg-white mb-1 shadow-sm">
                  <svg width="130" height="38" viewBox="0 0 130 38" fill="none">
                    <rect x="5" y="4" width="3" height="30" fill="#000" />
                    <rect x="10" y="4" width="5" height="30" fill="#000" />
                    <rect x="17" y="4" width="2" height="30" fill="#000" />
                    <rect x="21" y="4" width="4" height="30" fill="#000" />
                    <rect x="27" y="4" width="2" height="30" fill="#000" />
                    <rect x="31" y="4" width="6" height="30" fill="#000" />
                    <rect x="39" y="4" width="2" height="30" fill="#000" />
                    <rect x="43" y="4" width="4" height="30" fill="#000" />
                    <rect x="49" y="4" width="2" height="30" fill="#000" />
                    <rect x="53" y="4" width="5" height="30" fill="#000" />
                    <rect x="60" y="4" width="2" height="30" fill="#000" />
                    <rect x="64" y="4" width="2" height="30" fill="#000" />
                    <rect x="68" y="4" width="4" height="30" fill="#000" />
                    <rect x="74" y="4" width="5" height="30" fill="#000" />
                    <rect x="81" y="4" width="2" height="30" fill="#000" />
                    <rect x="85" y="4" width="2" height="30" fill="#000" />
                    <rect x="89" y="4" width="4" height="30" fill="#000" />
                    <rect x="95" y="4" width="3" height="30" fill="#000" />
                    <rect x="100" y="4" width="6" height="30" fill="#000" />
                    <rect x="108" y="4" width="2" height="30" fill="#000" />
                    <rect x="112" y="4" width="4" height="30" fill="#000" />
                    <rect x="118" y="4" width="3" height="30" fill="#000" />
                  </svg>
                </div>
                <div className="fs-9 text-muted font-monospace">{policyNumber}</div>
              </div>

              <div className="col-4">
                <div className="small text-muted mb-4">Sug'urtalanuvchi Mijoz</div>
                <div className="border-bottom mx-auto w-75"></div>
                <div className="fs-8 text-muted mt-1">(Tanishdim va Qabul Qildim)</div>
              </div>
            </div>

            <div className="text-center mt-3 fs-9 text-muted">
              Ushbu sug'urta polisi elektron tarzda Kotyol Manufacturing bazasida ro'yxatdan o'tkazilgan. Polis nusxasi va kafolat sertifikati haqiqiy hisoblanadi.
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
};
