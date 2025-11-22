'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface InvoiceSummary {
  id: string;
  invoice_number: string;
  invoice_date: string;
  buyer_name: string;
  buyer_business_name: string;
  buyer_ntn_cnic: string;
  fbr_invoice_number: string;
  po_number: string;
  subtotal: number;
  total_amount: number;
}

export default function BulkLedgerPrintPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    const invoiceIds = searchParams.get('ids')?.split(',') || [];
    if (invoiceIds.length === 0) {
      router.push('/seller/invoices');
      return;
    }

    loadInvoices(invoiceIds);
  }, [searchParams, router]);

  const loadInvoices = async (invoiceIds: string[]) => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) {
        router.push('/seller/login');
        return;
      }

      const userData = JSON.parse(session);
      
      // Load company info from settings
      const settingsRes = await fetch(`/api/seller/settings?company_id=${userData.company_id}`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCompanyInfo(settingsData.company);
      }

      // Load invoices with progress tracking
      const loadedInvoices: InvoiceSummary[] = [];
      for (let i = 0; i < invoiceIds.length; i++) {
        const res = await fetch(`/api/seller/invoices/${invoiceIds[i]}?company_id=${userData.company_id}`);
        if (res.ok) {
          const invoice = await res.json();
          loadedInvoices.push(invoice);
        }
        setProgress(Math.round(((i + 1) / invoiceIds.length) * 100));
      }

      setInvoices(loadedInvoices);
      setLoading(false);

      // Check if we're in an iframe
      const isInIframe = window.self !== window.top;
      
      if (isInIframe) {
        // Notify parent window that ledger is ready
        setTimeout(() => {
          window.parent.postMessage('LEDGER_READY', '*');
        }, 500);
      } else {
        // Auto-print if opened directly
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Invoices</h2>
            <p className="text-gray-600">Preparing ledger for printing...</p>
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
      {/* Print Styles - Optimized for Ledger/Summary Table */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            height: auto !important;
          }
          
          .print-content {
            box-shadow: none !important;
            padding: 10mm !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          
          .ledger-header {
            margin-bottom: 8mm !important;
            padding-bottom: 4mm !important;
          }
          
          .ledger-header h1 {
            font-size: 20pt !important;
            margin-bottom: 2mm !important;
          }
          
          .ledger-header p {
            font-size: 10pt !important;
          }
          
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
            font-size: 9pt !important;
          }
          
          thead {
            display: table-header-group !important;
            background-color: #f3f4f6 !important;
          }
          
          thead th {
            font-weight: bold !important;
            padding: 3mm 2mm !important;
            border: 1px solid #000 !important;
          }
          
          tbody tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          
          tbody td {
            padding: 2mm !important;
            border: 1px solid #000 !important;
          }
          
          tfoot {
            display: table-footer-group !important;
            background-color: #f3f4f6 !important;
            font-weight: bold !important;
          }
          
          tfoot td {
            padding: 3mm 2mm !important;
            border: 1px solid #000 !important;
          }
          
          .ledger-footer {
            margin-top: 5mm !important;
            font-size: 8pt !important;
          }
          
          @page {
            size: A4 landscape;
            margin: 10mm 15mm;
          }
        }
        
        @media screen {
          .print-content {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>

      {/* Action Bar */}
      <div className="no-print sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              ✅ Ledger Ready ({invoices.length} Invoice{invoices.length > 1 ? 's' : ''})
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
              🖨️ Print Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Content */}
      <div className="print-container bg-gray-50 min-h-screen p-8">
        <div className="print-content max-w-7xl mx-auto bg-white p-8">
          {/* Header */}
          <div className="ledger-header mb-6 text-center border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {companyInfo?.business_name || 'Company Name'}
            </h1>
            <p className="text-lg font-semibold text-gray-700">Invoice Ledger</p>
            <div className="text-sm text-gray-500 mt-2">
              <span>Generated: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="mx-2">|</span>
              <span>Total Records: {invoices.length}</span>
            </div>
          </div>

          {/* Ledger Table */}
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 px-2 py-2 text-left font-bold" style={{ width: '40px' }}>#</th>
                <th className="border border-gray-800 px-2 py-2 text-left font-bold" style={{ width: '120px' }}>Invoice No</th>
                <th className="border border-gray-800 px-2 py-2 text-left font-bold" style={{ width: '90px' }}>Date</th>
                <th className="border border-gray-800 px-2 py-2 text-left font-bold">Business Name</th>
                <th className="border border-gray-800 px-2 py-2 text-left font-bold" style={{ width: '100px' }}>NTN/CNIC</th>
                <th className="border border-gray-800 px-2 py-2 text-left font-bold" style={{ width: '120px' }}>FBR Invoice</th>
                <th className="border border-gray-800 px-2 py-2 text-left font-bold" style={{ width: '90px' }}>PO No</th>
                <th className="border border-gray-800 px-2 py-2 text-right font-bold" style={{ width: '110px' }}>Subtotal</th>
                <th className="border border-gray-800 px-2 py-2 text-right font-bold" style={{ width: '110px' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={invoice.id}>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">{index + 1}</td>
                  <td className="border border-gray-400 px-2 py-1.5 font-medium">{invoice.invoice_number}</td>
                  <td className="border border-gray-400 px-2 py-1.5">
                    {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="border border-gray-400 px-2 py-1.5">
                    {invoice.buyer_business_name || invoice.buyer_name}
                  </td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">{invoice.buyer_ntn_cnic || '-'}</td>
                  <td className="border border-gray-400 px-2 py-1.5">{invoice.fbr_invoice_number || '-'}</td>
                  <td className="border border-gray-400 px-2 py-1.5 text-center">{invoice.po_number || '-'}</td>
                  <td className="border border-gray-400 px-2 py-1.5 text-right">
                    {parseFloat(invoice.subtotal?.toString() || '0').toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="border border-gray-400 px-2 py-1.5 text-right font-semibold">
                    {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td colSpan={7} className="border-2 border-gray-800 px-2 py-2 text-right font-bold text-base">
                  GRAND TOTAL:
                </td>
                <td className="border-2 border-gray-800 px-2 py-2 text-right font-bold text-base">
                  {invoices.reduce((sum, inv) => sum + parseFloat(inv.subtotal?.toString() || '0'), 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="border-2 border-gray-800 px-2 py-2 text-right font-bold text-base">
                  {invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer */}
          <div className="ledger-footer mt-6 text-center text-xs text-gray-500 border-t border-gray-300 pt-3">
            <p className="font-medium">This is a computer-generated ledger report. No signature is required.</p>
            <p className="mt-1">Printed from Invoice Management System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
