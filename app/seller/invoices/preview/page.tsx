'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Helper function for consistent number formatting
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Sample invoice data for preview
const sampleInvoice = {
  id: 'sample-id',
  invoice_number: 'INV-2025-00001',
  po_number: 'PO-2025-001',
  invoice_date: '2025-01-15',
  invoice_type: 'Sales Tax Invoice',
  scenario: 'B2B',
  buyer_name: 'ABC Corporation',
  buyer_business_name: 'ABC Corp (Pvt) Ltd',
  buyer_ntn_cnic: '1234567-8',
  buyer_address: '123 Business Street, Karachi',
  buyer_province: 'Sindh',
  subtotal: 100000.00,
  sales_tax_rate: 18.0,
  sales_tax_amount: 18000.00,
  further_tax_rate: 3.0,
  further_tax_amount: 3000.00,
  total_amount: 121000.00,
  status: 'verified',
  payment_status: 'paid',
  notes: 'Thank you for your business. Payment terms: Net 30 days.',
  items: [
    {
      id: '1',
      item_name: 'Professional Services - Web Development',
      hs_code: '854232',
      uom: 'Hours',
      unit_price: 5000.00,
      quantity: 10,
      line_total: 50000.00,
    },
    {
      id: '2',
      item_name: 'Cloud Hosting Services',
      hs_code: '854233',
      uom: 'Month',
      unit_price: 25000.00,
      quantity: 2,
      line_total: 50000.00,
    },
  ],
};

const sampleCompany = {
  id: 'company-id',
  name: 'Your Company Name',
  business_name: 'Your Business (Pvt) Ltd',
  address: '456 Corporate Avenue, Lahore, Pakistan',
  ntn_number: '9876543-2',
  gst_number: 'GST-123456',
  phone: '+92-300-1234567',
  email: 'info@yourcompany.com',
  logo_url: '',
};

export default function InvoicePreviewPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const template = searchParams.get('template') || 'modern';

  // Generate QR code
  const qrData = `Invoice: ${sampleInvoice.invoice_number}\nDate: ${sampleInvoice.invoice_date}\nAmount: PKR ${sampleInvoice.total_amount}\nBuyer: ${sampleInvoice.buyer_name}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Preview Mode:</strong> This is a sample invoice with dummy data for template preview purposes.
          </p>
        </div>
      </div>

      {template === 'modern' && (
        <ModernTemplate invoice={sampleInvoice} company={sampleCompany} qrCodeUrl={qrCodeUrl} />
      )}
      {template === 'classic' && (
        <ClassicTemplate invoice={sampleInvoice} company={sampleCompany} qrCodeUrl={qrCodeUrl} />
      )}
      {!['modern', 'classic'].includes(template) && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Template</h2>
          <p className="text-gray-600 mb-6">
            This is a premium template. Contact Super Admin for access.
          </p>
          <div className="bg-gray-100 rounded-lg p-8">
            <p className="text-sm text-gray-600">Template: <strong>{template}</strong></p>
            <p className="text-sm text-gray-600 mt-2">Preview available after purchase</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Modern Template Component (same as print page)
function ModernTemplate({ invoice, company, qrCodeUrl }: any) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
            <p className="text-blue-100 text-lg">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <img
              src="https://i.ibb.co/9ZQY8Kq/fbr-digital-invoice-logo.png"
              alt="FBR Digital Invoicing"
              className="h-16 mb-2 ml-auto"
            />
            <p className="text-sm text-blue-100">FBR Compliant Invoice</p>
          </div>
        </div>
      </div>

      {/* Company and Buyer Info */}
      <div className="grid grid-cols-2 gap-8 p-8 bg-gray-50">
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">From</h2>
          <p className="text-lg font-bold text-gray-900">{company.business_name || company.name}</p>
          {company.address && <p className="text-sm text-gray-700 mt-2">{company.address}</p>}
          {company.ntn_number && <p className="text-sm text-gray-700">NTN: {company.ntn_number}</p>}
          {company.gst_number && <p className="text-sm text-gray-700">GST: {company.gst_number}</p>}
          {company.phone && <p className="text-sm text-gray-700">Phone: {company.phone}</p>}
          {company.email && <p className="text-sm text-gray-700">Email: {company.email}</p>}
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Bill To</h2>
          <p className="text-lg font-bold text-gray-900">{invoice.buyer_name}</p>
          {invoice.buyer_business_name && <p className="text-sm text-gray-700 mt-2">{invoice.buyer_business_name}</p>}
          {invoice.buyer_ntn_cnic && <p className="text-sm text-gray-700">NTN/CNIC: {invoice.buyer_ntn_cnic}</p>}
          {invoice.buyer_province && <p className="text-sm text-gray-700">Province: {invoice.buyer_province}</p>}
          {invoice.buyer_address && <p className="text-sm text-gray-700">{invoice.buyer_address}</p>}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-gray-100 border-y border-gray-200">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Invoice Date</p>
          <p className="text-sm font-bold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
        </div>
        {invoice.po_number && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">PO Number</p>
            <p className="text-sm font-bold text-gray-900">{invoice.po_number}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Invoice Type</p>
          <p className="text-sm font-bold text-gray-900">{invoice.invoice_type}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Payment Status</p>
          <p className="text-sm font-bold text-green-700 uppercase">{invoice.payment_status}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-8">
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
            {invoice.items.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-4 text-gray-900">{item.item_name}</td>
                <td className="py-4 text-gray-700 text-sm">{item.hs_code || '-'}</td>
                <td className="py-4 text-gray-700 text-sm text-center">{item.uom}</td>
                <td className="py-4 text-gray-900 text-right">PKR {formatCurrency(parseFloat(item.unit_price.toString()))}</td>
                <td className="py-4 text-gray-900 text-right">{parseFloat(item.quantity.toString())}</td>
                <td className="py-4 text-gray-900 font-semibold text-right">PKR {formatCurrency(parseFloat(item.line_total.toString()))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals and QR Code */}
      <div className="grid grid-cols-2 gap-8 p-8 border-t-2 border-gray-200">
        <div className="flex flex-col items-center justify-center">
          {qrCodeUrl && (
            <div className="text-center">
              <img src={qrCodeUrl} alt="Invoice QR Code" className="w-40 h-40 mb-2" />
              <p className="text-xs text-gray-600">Scan for invoice verification</p>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Subtotal:</span>
            <span className="font-semibold">PKR {formatCurrency(parseFloat(invoice.subtotal.toString()))}</span>
          </div>
          {invoice.sales_tax_rate > 0 && (
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Sales Tax ({invoice.sales_tax_rate}%):</span>
              <span className="font-semibold">PKR {formatCurrency(parseFloat(invoice.sales_tax_amount.toString()))}</span>
            </div>
          )}
          {invoice.further_tax_rate > 0 && (
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Further Tax ({invoice.further_tax_rate}%):</span>
              <span className="font-semibold">PKR {formatCurrency(parseFloat(invoice.further_tax_amount.toString()))}</span>
            </div>
          )}
          <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t-2 border-blue-600">
            <span>Total Amount:</span>
            <span>PKR {formatCurrency(parseFloat(invoice.total_amount.toString()))}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="p-8 bg-gray-50 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Notes</h3>
          <p className="text-gray-700">{invoice.notes}</p>
        </div>
      )}

      <div className="p-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <p className="text-sm">Thank you for your business!</p>
        <p className="text-xs text-blue-100 mt-2">This is a computer-generated invoice and requires no signature.</p>
      </div>
    </div>
  );
}

// Classic Template Component (simplified version)
function ClassicTemplate({ invoice, company, qrCodeUrl }: any) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg border-4 border-gray-800">
      {/* Similar structure to Modern but with classic styling */}
      <div className="border-b-4 border-gray-800 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'serif' }}>INVOICE</h1>
            <div className="h-1 w-24 bg-gray-800"></div>
          </div>
          <div className="text-right">
            <img src="https://i.ibb.co/9ZQY8Kq/fbr-digital-invoice-logo.png" alt="FBR" className="h-16 mb-2 ml-auto" />
            <p className="text-sm font-semibold text-gray-700">FBR Compliant Invoice</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Invoice Number</p>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'monospace' }}>{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Invoice Date</p>
            <p className="text-xl font-bold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
      {/* Rest of classic template similar to print page */}
      <div className="p-8 text-center text-gray-600">
        <p>Classic Template Preview - Full version available in print mode</p>
      </div>
    </div>
  );
}

