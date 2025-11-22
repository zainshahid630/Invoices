'use client';

import { useEffect, useState, useRef } from 'react';

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

interface LedgerModalProps {
  invoiceIds: string[];
  onClose: () => void;
}

export default function LedgerModal({ invoiceIds, onClose }: LedgerModalProps) {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadInvoices();
    
    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'LEDGER_READY') {
        // Iframe is ready, trigger print
        setTimeout(() => {
          try {
            printIframeRef.current?.contentWindow?.print();
          } catch (error) {
            console.error('Print error:', error);
          }
        }, 500);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [invoiceIds]);

  const loadInvoices = async () => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      
      // Load company info
      const companyRes = await fetch(`/api/seller/company?company_id=${userData.company_id}`);
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompanyInfo(companyData);
      }

      // Load invoices
      const invoicePromises = invoiceIds.map(id =>
        fetch(`/api/seller/invoices/${id}?company_id=${userData.company_id}`).then(res => res.json())
      );

      const invoicesData = await Promise.all(invoicePromises);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const ids = invoiceIds.join(',');
    const printUrl = `/seller/invoices/bulk-print/ledger?ids=${ids}`;
    
    // Load the print page in iframe
    if (printIframeRef.current) {
      printIframeRef.current.src = printUrl;
      // Print will be triggered when iframe sends 'LEDGER_READY' message
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Invoice Ledger</h2>
            <p className="text-sm text-gray-600">{invoices.length} invoices</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          ) : (
            <div className="bg-white">
              {/* Header */}
              <div className="mb-6 text-center border-b-2 border-gray-800 pb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {companyInfo?.business_name || 'Invoice Ledger'}
                </h1>
                <p className="text-gray-600">Invoice Summary Report</p>
                <p className="text-sm text-gray-500">
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-500">Total Invoices: {invoices.length}</p>
              </div>

              {/* Ledger Table */}
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Invoice No</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Business Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Buyer NTN/CNIC</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">FBR No</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">PO No</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Subtotal</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 font-medium">{invoice.invoice_number}</td>
                      <td className="border border-gray-300 px-3 py-2">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {invoice.buyer_business_name || invoice.buyer_name}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">{invoice.buyer_ntn_cnic || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2">{invoice.fbr_invoice_number || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2">{invoice.po_number || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        Rs. {parseFloat(invoice.subtotal?.toString() || '0').toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                        Rs. {parseFloat(invoice.total_amount.toString()).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={7} className="border border-gray-300 px-3 py-2 text-right">Grand Total:</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      Rs. {invoices.reduce((sum, inv) => sum + parseFloat(inv.subtotal?.toString() || '0'), 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      Rs. {invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>This is a computer-generated document. No signature is required.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden iframe for printing */}
      <iframe
        ref={printIframeRef}
        style={{ display: 'none' }}
        title="Print Ledger"
      />
    </div>
  );
}
