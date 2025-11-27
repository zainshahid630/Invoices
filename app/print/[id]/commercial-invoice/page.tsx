'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';
import { 
  ModernTemplate, 
  ExcelTemplate, 
  ClassicTemplate, 
  DCTemplate, 
  CommercialLetterheadTemplate
} from '@/components/invoice-templates';

interface CommercialInvoiceItem {
  id: string;
  description: string;
  hs_code: string;
  uom: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface CommercialInvoice {
  id: string;
  commercial_invoice_number: string;
  buyer_name: string;
  buyer_business_name: string;
  buyer_address: string;
  buyer_country: string;
  buyer_tax_id: string;
  subtotal: number;
  total_amount: number;
  notes: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_type: string;
  po_number?: string;
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

export default function CommercialInvoicePrintPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();
  const template = searchParams.get('template') || 'modern';
  const [letterheadTopSpace, setLetterheadTopSpace] = useState(120); // Default 120mm
  
  const [commercialInvoice, setCommercialInvoice] = useState<CommercialInvoice | null>(null);
  const [items, setItems] = useState<CommercialInvoiceItem[]>([]);
  const [originalInvoice, setOriginalInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadCommercialInvoice();
  }, []);

  const loadCommercialInvoice = async () => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) {
        router.push('/seller/login');
        return;
      }

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      // Load commercial invoice
      const response = await fetch(
        `/api/seller/invoices/${params.id}/commercial-invoice?company_id=${companyId}`
      );

      if (!response.ok) {
        toast.error('Commercial Invoice Not Found', 'The commercial invoice could not be found.');
        router.push(`/seller/invoices/${params.id}`);
        return;
      }

      const data = await response.json();
      setCommercialInvoice(data.commercialInvoice);
      setItems(data.items);
      setOriginalInvoice(data.originalInvoice);

      // Load company details
      const companyResponse = await fetch(
        `/api/seller/settings?company_id=${companyId}`
      );
      
      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        setCompany(companyData.company);
           setLetterheadTopSpace(companyData.settings.letterhead_top_space || 120);
       
      }
    } catch (error) {
      console.error('Error loading commercial invoice:', error);
      toast.error('Loading Error', 'Failed to load commercial invoice.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || loading || !commercialInvoice || !originalInvoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading commercial invoice...</p>
        </div>
      </div>
    );
  }

  // Transform commercial invoice data to match invoice template format
  const invoiceForTemplate = {
    id: commercialInvoice.id,
    invoice_number: commercialInvoice.commercial_invoice_number,
    po_number: originalInvoice.po_number || '',
    dc_code: '',
    invoice_date: originalInvoice.invoice_date,
    invoice_type: originalInvoice.invoice_type,
    scenario: '',
    buyer_name: commercialInvoice.buyer_name,
    buyer_business_name: commercialInvoice.buyer_business_name,
    buyer_ntn_cnic: commercialInvoice.buyer_tax_id,
    buyer_address: commercialInvoice.buyer_address,
    buyer_province: commercialInvoice.buyer_country || '',
    buyer_gst_number: '',
    subtotal: commercialInvoice.subtotal,
    sales_tax_rate: 0,
    sales_tax_amount: 0,
    further_tax_rate: 0,
    further_tax_amount: 0,
    total_amount: commercialInvoice.total_amount,
    status: 'commercial',
    payment_status: '',
    notes: commercialInvoice.notes,
    created_at: commercialInvoice.created_at,
    fbr_invoice_number: '',
    items: items.map(item => ({
      id: item.id,
      item_name: item.description,
      hs_code: item.hs_code,
      uom: item.uom,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total
    }))
  };

  // Get most frequent HS Code and UOM for template
  const getMostFrequent = (arr: string[]) => {
    const frequency: { [key: string]: number } = {};
    arr.forEach(val => {
      if (val) frequency[val] = (frequency[val] || 0) + 1;
    });
    return Object.keys(frequency).reduce((a, b) =>
      frequency[a] > frequency[b] ? a : b, arr[0] || ''
    );
  };

  const hsCodes = items.map(item => item.hs_code).filter(Boolean);
  const uoms = items.map(item => item.uom).filter(Boolean);
  const commercialHsCode = hsCodes.length > 0 ? getMostFrequent(hsCodes) : '';
  const commercialUom = uoms.length > 0 ? getMostFrequent(uoms) : '';

  const templateProps = {
    invoice: invoiceForTemplate,
    company: company,
    qrCodeUrl: '', // No QR code for commercial invoice
    isCommercialInvoice: true,
    commercialHsCode: commercialHsCode,
    commercialUom: commercialUom,
  };

  return (
    <>
      {/* Hide URL and page info when printing */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
          }
          /* Hide browser's default header/footer */
          html, body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-100 print:bg-white">
        {/* Print Controls - Hidden when printing */}
        <div className="print:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Commercial Invoice Preview</h1>
            <p className="text-sm text-gray-600">
              {commercialInvoice.commercial_invoice_number} • Template: {template}
            </p>
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

        {/* Invoice Template */}
        <div className="p-8 print:p-0">
          {template === 'excel' && <ExcelTemplate {...templateProps} />}
          {template === 'classic' && <ClassicTemplate {...templateProps} />}
          {template === 'letterhead' && <CommercialLetterheadTemplate {...templateProps} letterheadTopSpace={letterheadTopSpace} letterheadShowQr={false} />}
          {template === 'dc' && <DCTemplate {...templateProps} />}
          {(template === 'modern' || !template) && <ModernTemplate {...templateProps} />}
        </div>
      </div>
    </>
  );
}
