import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Button } from '@/components/common/Button/Button';
import { salesApi } from '@/features/sales/api/salesApi';
import { formatCurrency } from '@/utils/currency.utils';
import { LuPrinter, LuAward } from 'react-icons/lu';

export const SaleReceiptModal = ({
  isOpen,
  onClose,
  saleId = null,
}) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (isOpen && saleId) {
      setLoading(true);
      salesApi.getSaleReceipt(saleId).then((res) => {
        if (res.success && res.data) {
          const raw = res.data.data || res.data;
          setReceipt(raw);
        } else {
          setReceipt(null);
        }
        setLoading(false);
      });
    }
  }, [isOpen, saleId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'https://kotyol.pythonanywhere.com/api/v1';
    window.open(`${baseURL}/sales/${saleId}/print_html/`, '_blank', 'width=400,height=600');
  };

  const c = receipt?.company || {};
  const s = receipt?.sale_info || {};
  const cust = receipt?.customer || {};
  const item = receipt?.item || {};
  const f = receipt?.financials || {};
  const w = receipt?.warranty || {};

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2">
          <LuPrinter className="text-primary fs-5" />
          <span>{receipt?.receipt_title || 'Sotuv Cheki / Schyot-Faktura'}</span>
        </div>
      }
      size="lg"
      footer={
        <div className="d-flex justify-content-between align-items-center w-100">
          <span className="text-muted fs-8">Faktura №: {s.invoice_number || '—'}</span>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={onClose}>
              Yopish
            </Button>
            <Button variant="primary" size="sm" icon={<LuPrinter />} onClick={handlePrint} disabled={loading || !receipt}>
              Chekni Chop Etish
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      ) : !receipt ? (
        <div className="text-center py-5 text-danger fs-7">
          Chek ma'lumotlarini yuklab bo'lmadi yoki sotuv cheki mavjud emas.
        </div>
      ) : (
        <div ref={printRef} className="customer-receipt-container p-4 bg-white text-dark rounded border shadow-sm position-relative">
          {/* Advanced Thermal Printer CSS Override */}
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
              .col-12, .col-md-6, .col-4 {
                width: 100% !important;
                display: block !important;
                padding: 0 !important;
                margin-bottom: 2mm !important;
                border: none !important;
              }
              
              /* Align totals properly */
              .justify-content-end {
                justify-content: flex-end !important;
                display: block !important;
              }
              .col-md-7, .col-md-6 {
                width: 100% !important;
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

              /* Signature block format for mini-receipt */
              .signature-section {
                margin-top: 5mm !important;
                border-top: 1px dashed #000 !important;
                padding-top: 3mm !important;
              }
              .signature-row {
                display: flex !important;
                justify-content: space-between !important;
                font-size: 9px !important;
                margin-top: 4mm !important;
              }
              .signature-col {
                width: 45% !important;
                text-align: center !important;
              }
              .signature-line {
                border-bottom: 1px dashed #000 !important;
                margin-top: 8mm !important;
              }
            }
          `}</style>

          {/* Receipt Header */}
          <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fs-4 fw-bold text-primary text-uppercase">{c.name || 'KOTYOL MANUFACTURING'}</span>
                <span className="badge bg-success text-white fs-9 no-print">SOTUV FAOL</span>
              </div>
              <p className="small text-secondary mb-0">Isitish kotyollari va sanoat uskunalarini ishlab chiqarish majmuasi</p>
              <p className="small text-secondary mb-0">Manzil: {c.address || 'Toshkent sh.'} | Tel: {c.phone || '—'}</p>
              {c.website && <p className="small text-secondary mb-0">Vebsayt: {c.website}</p>}
            </div>
            <div className="text-end">
              <div className="fw-bold fs-5 text-dark">FAKTURA № {s.invoice_number}</div>
              <div className="small text-muted">Sana: <strong>{s.date}</strong></div>
              <div className="small text-muted">Usta / Mas'ul: <strong>{s.assigned_employee || '—'}</strong></div>
            </div>
          </div>

          {/* Customer & Transaction Info */}
          <div className="bg-light p-3 rounded mb-3 border">
            <div className="row g-3 small">
              <div className="col-12 col-md-6 border-end-md">
                <h6 className="fw-bold text-dark mb-2 border-bottom pb-1">Xaridor:</h6>
                <div className="d-flex flex-column gap-1">
                  <div><span className="text-muted">Nomi / Korxona:</span> <strong className="text-dark">{cust.name}</strong></div>
                  <div><span className="text-muted">Tel:</span> <strong className="text-dark">{cust.phone || '—'}</strong></div>
                  <div><span className="text-muted">Yetkazish manzili:</span> <strong className="text-dark">{formatAddress(cust.address)}</strong></div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <h6 className="fw-bold text-dark mb-2 border-bottom pb-1">Sotuv Tafsiloti:</h6>
                <div className="d-flex flex-column gap-1">
                  <div><span className="text-muted">To'lov Holati:</span> <span className={`badge ${s.payment_status === 'PAID' ? 'bg-success text-white' : 'bg-warning text-dark'} fs-9`}>{s.payment_status === 'PAID' ? 'To\'langan' : s.payment_status}</span></div>
                  <div><span className="text-muted">Yetkazib Berish:</span> <span className={`badge ${s.delivery_status === 'DELIVERED' ? 'bg-success text-white' : 'bg-secondary text-white'} fs-9`}>{s.delivery_status === 'DELIVERED' ? 'Yetkazildi' : s.delivery_status}</span></div>
                  <div><span className="text-muted">Valyuta:</span> <strong className="text-dark">{c.currency}</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="table-responsive mb-3">
            <table className="table table-bordered align-middle small mb-0">
              <thead className="table-secondary">
                <tr>
                  <th>Mahsulot / Kotyol Modeli</th>
                  <th className="text-center" style={{ width: '80px' }}>Miqdor</th>
                  <th className="text-end" style={{ width: '150px' }}>Birlik Narxi</th>
                  <th className="text-end" style={{ width: '150px' }}>Jami Summa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="fw-bold text-dark">{item.name}</div>
                    <div className="text-muted fs-8 no-print">Kafolatli va sertifikatlangan isitish uskunasi</div>
                  </td>
                  <td className="text-center fw-bold">{item.quantity} dona</td>
                  <td className="text-end">{formatCurrency(item.unit_price, c.currency)}</td>
                  <td className="text-end fw-bold">{formatCurrency(item.subtotal, c.currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Warranty Alert Box */}
          {w.period && (
            <div className="bg-light p-3 rounded mb-3 border">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1">
                <LuAward className="text-success no-print" />
                <strong>Kafolat va Servis Guvohnomasi:</strong>
              </h6>
              <div className="row g-2 small">
                <div className="col-12 col-md-4">
                  <span className="text-muted">Muddati:</span> <strong className="text-success">{w.period}</strong>
                </div>
                <div className="col-12 col-md-4">
                  <span className="text-muted">Boshlanish:</span> <strong className="text-dark">{w.start_date}</strong>
                </div>
                <div className="col-12 col-md-4">
                  <span className="text-muted">Tugash:</span> <strong className="text-danger">{w.end_date}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="row justify-content-end mb-4">
            <div className="col-12 col-md-6">
              <div className="border rounded p-3 bg-light fs-7">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Boshlang'ich qiymati:</span>
                  <span>{formatCurrency(f.subtotal, c.currency)}</span>
                </div>
                {f.discount_amount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-danger fw-semibold">
                    <span>Chegirma:</span>
                    <span>-{formatCurrency(f.discount_amount, c.currency)}</span>
                  </div>
                )}
                {f.tax_amount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-muted">
                    <span>Soliq (QQS 12%):</span>
                    <span>+{formatCurrency(f.tax_amount, c.currency)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-1 fs-6 text-primary">
                  <span>Jami To'lov Summasi:</span>
                  <span>{formatCurrency(f.total_amount, c.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Barcode (Screen view only) */}
          <div className="border-top pt-3 mt-3 no-print">
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
                <div className="fs-9 text-muted">{s.invoice_number}</div>
              </div>
              <div className="col-4">
                <div className="small text-muted mb-4">Mijoz Imzosi</div>
                <div className="border-bottom mx-auto w-75"></div>
                <div className="fs-8 text-muted mt-1">(Tanishdim va Qabul Qildim)</div>
              </div>
            </div>
          </div>

          {/* Signature block specifically for print (80mm) */}
          <div className="signature-section d-none d-print-block">
            <div className="signature-row">
              <div className="signature-col">
                <div>Sotuvchi:</div>
                <div className="signature-line"></div>
              </div>
              <div className="signature-col">
                <div>Mijoz:</div>
                <div className="signature-line"></div>
              </div>
            </div>
          </div>

          {receipt.notes && (
            <div className="bg-light p-2 rounded mt-3 fs-8 text-muted-custom border">
              <strong>Izoh:</strong> {receipt.notes}
            </div>
          )}
          <div className="text-center mt-3 fs-9 text-muted">
            Rahmat! Kotyol Manufacturing mahsulotlarini xarid qilganingiz uchun minnatdormiz!
          </div>
        </div>
      )}
    </Modal>
  );
};
