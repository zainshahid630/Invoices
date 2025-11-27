'use client';

import { 
  ModernTemplate, 
  ExcelTemplate, 
  ClassicTemplate, 
  LetterheadTemplate,
  DCTemplate,
  CommercialLetterheadTemplate
} from '@/components/invoice-templates';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Sample invoice data for preview
const sampleInvoice = {
  "id": "sample-id",
  "invoice_number": "INV-2025-00001",
  "po_number": "PO-2025-001",
  "dc_code": "DC-638",
  "invoice_date": "2025-01-15",
  "invoice_type": "Sales Tax Invoice",
  "scenario": "B2B",
  "buyer_name": "ABC Corporation",
  "buyer_business_name": "ABC Corp (Pvt) Ltd",
  "buyer_ntn_cnic": "1234567-8",
  "buyer_address": "123 Business Street, Karachi",
  "buyer_province": "Sindh",
  "subtotal": 100000,
  "sales_tax_rate": 18,
  "sales_tax_amount": 18000,
  "further_tax_rate": 3,
  "further_tax_amount": 3000,
  "total_amount": 121000,
  "buyer_gst_number": "GST-123456",
  "status": "fbr_posted",
  "payment_status": "paid",
  "notes": "Thank you for your business. Payment terms: Net 30 days.",
  "created_at": "2025-01-15T10:00:00Z",
  "fbr_invoice_number": "FBR-2025-00001",
  "items": [
    {
      "id": "1",
      "item_name": "Professional Services - Web Development",
      "hs_code": "854232",
      "uom": "Hours",
      "unit_price": 5000,
      "quantity": 10,
      "line_total": 50000
    },
    {
      "id": "2",
      "item_name": "Cloud Hosting Services",
      "hs_code": "854233",
      "uom": "Month",
      "unit_price": 25000,
      "quantity": 2,
      "line_total": 50000
    }
  ]
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
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const template = searchParams.get('template') || 'modern';
  const invoiceId = searchParams.get('id');

  useEffect(() => {
    setMounted(true);
    
    // If invoice ID is provided, fetch real data
    if (invoiceId) {
      fetchInvoiceData(invoiceId);
    } else {
      // Use sample data for preview
      setInvoice(sampleInvoice);
      setCompany(sampleCompany);
      setLoading(false);
    }
  }, [invoiceId]);

  const fetchInvoiceData = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/invoice/${id}`);
      
      if (!response.ok) {
        throw new Error('Invoice not found');
      }
      
      const data = await response.json();
      setInvoice(data.invoice);
      setCompany(data.company);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            The invoice you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  // Use fetched data or sample data
  const displayInvoice = invoice || sampleInvoice;
  const displayCompany = company || sampleCompany;

  // Generate QR code
  const qrData = `Invoice: ${displayInvoice.invoice_number}\nDate: ${displayInvoice.invoice_date}\nAmount: PKR ${displayInvoice.total_amount}\nBuyer: ${displayInvoice.buyer_name}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="min-h-screen bg-gray-100 p-8" suppressHydrationWarning>
      {!invoiceId && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Preview Mode:</strong> This is a sample invoice with dummy data for template preview purposes.
            </p>
          </div>
        </div>
      )}

      {invoiceId && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>📄 Public Invoice View:</strong> This invoice is shared publicly. Anyone with this link can view it.
            </p>
          </div>
        </div>
      )}

      {(() => {
        switch (template) {
          case 'modern':
            return <ModernTemplate invoice={displayInvoice} company={displayCompany} qrCodeUrl={qrCodeUrl} />;
          case 'classic':
            return <ClassicTemplate invoice={displayInvoice} company={displayCompany} qrCodeUrl={qrCodeUrl} />;
          case 'excel':
            return <ExcelTemplate invoice={displayInvoice} company={displayCompany} qrCodeUrl={qrCodeUrl} />;
          case 'letterhead':
            return <LetterheadTemplate 
              invoice={displayInvoice} 
              company={displayCompany} 
              qrCodeUrl={qrCodeUrl}
              topSpace={120}
              showQr={true}
            />;
          case 'commercial-letterhead':
            return <CommercialLetterheadTemplate 
              invoice={displayInvoice} 
              company={displayCompany} 
              qrCodeUrl={qrCodeUrl}
              topSpace={120}
              showQr={false}
            />;
          case 'dc':
            return <DCTemplate invoice={displayInvoice} company={displayCompany} qrCodeUrl={qrCodeUrl} />;
          default:
            return (
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
            );
        }
      })()}
    </div>
  );
}
