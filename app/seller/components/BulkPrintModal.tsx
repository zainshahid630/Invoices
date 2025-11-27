'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ModernTemplate, ExcelTemplate, ClassicTemplate, LetterheadTemplate, DCTemplate } from '@/components/invoice-templates';

interface BulkPrintModalProps {
  selectedInvoices: string[];
  onClose: () => void;
  onPrint: (type: 'ledger' | 'detailed') => void;
}

interface InvoiceItem {
  id: string;
  item_name: string;
  hs_code: string;
  uom: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  po_number: string;
  invoice_date: string;
  invoice_type: string;
  scenario: string;
  buyer_name: string;
  buyer_business_name: string;
  buyer_ntn_cnic: string;
  buyer_address: string;
  buyer_province: string;
  subtotal: number;
  sales_tax_rate: number;
  sales_tax_amount: number;
  further_tax_rate: number;
  further_tax_amount: number;
  total_amount: number;
  buyer_gst_number: string;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  fbr_invoice_number?: string;
  items: InvoiceItem[];
}

interface Company {
  name: string;
  business_name: string;
  address: string;
  ntn_number: string;
  gst_number: string;
  phone: string;
  email: string;
  logo_url?: string;
}

export default function BulkPrintModal({ selectedInvoices, onClose, onPrint }: BulkPrintModalProps) {
  const [printType, setPrintType] = useState<'ledger' | 'detailed' | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [template, setTemplate] = useState('modern');
  const [letterheadTopSpace, setLetterheadTopSpace] = useState(120);
  const [letterheadShowQr, setLetterheadShowQr] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = async (type: 'ledger' | 'detailed') => {
    setPrintType(type);
    setIsPrinting(true);
    
    if (type === 'detailed') {
      // Load invoices in-page for detailed print
      await loadInvoicesForPrint();
    } else {
      // For ledger, use the old routing method
      onPrint(type);
    }
  };

  const loadInvoicesForPrint = async () => {
    try {
      setIsLoading(true);
      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      // Load company and settings
      const settingsRes = await fetch(`/api/seller/settings?company_id=${companyId}`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCompany(settingsData.company);
        setTemplate(settingsData.settings?.invoice_template || 'modern');
        setLetterheadTopSpace(settingsData.settings?.letterhead_top_space || 120);
        setLetterheadShowQr(settingsData.settings?.letterhead_show_qr !== false);
      }

      // Load all invoices
      const loadedInvoices: Invoice[] = [];
      for (let i = 0; i < selectedInvoices.length; i++) {
        const res = await fetch(`/api/seller/invoices/${selectedInvoices[i]}?company_id=${companyId}`);
        if (res.ok) {
          const invoice = await res.json();
          loadedInvoices.push(invoice);
        }
        setLoadingProgress(Math.round(((i + 1) / selectedInvoices.length) * 100));
      }

      setInvoices(loadedInvoices);
      setIsLoading(false);

      // Trigger print after a delay to ensure rendering is complete
      setTimeout(() => {
        window.print();
        // Close modal after print dialog
        setTimeout(() => {
          setInvoices([]);
          setIsPrinting(false);
          onClose();
        }, 1000);
      }, 1500);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setIsLoading(false);
      setIsPrinting(false);
    }
  };

  const getQrCodeUrl = (invoiceId: string) => {
    const verificationUrl = `${window.location.origin}/verify/${invoiceId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;
  };

  const printContent = mounted && invoices.length > 0 && (
    <>
      <style>{`
        @media screen {
          #bulk-print-portal {
            position: fixed;
            left: -9999px;
            top: 0;
          }
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body > *:not(#bulk-print-portal) {
            display: none !important;
          }
          
          #bulk-print-portal {
            position: static !important;
            left: auto !important;
            display: block !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
      <div id="bulk-print-portal">
        {invoices.map((invoice, index) => (
          <div key={invoice.id} className={index < invoices.length - 1 ? 'page-break' : ''}>
            {template === 'modern' && (
              <ModernTemplate invoice={invoice} company={company} qrCodeUrl={getQrCodeUrl(invoice.id)} />
            )}
            {template === 'excel' && (
              <ExcelTemplate invoice={invoice} company={company} qrCodeUrl={getQrCodeUrl(invoice.id)} />
            )}
            {template === 'classic' && (
              <ClassicTemplate invoice={invoice} company={company} qrCodeUrl={getQrCodeUrl(invoice.id)} />
            )}
            {template === 'letterhead' && (
              <LetterheadTemplate 
                invoice={invoice} 
                company={company} 
                qrCodeUrl={getQrCodeUrl(invoice.id)}
                topSpace={letterheadTopSpace}
                showQr={letterheadShowQr}
              />
            )}
            {template === 'dc' && (
              <DCTemplate invoice={invoice} company={company} qrCodeUrl={getQrCodeUrl(invoice.id)} />
            )}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {mounted && printContent && createPortal(printContent, document.body)}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Print {selectedInvoices.length} Invoice{selectedInvoices.length > 1 ? 's' : ''}
            </h2>
            <button
              onClick={onClose}
              disabled={isPrinting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Invoices</h3>
              <p className="text-gray-600 mb-4">Preparing {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} for printing...</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{loadingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Print dialog will open automatically when ready
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                Choose how you want to print the selected invoices:
              </p>

          {/* Ledger Print Option */}
          <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Ledger View (Summary)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Print all invoices on a single page as a ledger. Includes: Business Name, NTN, Date, FBR Number, PO Number, Subtotal, and Total.
                </p>
                <button
                  onClick={() => handlePrint('ledger')}
                  disabled={isPrinting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPrinting && printType === 'ledger' ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Ledger
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Print Option */}
          <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Detailed View (Full Invoices)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Print each invoice with full details using your selected template from settings. Invoices will be printed one by one automatically with progress shown.
                </p>
                <button
                  onClick={() => handlePrint('detailed')}
                  disabled={isPrinting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPrinting && printType === 'detailed' ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Detailed
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isPrinting || isLoading}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
