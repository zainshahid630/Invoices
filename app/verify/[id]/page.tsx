'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface InvoiceItem {
  id: string;
  item_name: string;
  hs_code: string;
  uom: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface Company {
  id: string;
  name: string;
  business_name: string;
  address: string;
  ntn_number: string;
  gst_number: string;
  phone: string;
  email: string;
  logo_url?: string;
  province: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  fbr_invoice_number?: string;
  po_number: string;
  invoice_date: string;
  invoice_type: string;
  buyer_name: string;
  buyer_business_name: string;
  buyer_ntn_cnic: string;
  buyer_address: string;
  buyer_province: string;
  buyer_gst_number: string;
  subtotal: number;
  sales_tax_rate: number;
  sales_tax_amount: number;
  further_tax_rate: number;
  further_tax_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  fbr_posted_at?: string;
  company: Company;
  items: InvoiceItem[];
}

export default function PublicInvoiceVerificationPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    try {
      const response = await fetch(`/api/verify/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load invoice');
        setLoading(false);
        return;
      }

      setInvoice(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="https://invoicefbr.com"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Go to InvoiceFBR
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with FBR Verification Badge */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">FBR Verified Invoice</h1>
                  <p className="text-green-100">This invoice is registered with Federal Board of Revenue</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-100">Verified on</p>
                <p className="text-lg font-bold">{invoice.fbr_posted_at ? new Date(invoice.fbr_posted_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Invoice Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Company Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
                <p className="text-blue-100 text-lg">{invoice.invoice_number}</p>
                {invoice.fbr_invoice_number && (
                  <p className="text-blue-100 text-sm mt-1">FBR #: {invoice.fbr_invoice_number}</p>
                )}
              </div>
              <div className="text-right">
                {invoice.company.logo_url ? (
                  <img
                    src={invoice.company.logo_url}
                    alt={invoice.company.business_name || invoice.company.name}
                    className="h-16 mb-2 ml-auto object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-2 ml-auto">
                    <span className="text-2xl">🏢</span>
                  </div>
                )}
                <p className="text-sm text-blue-100 font-semibold">
                  {invoice.company.business_name || invoice.company.name}
                </p>
              </div>
            </div>
          </div>

          {/* Company and Buyer Info */}
          <div className="grid md:grid-cols-2 gap-8 p-8 border-b-2 border-gray-200">
            {/* From */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <span>📤</span> From (Seller)
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-bold text-gray-900">{invoice.company.business_name || invoice.company.name}</p>
                {invoice.company.address && <p className="text-gray-700">{invoice.company.address}</p>}
                {invoice.company.province && <p className="text-gray-700">Province: {invoice.company.province}</p>}
                {invoice.company.ntn_number && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="font-semibold">NTN:</span> {invoice.company.ntn_number}
                  </p>
                )}
                {invoice.company.gst_number && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="font-semibold">GST:</span> {invoice.company.gst_number}
                  </p>
                )}
                {invoice.company.phone && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="font-semibold">Phone:</span> {invoice.company.phone}
                  </p>
                )}
                {invoice.company.email && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="font-semibold">Email:</span> {invoice.company.email}
                  </p>
                )}
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <span>📥</span> To (Buyer)
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-bold text-gray-900">{invoice.buyer_name}</p>
                {invoice.buyer_business_name && <p className="text-gray-700">{invoice.buyer_business_name}</p>}
                {invoice.buyer_address && <p className="text-gray-700">{invoice.buyer_address}</p>}
                {invoice.buyer_province && <p className="text-gray-700">Province: {invoice.buyer_province}</p>}
                {invoice.buyer_ntn_cnic && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="font-semibold">NTN/CNIC:</span> {invoice.buyer_ntn_cnic}
                  </p>
                )}
                {invoice.buyer_gst_number && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="font-semibold">GST:</span> {invoice.buyer_gst_number}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-gray-50 border-b border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</p>
              <p className="text-sm font-bold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
            </div>
            {invoice.po_number && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">PO Number</p>
                <p className="text-sm font-bold text-gray-900">{invoice.po_number}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Type</p>
              <p className="text-sm font-bold text-gray-900">{invoice.invoice_type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
              <p className="text-sm font-bold text-green-600 uppercase">{invoice.payment_status}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 text-xs font-bold text-gray-700 uppercase">Item Description</th>
                    <th className="text-left py-3 text-xs font-bold text-gray-700 uppercase">HS Code</th>
                    <th className="text-center py-3 text-xs font-bold text-gray-700 uppercase">UOM</th>
                    <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Unit Price</th>
                    <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Qty</th>
                    <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-4 text-gray-900">{item.item_name}</td>
                      <td className="py-4 text-gray-700 text-sm">{item.hs_code || '-'}</td>
                      <td className="py-4 text-gray-700 text-sm text-center">{item.uom}</td>
                      <td className="py-4 text-gray-900 text-right">
                        PKR {parseFloat(item.unit_price.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-gray-900 text-right">{parseFloat(item.quantity.toString())}</td>
                      <td className="py-4 text-gray-900 font-semibold text-right">
                        PKR {parseFloat(item.line_total.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="p-8 bg-gray-50 border-t-2 border-gray-200">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">
                  PKR {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {invoice.sales_tax_rate > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Sales Tax ({invoice.sales_tax_rate}%):</span>
                  <span className="font-semibold">
                    PKR {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {invoice.further_tax_rate > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Further Tax ({invoice.further_tax_rate}%):</span>
                  <span className="font-semibold">
                    PKR {parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t-2 border-blue-600">
                <span>Total Amount:</span>
                <span>PKR {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-8 bg-blue-50 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Notes</h3>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 text-center">
            <p className="text-sm mb-2">This invoice is verified and registered with FBR</p>
            <p className="text-xs text-blue-100">
              Powered by <a href="https://invoicefbr.com" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">InvoiceFBR.com</a> - Pakistan's #1 FBR-Compliant Invoicing Software
            </p>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">About This Invoice</h3>
              <p className="text-gray-600 mb-4">
                This invoice has been digitally registered with Pakistan's Federal Board of Revenue (FBR) and is fully compliant with tax regulations. 
                You can verify its authenticity by scanning the QR code on the printed invoice.
              </p>
              <a
                href="https://invoicefbr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Create Your Own FBR-Compliant Invoices
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
