'use client';

import { useState } from 'react';
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

// Mock invoice data
const mockInvoice: Invoice = {
  id: 'test-123',
  invoice_number: 'INV-2024-001',
  fbr_invoice_number: 'FBR-PKR-2024-123456789',
  po_number: 'PO-2024-001',
  invoice_date: new Date().toISOString(),
  invoice_type: 'Sales Invoice',
  buyer_name: 'Ahmed Khan',
  buyer_business_name: 'Khan Enterprises',
  buyer_ntn_cnic: '1234567890123',
  buyer_address: '123 Main Street, Gulberg',
  buyer_province: 'Punjab',
  buyer_gst_number: 'GST-123456',
  subtotal: 100000,
  sales_tax_rate: 18,
  sales_tax_amount: 18000,
  further_tax_rate: 1,
  further_tax_amount: 1000,
  total_amount: 119000,
  status: 'fbr_posted',
  payment_status: 'paid',
  notes: 'Thank you for your business. Payment terms: Net 30 days.',
  created_at: new Date().toISOString(),
  fbr_posted_at: new Date().toISOString(),
  company: {
    id: 'company-1',
    name: 'ABC Corporation',
    business_name: 'ABC Corporation (Pvt) Ltd',
    address: '456 Business Avenue, DHA Phase 5, Lahore',
    ntn_number: '9876543210',
    gst_number: 'GST-987654',
    phone: '+92-300-1234567',
    email: 'info@abccorp.com',
    logo_url: 'https://via.placeholder.com/150x150?text=ABC+Corp',
    province: 'Punjab'
  },
  items: [
    {
      id: 'item-1',
      item_name: 'Premium Laptop Computer',
      hs_code: '8471.30.00',
      uom: 'PCS',
      unit_price: 50000,
      quantity: 1,
      line_total: 50000
    },
    {
      id: 'item-2',
      item_name: 'Wireless Mouse',
      hs_code: '8471.60.00',
      uom: 'PCS',
      unit_price: 2000,
      quantity: 2,
      line_total: 4000
    },
    {
      id: 'item-3',
      item_name: 'USB-C Cable',
      hs_code: '8544.42.00',
      uom: 'PCS',
      unit_price: 1000,
      quantity: 3,
      line_total: 3000
    },
    {
      id: 'item-4',
      item_name: 'External Hard Drive 1TB',
      hs_code: '8471.70.00',
      uom: 'PCS',
      unit_price: 8000,
      quantity: 2,
      line_total: 16000
    },
    {
      id: 'item-5',
      item_name: 'Laptop Bag',
      hs_code: '4202.92.00',
      uom: 'PCS',
      unit_price: 3000,
      quantity: 1,
      line_total: 3000
    },
    {
      id: 'item-6',
      item_name: 'HDMI Cable',
      hs_code: '8544.42.00',
      uom: 'PCS',
      unit_price: 1500,
      quantity: 2,
      line_total: 3000
    },
    {
      id: 'item-7',
      item_name: 'Keyboard - Mechanical',
      hs_code: '8471.60.00',
      uom: 'PCS',
      unit_price: 7000,
      quantity: 1,
      line_total: 7000
    },
    {
      id: 'item-8',
      item_name: 'Monitor Stand',
      hs_code: '9403.20.00',
      uom: 'PCS',
      unit_price: 4000,
      quantity: 1,
      line_total: 4000
    },
    {
      id: 'item-9',
      item_name: 'Webcam HD',
      hs_code: '8525.80.00',
      uom: 'PCS',
      unit_price: 5000,
      quantity: 2,
      line_total: 10000
    }
  ]
};

export default function TestVerificationPage() {
  const [invoice] = useState<Invoice>(mockInvoice);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Test Banner */}
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
          <p className="text-yellow-800 font-bold text-sm sm:text-lg">🧪 TEST MODE - Preview Only</p>
          <p className="text-yellow-700 text-xs sm:text-sm mt-1">This is how your invoice will look when someone scans the QR code</p>
        </div>

        {/* Header with FBR Verification Badge */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">FBR Verified Invoice</h1>
                  <p className="text-green-100 text-xs sm:text-sm">Registered with Federal Board of Revenue</p>
                </div>
              </div>
              <div className="text-left sm:text-right ml-auto sm:ml-0">
                <p className="text-xs sm:text-sm text-green-100">Verified on</p>
                <p className="text-sm sm:text-lg font-bold">{invoice.fbr_posted_at ? new Date(invoice.fbr_posted_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Invoice Card */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden">
          {/* Company Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">INVOICE</h2>
                <p className="text-blue-100 text-base sm:text-lg font-mono">{invoice.invoice_number}</p>
                {invoice.fbr_invoice_number && (
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">FBR #: {invoice.fbr_invoice_number}</p>
                )}
              </div>
              <div className="text-left sm:text-right">
                {invoice.company.logo_url ? (
                  <Image
                    src={invoice.company.logo_url}
                    alt={invoice.company.business_name || invoice.company.name}
                    width={100}
                    height={64}
                    className="h-12 sm:h-16 mb-2 object-contain w-auto"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-xl sm:text-2xl">🏢</span>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-blue-100 font-semibold">
                  {invoice.company.business_name || invoice.company.name}
                </p>
              </div>
            </div>
          </div>

          {/* Company and Buyer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 border-b border-gray-200">
            {/* From */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase mb-2 sm:mb-3 flex items-center gap-2">
                <span>📤</span> From (Seller)
              </h3>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{invoice.company.business_name || invoice.company.name}</p>
                {invoice.company.address && <p className="text-xs sm:text-sm text-gray-700">{invoice.company.address}</p>}
                {invoice.company.province && <p className="text-xs sm:text-sm text-gray-700">Province: {invoice.company.province}</p>}
                {invoice.company.ntn_number && (
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold">NTN:</span> {invoice.company.ntn_number}
                  </p>
                )}
                {invoice.company.gst_number && (
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold">GST:</span> {invoice.company.gst_number}
                  </p>
                )}
                {invoice.company.phone && (
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold">Phone:</span> {invoice.company.phone}
                  </p>
                )}
                {invoice.company.email && (
                  <p className="text-xs sm:text-sm text-gray-700 break-all">
                    <span className="font-semibold">Email:</span> {invoice.company.email}
                  </p>
                )}
              </div>
            </div>

            {/* To */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase mb-2 sm:mb-3 flex items-center gap-2">
                <span>📥</span> To (Buyer)
              </h3>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{invoice.buyer_name}</p>
                {invoice.buyer_business_name && <p className="text-xs sm:text-sm text-gray-700">{invoice.buyer_business_name}</p>}
                {invoice.buyer_address && <p className="text-xs sm:text-sm text-gray-700">{invoice.buyer_address}</p>}
                {invoice.buyer_province && <p className="text-xs sm:text-sm text-gray-700">Province: {invoice.buyer_province}</p>}
                {invoice.buyer_ntn_cnic && (
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold">NTN/CNIC:</span> {invoice.buyer_ntn_cnic}
                  </p>
                )}
                {invoice.buyer_gst_number && (
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold">GST:</span> {invoice.buyer_gst_number}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-gray-50 border-b border-gray-200">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
            </div>
            {invoice.po_number && (
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">PO Number</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900">{invoice.po_number}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Type</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900">{invoice.invoice_type}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
              <p className="text-xs sm:text-sm font-bold text-green-600 uppercase">{invoice.payment_status}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-4 sm:p-6 md:p-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Invoice Items</h3>

            {/* Mobile View - Cards */}
            <div className="block md:hidden space-y-3">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{item.item_name}</p>
                      <p className="text-xs text-gray-600 mt-1">HS: {item.hs_code || '-'}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">#{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-gray-500">Qty</p>
                      <p className="font-semibold text-gray-900">{parseFloat(item.quantity.toString())} {item.uom}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rate</p>
                      <p className="font-semibold text-gray-900">₨{parseFloat(item.unit_price.toString()).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Amount</p>
                      <p className="font-bold text-blue-600">₨{parseFloat(item.line_total.toString()).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-700 uppercase">Item Description</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-700 uppercase">HS Code</th>
                    <th className="text-center py-3 px-2 text-xs font-bold text-gray-700 uppercase">UOM</th>
                    <th className="text-right py-3 px-2 text-xs font-bold text-gray-700 uppercase">Unit Price</th>
                    <th className="text-right py-3 px-2 text-xs font-bold text-gray-700 uppercase">Qty</th>
                    <th className="text-right py-3 px-2 text-xs font-bold text-gray-700 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-900">{item.item_name}</td>
                      <td className="py-3 px-2 text-xs text-gray-700">{item.hs_code || '-'}</td>
                      <td className="py-3 px-2 text-xs text-gray-700 text-center">{item.uom}</td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-right">
                        PKR {parseFloat(item.unit_price.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-right">{parseFloat(item.quantity.toString())}</td>
                      <td className="py-3 px-2 text-sm text-gray-900 font-semibold text-right">
                        PKR {parseFloat(item.line_total.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 border-t-2 border-gray-200">
            <div className="max-w-md ml-auto space-y-2 sm:space-y-3">
              <div className="flex justify-between text-sm sm:text-base text-gray-700">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">
                  PKR {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {invoice.sales_tax_rate > 0 && (
                <div className="flex justify-between text-sm sm:text-base text-gray-700">
                  <span className="font-medium">Sales Tax ({invoice.sales_tax_rate}%):</span>
                  <span className="font-semibold">
                    PKR {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {invoice.further_tax_rate > 0 && (
                <div className="flex justify-between text-sm sm:text-base text-gray-700">
                  <span className="font-medium">Further Tax ({invoice.further_tax_rate}%):</span>
                  <span className="font-semibold">
                    PKR {parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg sm:text-xl md:text-2xl font-bold text-gray-900 pt-3 sm:pt-4 border-t-2 border-blue-600">
                <span>Total:</span>
                <span>PKR {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* QR Code and FBR Logo Section */}
          {invoice.fbr_invoice_number && (
            <div className="p-4 sm:p-6 md:p-8 bg-white border-t-2 border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-300 shadow-md">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(invoice.fbr_invoice_number)}`}
                      alt="FBR Invoice QR Code"
                      width={128}
                      height={128}
                      className="w-24 h-24 sm:w-32 sm:h-32"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-700 mt-2 text-center">Scan to Verify</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 text-center font-mono">{invoice.fbr_invoice_number}</p>
                </div>

                {/* FBR Logo */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg border-2 border-green-300 shadow-md">
                    <Image
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrqaitV5qiVR9gX9hEQmxX4Gx43m0JR3T5Pg&s"
                      alt="FBR Digital Invoicing"
                      width={128}
                      height={128}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-green-700 mt-2 text-center">FBR Verified</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 text-center">Digital Invoice</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="p-4 sm:p-6 md:p-8 bg-blue-50 border-t border-gray-200">
              <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase mb-2">Notes</h3>
              <p className="text-xs sm:text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm mb-2">This invoice is verified and registered with FBR</p>
            <p className="text-[10px] sm:text-xs text-blue-100">
              Powered by <a href="https://invoicefbr.com" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">InvoiceFBR.com</a> - Pakistan&apos;s #1 FBR-Compliant Invoicing Software
            </p>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">About This Invoice</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                This invoice has been digitally registered with Pakistan&apos;s Federal Board of Revenue (FBR) and is fully compliant with tax regulations.
                You can verify its authenticity by scanning the QR code on the printed invoice.
              </p>
              <a
                href="https://invoicefbr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-xs sm:text-sm"
              >
                Create Your Own FBR-Compliant Invoices
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
