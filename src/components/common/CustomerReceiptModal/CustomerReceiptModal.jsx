import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Button } from '@/components/common/Button/Button';
import { formatCurrency, getActiveCurrency } from '@/utils/currency.utils';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { customersApi } from '@/features/customers/api/customersApi';
import { LuPrinter, LuCircleCheck, LuTriangleAlert, LuCalendar, LuDollarSign, LuShieldCheck, LuClock } from 'react-icons/lu';

export const CustomerReceiptModal = ({
  isOpen,
  onClose,
  customerData = null,
}) => {
  const printRef = useRef(null);
  const [company, setCompany] = useState({
    name: 'Kotyol Manufacturing',
    phone: '+998 (90) 123-45-67',
    website: 'https://kotyol.uz',
    address: 'Toshkent sh., Chilonzor tumani, 5-daha',
    description: 'Yuqori sifatli isitish kotyollari ishlab chiqarish zavodi.',
  });

  const [customerPhone, setCustomerPhone] = useState('—');
  const [customerAddress, setCustomerAddress] = useState('—');

  useEffect(() => {
    if (isOpen) {
      // Load company profile
      settingsApi.getCompany().then((res) => {
        if (res.success && res.data) setCompany(res.data);
      }).catch(() => {});

      // Load customer details dynamically if customerId is present
      if (customerData) {
        const custId = customerData.id || customerData.customerId;
        if (custId) {
          customersApi.getCustomerById(custId).then((res) => {
            if (res.success && res.data) {
              setCustomerPhone(res.data.phone || '—');
              setCustomerAddress(res.data.address || '—');
            } else {
              setCustomerPhone(customerData.phone || '—');
              setCustomerAddress(customerData.address || '—');
            }
          }).catch(() => {
            setCustomerPhone(customerData.phone || '—');
            setCustomerAddress(customerData.address || '—');
          });
        } else {
          setCustomerPhone(customerData.phone || '—');
          setCustomerAddress(customerData.address || '—');
        }
      }
    }
  }, [isOpen, customerData]);

  if (!customerData) return null;

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

  const currency = getActiveCurrency();
  const todayStr = new Date().toISOString().split('T')[0];

  const orderDate = customerData.orderDate || todayStr;
  const deliveryDate = customerData.deliveryDate || '';
  const boilerModelName = customerData.boilerModelName || 'Isitish Kotyoli (Standart)';
  const totalAmount = parseFloat(customerData.totalAmount) || 0;
  const depositAmount = parseFloat(customerData.depositAmount) || 0;
  const autoDiscountOnLate = customerData.autoDiscountOnLate !== false;
  const lateDiscountRate = parseFloat(customerData.lateDiscountRate) || 0.5;

  // Dynamic calculation for days and decreasing price
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

  // Dynamic daily reduction: lateDiscountRate % for each overdue day
  const discountPercent = (autoDiscountOnLate && isOverdue) ? Math.min(50, daysLate * lateDiscountRate) : 0;
  const lateDiscountAmount = Math.round((totalAmount * discountPercent) / 100);
  const finalPrice = Math.max(0, totalAmount - lateDiscountAmount);
  const remainingAmount = Math.max(0, finalPrice - depositAmount);

  const receiptNumber = customerData.receiptNumber || `CHK-${Date.now().toString().slice(-6)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2">
          <LuPrinter className="text-primary fs-5" />
          <span>Mijoz uchun Buyurtma va Zaklad Cheki</span>
        </div>
      }
      size="lg"
      footer={
        <div className="d-flex justify-content-between align-items-center w-100">
          <span className="text-muted fs-8">Sana: {todayStr} | № {receiptNumber}</span>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={onClose}>
              Yopish
            </Button>
            <Button variant="primary" size="sm" icon={<LuPrinter />} onClick={handlePrint}>
              Chekni Chop Etish
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Area */}
      <div ref={printRef} className="customer-receipt-container p-4 bg-white text-dark rounded border shadow-sm position-relative">
        <style>{`
          /* CSS for Screen preview inside modal */
          .customer-receipt-container {
            max-width: 650px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }

          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            
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
              width: 80mm !important;
            }

            .modal {
              position: relative !important;
              display: block !important;
              overflow: visible !important;
              width: 80mm !important;
              height: auto !important;
              left: auto !important;
              top: auto !important;
              opacity: 1 !important;
              background: none !important;
              padding: 0 !important;
            }

            .modal-dialog {
              max-width: 80mm !important;
              width: 80mm !important;
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

            .customer-receipt-container, .customer-receipt-container * {
              visibility: visible !important;
              color: #000 !important;
            }

            .customer-receipt-container {
              position: relative !important;
              width: 80mm !important;
              max-width: 80mm !important;
              height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 4mm 2mm !important;
              box-sizing: border-box !important;
              background: #fff !important;
              font-family: 'Courier New', Courier, monospace !important;
              font-size: 10px !important;
              line-height: 1.4 !important;
              border: none !important;
              box-shadow: none !important;
              page-break-inside: auto !important;
            }

            /* Transform visual elements into standard receipt layout */
            .no-print {
              display: none !important;
            }
            .border-bottom {
              border-bottom: 1px dashed #000 !important;
            }
            .border-top {
              border-top: 1px dashed #000 !important;
            }

            /* Linearize layouts to stack vertically */
            .row {
              display: block !important;
              margin: 0 !important;
            }
            .col-12, .col-md-6, .col-6, .col-4 {
              width: 100% !important;
              display: block !important;
              padding: 0 !important;
              margin-bottom: 2mm !important;
              border: none !important;
            }

            /* Custom styles for tables */
            .table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-bottom: 3mm !important;
            }
            .table th, .table td {
              padding: 1mm 0.5mm !important;
              border: none !important;
              border-bottom: 1px dashed #000 !important;
              font-size: 9px !important;
            }
            .table-responsive {
              overflow: visible !important;
            }
            .table-secondary {
              background: none !important;
              color: #000 !important;
              border-bottom: 1px dashed #000 !important;
            }

            /* Hide large graphical representations */
            svg, .badge {
              display: none !important;
            }

            /* Font size tuning for print */
            .fs-4 { font-size: 13px !important; }
            .fs-5 { font-size: 11px !important; }
            .fs-6 { font-size: 10px !important; }
            .fs-7 { font-size: 9px !important; }
            .fs-8 { font-size: 8px !important; }
            .fs-9 { font-size: 8px !important; }

            .bg-light {
              background: none !important;
              border: none !important;
              border-top: 1px dashed #000 !important;
              border-bottom: 1px dashed #000 !important;
              border-radius: 0 !important;
              padding: 2mm 0 !important;
            }

            .text-primary, .text-success, .text-danger, .text-dark {
              color: #000 !important;
            }

            /* Alignment tweaks for print */
            .text-end {
              text-align: right !important;
            }
            .text-center {
              text-align: center !important;
            }
          }
        `}</style>

        {/* Receipt Header */}
        <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fs-4 fw-bold text-primary text-uppercase">{company.name}</span>
              <span className="badge bg-primary text-white fs-9">RASMIY CHEK</span>
            </div>
            <p className="small text-secondary mb-0">{company.description || 'Isitish kotyollari va sanoat uskunalarini ishlab chiqarish majmuasi'}</p>
            <p className="small text-secondary mb-0">Manzil: {company.address} | Tel: {company.phone}</p>
          </div>
          <div className="text-end">
            <div className="fw-bold fs-5 text-dark">CHEK № {receiptNumber}</div>
            <div className="small text-muted">Zakaz Berilgan: <strong>{orderDate}</strong></div>
            {deliveryDate && (
              <div className="small text-muted">Reja Yetkazish: <strong className="text-primary">{deliveryDate}</strong></div>
            )}
          </div>
        </div>

        {/* Customer Information Block */}
        <div className="bg-light p-3 rounded mb-3 border">
          <h6 className="fw-bold text-dark mb-2 border-bottom pb-1">Mijoz Ma'lumotlari:</h6>
          <div className="row g-2 small">
            <div className="col-6">
              <span className="text-muted">F.I.SH / Korxona:</span> <strong className="text-dark">{customerData.customerName || customerData.name || 'Mijoz'}</strong>
            </div>
            <div className="col-6">
              <span className="text-muted">Telefon:</span> <strong className="text-dark">{customerPhone}</strong>
            </div>
            <div className="col-6">
              <span className="text-muted">Hudud / Manzil:</span> <span>{customerData.region || 'Toshkent'}, {formatAddress(customerAddress)}</span>
            </div>
            <div className="col-6">
              <span className="text-muted">Mijoz Turi:</span> <span>{customerData.customerTypeName || 'Jismoniy Shaxs'}</span>
            </div>
          </div>
        </div>

        {/* Product / Boiler Details Table */}
        <div className="table-responsive mb-3">
          <table className="table table-bordered align-middle small mb-0">
            <thead className="table-secondary">
              <tr>
                <th>Mahsulot / Kotyol Modeli</th>
                <th className="text-center">Miqdor</th>
                <th className="text-end">Birlik Narxi</th>
                <th className="text-end">Jami Summa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="fw-bold text-dark">{boilerModelName}</div>
                  <div className="text-muted fs-8">Kafolatli va sertifikatlangan isitish uskunasi</div>
                </td>
                <td className="text-center fw-bold">1 dona</td>
                <td className="text-end">{formatCurrency(totalAmount)}</td>
                <td className="text-end fw-bold">{formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deadlines, Dynamic Days & Automatic Price Reduction */}
        <div className="bg-light p-3 rounded mb-3 border">
          <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1">
            <LuCalendar className="text-primary" />
            <span>Muddati va Dinamik Arzonlashuv Shartlari:</span>
          </h6>
          <div className="row g-2 small">
            <div className="col-6">
              <span className="text-muted">Zakaz Berilgan Sana:</span> <strong className="text-dark">{orderDate}</strong>
            </div>
            <div className="col-6">
              <span className="text-muted">Yetkazib Berish Sanasi:</span> <strong className="text-primary">{deliveryDate || 'Belgilanmagan'}</strong>
            </div>

            {/* Dynamic Days Counter & Reduction Info */}
            <div className="col-12 mt-2">
              <div className="p-2 rounded border bg-white fs-8">
                {autoDiscountOnLate ? (
                  <div className="text-success d-flex align-items-center gap-1">
                    <LuShieldCheck />
                    <span>
                      <strong>Dinamik arzonlashuv faol:</strong> Rejadagi sanadan kechikilgan har bir kun uchun kotyol narxi kuniga <strong>{lateDiscountRate}%</strong> kamayib boradi.
                    </span>
                  </div>
                ) : (
                  <div className="text-muted">
                    Kechikganda avtomatik arzonlashuv belgilanmagan (Standart shartnoma sharti).
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Overdue vs Remaining Counter Alert */}
            {deliveryDate && (
              <div className="col-12">
                {isOverdue ? (
                  <div className="alert alert-warning py-2 px-3 mb-0 fs-8 d-flex align-items-center gap-2">
                    <LuTriangleAlert className="text-warning fs-5" />
                    <div>
                      <div><strong>Dinamik Kechikish Aniqlandi:</strong> Rejadagi sanadan <strong>{daysLate} kun</strong> o'tdi.</div>
                      <div>Dinamik chegirma: <strong>{discountPercent}%</strong> (-{formatCurrency(lateDiscountAmount)}) kamaydi.</div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info py-2 px-3 mb-0 fs-8 d-flex align-items-center gap-2">
                    <LuClock className="text-info fs-5" />
                    <div>
                      <strong>Yetkazib berish vaqti:</strong> Rejadagi sanagacha dinamik <strong>{daysRemaining} kun</strong> qoldi.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Financial Calculation Summary */}
        <div className="row justify-content-end mb-4">
          <div className="col-12 col-md-7">
            <div className="border rounded p-3 bg-light">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Kotyol Boshlang'ich Narxi:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

              {lateDiscountAmount > 0 && (
                <div className="d-flex justify-content-between small mb-1 text-danger fw-bold">
                  <span>Dinamik Arzonlashuv Chegirmasi (-{lateDiscountRate}%/kun × {daysLate} kun):</span>
                  <span>-{formatCurrency(lateDiscountAmount)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between fw-bold border-top pt-1 mb-2">
                <span>Yakuniy Kotyol Narxi:</span>
                <span className="text-dark">{formatCurrency(finalPrice)}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center p-2 rounded bg-success bg-opacity-10 text-success fw-bold mb-2">
                <span>Zaklad Miqdori (Avans To'landi):</span>
                <span className="fs-6">{formatCurrency(depositAmount)}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center p-2 rounded bg-warning bg-opacity-25 text-dark fw-bold">
                <span>Qolgan Summa (Yetkazilganda):</span>
                <span className="fs-6 text-danger">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer, Signatures & Barcode */}
        <div className="border-top pt-3 mt-3">
          <div className="row align-items-center text-center">
            <div className="col-4">
              <div className="small text-muted mb-4">Sotuvchi Imzosi</div>
              <div className="border-bottom mx-auto w-75"></div>
              <div className="fs-8 text-muted mt-1">(Muhr va Imzo)</div>
            </div>
            <div className="col-4">
              <div className="d-inline-block p-2 border rounded bg-light mb-1">
                <svg width="120" height="36" viewBox="0 0 120 36" fill="none">
                  <rect x="5" y="4" width="2" height="28" fill="#000" />
                  <rect x="9" y="4" width="4" height="28" fill="#000" />
                  <rect x="15" y="4" width="1" height="28" fill="#000" />
                  <rect x="18" y="4" width="3" height="28" fill="#000" />
                  <rect x="23" y="4" width="2" height="28" fill="#000" />
                  <rect x="27" y="4" width="5" height="28" fill="#000" />
                  <rect x="34" y="4" width="1" height="28" fill="#000" />
                  <rect x="37" y="4" width="3" height="28" fill="#000" />
                  <rect x="42" y="4" width="2" height="28" fill="#000" />
                  <rect x="46" y="4" width="4" height="28" fill="#000" />
                  <rect x="52" y="4" width="2" height="28" fill="#000" />
                  <rect x="56" y="4" width="1" height="28" fill="#000" />
                  <rect x="59" y="4" width="3" height="28" fill="#000" />
                  <rect x="64" y="4" width="4" height="28" fill="#000" />
                  <rect x="70" y="4" width="2" height="28" fill="#000" />
                  <rect x="74" y="4" width="1" height="28" fill="#000" />
                  <rect x="77" y="4" width="3" height="28" fill="#000" />
                  <rect x="82" y="4" width="2" height="28" fill="#000" />
                  <rect x="86" y="4" width="5" height="28" fill="#000" />
                  <rect x="93" y="4" width="1" height="28" fill="#000" />
                  <rect x="96" y="4" width="3" height="28" fill="#000" />
                  <rect x="101" y="4" width="2" height="28" fill="#000" />
                  <rect x="105" y="4" width="4" height="28" fill="#000" />
                  <rect x="111" y="4" width="2" height="28" fill="#000" />
                </svg>
              </div>
              <div className="fs-9 text-muted">{receiptNumber}</div>
            </div>
            <div className="col-4">
              <div className="small text-muted mb-4">Mijoz Imzosi</div>
              <div className="border-bottom mx-auto w-75"></div>
              <div className="fs-8 text-muted mt-1">(Tanishdim va Qabul Qildim)</div>
            </div>
          </div>
          <div className="text-center mt-3 fs-9 text-muted">
            Rahmat! {company.name} mahsulotlarini tanlaganingiz uchun tashakkur izhor etamiz!
          </div>
        </div>
      </div>
    </Modal>
  );
};
