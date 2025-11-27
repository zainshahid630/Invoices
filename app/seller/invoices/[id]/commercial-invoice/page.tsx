'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useToast } from '../../../../components/ToastProvider';
import { FBR_UOMS } from '@/lib/fbr-reference-data';
import { 
  ModernTemplate, 
  ExcelTemplate, 
  ClassicTemplate, 
  LetterheadTemplate,
  DCTemplate 
} from '@/components/invoice-templates';

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
  invoice_date: string;
  invoice_type: string;
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
  po_number: string;
  notes: string;
  items: InvoiceItem[];
  scenario: string;
  buyer_gst_number: string;
  status: string;
  payment_status: string;
  created_at: string;
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
}

export default function CommercialInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
  // Commercial Invoice specific states
  const [selectedHsCode, setSelectedHsCode] = useState('');
  const [selectedUom, setSelectedUom] = useState('');
  const [customHsCode, setCustomHsCode] = useState('');
  const [customUom, setCustomUom] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    setCompanyId(userData.company_id);
    
    const template = searchParams.get('template') || 'modern';
    setSelectedTemplate(template);
    
    loadInvoice(userData.company_id);
    loadCompany(userData.company_id);
  }, [router, params.id, searchParams]);

  const loadInvoice = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/seller/invoices/${params.id}?company_id=${companyId}`
      );
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
        
        // Auto-select most common HS code and UOM
        if (data.items && data.items.length > 0) {
          const hsCodes = data.items.map((item: InvoiceItem) => item.hs_code).filter(Boolean);
          const uoms = data.items.map((item: InvoiceItem) => item.uom).filter(Boolean);
          
          if (hsCodes.length > 0) {
            setSelectedHsCode(getMostFrequent(hsCodes));
          }
          if (uoms.length > 0) {
            setSelectedUom(getMostFrequent(uoms));
          }
        }
      } else {
        toast.error('Invoice Not Found', 'The requested invoice could not be found.');
        router.push('/seller/invoices');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Loading Error', 'Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  };

  const loadCompany = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/settings?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.company) {
          setCompany(data.company);
        }
      }
    } catch (error) {
      console.error('Error loading company:', error);
    }
  };

  const getMostFrequent = (arr: string[]) => {
    const frequency: { [key: string]: number } = {};
    arr.forEach(val => {
      if (val) frequency[val] = (frequency[val] || 0) + 1;
    });
    return Object.keys(frequency).reduce((a, b) =>
      frequency[a] > frequency[b] ? a : b, arr[0] || ''
    );
  };

  const handlePreview = () => {
    const finalHsCode = customHsCode || selectedHsCode;
    const finalUom = customUom || selectedUom;
    
    if (!finalHsCode || !finalUom) {
      toast.warning('Missing Information', 'Please select or enter HS Code and UOM');
      return;
    }
    
    setShowPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading Commercial Invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invoice or Company not found</p>
        </div>
      </div>
    );
  }

  const finalHsCode = customHsCode || selectedHsCode;
  const finalUom = customUom || selectedUom;

  // Get unique HS codes from invoice items
  const uniqueHsCodes = Array.from(new Set(invoice?.items.map(item => item.hs_code).filter(Boolean) || []));

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Header - Hidden when printing */}
      <div className="print:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Commercial Invoice</h1>
            <p className="text-sm text-gray-600">Configure and print your commercial invoice</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 print:p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration (Hidden when printing) */}
          <div className="print:hidden lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Configure Commercial Invoice</h2>
              
              <div className="space-y-4">
                {/* HS Code Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HS Code <span className="text-red-500">*</span>
                  </label>
                  {uniqueHsCodes.length > 0 && (
                    <select
                      value={selectedHsCode}
                      onChange={(e) => {
                        setSelectedHsCode(e.target.value);
                        setCustomHsCode('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mb-2 text-sm"
                    >
                      <option value="">Select from invoice items...</option>
                      {uniqueHsCodes.map(hsCode => (
                        <option key={hsCode} value={hsCode}>{hsCode}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={customHsCode}
                    onChange={(e) => {
                      setCustomHsCode(e.target.value);
                      setSelectedHsCode('');
                    }}
                    placeholder="Or enter custom HS Code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                {/* UOM Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit of Measurement (UOM) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customUom || selectedUom}
                    onChange={(e) => {
                      setCustomUom(e.target.value);
                      setSelectedUom(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="">Select UOM...</option>
                    {FBR_UOMS.map(uom => (
                      <option key={uom.uoM_ID} value={uom.description}>
                        {uom.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    ℹ️ <strong>Note:</strong> This information will only be used for this print and will not be saved to the invoice.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  {!showPreview ? (
                    <button
                      onClick={handlePreview}
                      disabled={!finalHsCode || !finalUom}
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      👁️ Preview Invoice
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handlePrint}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                      >
                        🖨️ Print Commercial Invoice
                      </button>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                      >
                        ← Back to Edit
                      </button>
                    </>
                  )}
                </div>

                {/* Current Selection Display */}
                {(finalHsCode || finalUom) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <h3 className="text-xs font-semibold text-green-900 mb-2">Current Selection:</h3>
                    <div className="space-y-1 text-xs text-green-800">
                      {finalHsCode && <p><strong>HS Code:</strong> {finalHsCode}</p>}
                      {finalUom && <p><strong>UOM:</strong> {finalUom}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Invoice Preview */}
          <div className="lg:col-span-2 print:col-span-3">
            {showPreview && finalHsCode && finalUom ? (
              <div className="bg-white rounded-lg shadow-lg print:shadow-none print:rounded-none">
                {renderTemplate()}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Preview</h3>
                  <p className="text-gray-600 mb-6">
                    Select HS Code and UOM from the left panel, then click &quot;Preview Invoice&quot; to see your commercial invoice.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-800">
                      <strong>Commercial Invoice</strong> is designed for international trade and customs purposes. It will not include FBR data or QR codes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function renderTemplate() {
    const templateProps = {
      invoice: invoice!,
      company: company!,
      qrCodeUrl: '', // No QR code for commercial invoice
      isCommercialInvoice: true,
      commercialHsCode: finalHsCode,
      commercialUom: finalUom,
    };

    switch (selectedTemplate) {
      case 'excel':
        return <ExcelTemplate {...templateProps} />;
      case 'classic':
        return <ClassicTemplate {...templateProps} />;
      case 'letterhead':
        return <LetterheadTemplate {...templateProps} letterheadTopSpace={120} letterheadShowQr={false} />;
      case 'dc':
        return <DCTemplate {...templateProps} />;
      case 'modern':
      default:
        return <ModernTemplate {...templateProps} />;
    }
  }
}


