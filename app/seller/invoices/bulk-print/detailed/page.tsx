'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ModernTemplate, ExcelTemplate, ClassicTemplate, LetterheadTemplate } from '@/components/invoice-templates';

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

export default function BulkDetailedPrintPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [template, setTemplate] = useState('modern');
  const [letterheadTopSpace, setLetterheadTopSpace] = useState(120);
  const [letterheadShowQr, setLetterheadShowQr] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',') || [];
    if (ids.length === 0) {
      router.push('/seller/invoices');
      return;
    }

    loadAllInvoices(ids);
  }, [searchParams, router]);

  const loadAllInvoices = async (invoiceIds: string[]) => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) {
        router.push('/seller/login');
        return;
      }

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
      for (let i = 0; i < invoiceIds.length; i++) {
        const res = await fetch(`/api/seller/invoices/${invoiceIds[i]}?company_id=${companyId}`);
        if (res.ok) {
          const invoice = await res.json();
          loadedInvoices.push(invoice);
        }
        setProgress(Math.round(((i + 1) / invoiceIds.length) * 100));
      }

      setInvoices(loadedInvoices);
      setLoading(false);

      // Auto-print after a short delay
      setTimeout(() => {
        window.print();
      }, 1000);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setLoading(false);
    }
  };

  const getQrCodeUrl = (invoiceId: string) => {
    const verificationUrl = `${window.location.origin}/verify/${invoiceId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Invoices</h2>
            <p className="text-gray-600">Preparing invoices for printing...</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Print dialog will open automatically when ready
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          
          .invoice-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
        
        @media screen {
          .invoice-container {
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>

      {/* Action Bar */}
      <div className="no-print sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              ✅ {invoices.length} Invoice{invoices.length > 1 ? 's' : ''} Ready
            </h2>
            <p className="text-sm text-gray-600">Click Print or use Ctrl+P (Cmd+P on Mac)</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
            >
              🖨️ Print All
            </button>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-gray-50 min-h-screen p-4">
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
          </div>
        ))}
      </div>
    </div>
  );
}

// All templates are now imported from shared components
