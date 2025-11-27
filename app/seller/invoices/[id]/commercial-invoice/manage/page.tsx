'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../../../components/SellerLayout';
import { useToast } from '../../../../../components/ToastProvider';
import CommercialInvoiceForm from '@/components/CommercialInvoiceForm';
import { FBR_UOMS } from '@/lib/fbr-reference-data';

interface InvoiceItem {
  id: string;
  item_name: string;
  hs_code: string;
  uom: string;
  unit_price: number;
  quantity: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_type: string;
  buyer_name: string;
  buyer_business_name: string;
  buyer_address: string;
  buyer_ntn_cnic: string;
  buyer_province: string;
  items: InvoiceItem[];
}

interface CommercialInvoice {
  id: string;
  commercial_invoice_number: string;
  buyer_name: string;
  buyer_business_name: string;
  buyer_address: string;
  buyer_country: string;
  buyer_tax_id: string;
  notes: string;
}

interface CommercialInvoiceItem {
  id: string;
  description: string;
  hs_code: string;
  uom: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  original_item_id: string;
}

export default function ManageCommercialInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [commercialInvoice, setCommercialInvoice] = useState<CommercialInvoice | null>(null);
  const [commercialItems, setCommercialItems] = useState<CommercialInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [globalHsCode, setGlobalHsCode] = useState('');
  const [globalUom, setGlobalUom] = useState('Pcs');

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    setCompanyId(userData.company_id);
    loadData(userData.company_id);
    loadSettings(userData.company_id);
  }, [router, params.id]);

  const loadSettings = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/settings?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTemplate(data.settings?.invoice_template || 'modern');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadData = async (companyId: string) => {
    try {
      setLoading(true);
      
      // Load original invoice
      const invoiceResponse = await fetch(
        `/api/seller/invoices/${params.id}?company_id=${companyId}`
      );
      
      if (!invoiceResponse.ok) {
        toast.error('Invoice Not Found', 'The requested invoice could not be found.');
        router.push('/seller/invoices');
        return;
      }

      const invoiceData = await invoiceResponse.json();
      setInvoice(invoiceData);

      // Try to load existing commercial invoice
      const commercialResponse = await fetch(
        `/api/seller/invoices/${params.id}/commercial-invoice?company_id=${companyId}`
      );

      if (commercialResponse.ok) {
        const commercialData = await commercialResponse.json();
        setCommercialInvoice(commercialData.commercialInvoice);
        setCommercialItems(commercialData.items);
        setIsEditMode(true);
        
        // Set global HS Code and UOM from first item if available
        if (commercialData.items.length > 0) {
          setGlobalHsCode(commercialData.items[0].hs_code || '');
          setGlobalUom(commercialData.items[0].uom || 'Pcs');
        }
      } else {
        // No commercial invoice exists yet - use invoice data
        setIsEditMode(false);
        if (invoiceData.items.length > 0) {
          setGlobalHsCode(invoiceData.items[0].hs_code || '');
          setGlobalUom(invoiceData.items[0].uom || 'Pcs');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Loading Error', 'Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      
      // Apply global HS Code and UOM to all items
      const itemsWithGlobalFields = formData.items.map((item: any) => ({
        ...item,
        hs_code: globalHsCode,
        uom: globalUom
      }));
      
      // Use invoice buyer data and hardcode Pakistan
      const dataToSubmit = {
        company_id: companyId,
        buyer_name: invoice!.buyer_name,
        buyer_business_name: invoice!.buyer_business_name || '',
        buyer_address: invoice!.buyer_address || '',
        buyer_country: 'Pakistan', // Hardcoded
        buyer_tax_id: invoice!.buyer_ntn_cnic || '',
        items: itemsWithGlobalFields,
        notes: formData.notes
      };
      
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch(
        `/api/seller/invoices/${params.id}/commercial-invoice`,
        {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSubmit)
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (isEditMode) {
          toast.success(
            'Commercial Invoice Updated',
            'Commercial invoice has been updated successfully.'
          );
        } else {
          toast.success(
            'Commercial Invoice Created',
            `Commercial invoice ${data.commercialInvoiceNumber} has been created successfully.`
          );
        }
        
        // Reload data to get updated information
        await loadData(companyId);
      } else {
        toast.error(
          isEditMode ? 'Update Failed' : 'Creation Failed', 
          data.error || `Failed to ${isEditMode ? 'update' : 'create'} commercial invoice.`
        );
      }
    } catch (error) {
      console.error('Error saving commercial invoice:', error);
      toast.error('Network Error', `Failed to ${isEditMode ? 'update' : 'create'} commercial invoice.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/seller/invoices/${params.id}`);
  };

  const handlePreview = () => {
    // Navigate to preview page in same tab
    router.push(`/print/${params.id}/commercial-invoice?template=${selectedTemplate}`);
  };

  if (loading) {
    return (
      // <SellerLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      // </SellerLayout>
    );
  }

  if (!invoice) {
    return (
      // <SellerLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Invoice not found</p>
          </div>
        </div>
      // </SellerLayout>
    );
  }

  // Prepare initial form data (only items and notes - buyer info comes from invoice)
  const initialData = isEditMode && commercialInvoice ? {
    // Use commercial invoice data if editing
    buyer_name: '', // Not used in form
    buyer_business_name: '', // Not used in form
    buyer_address: '', // Not used in form
    buyer_country: '', // Not used in form
    buyer_tax_id: '', // Not used in form
    items: commercialItems.map(item => ({
      id: item.id,
      description: item.description,
      hs_code: item.hs_code,
      uom: item.uom,
      quantity: parseFloat(item.quantity.toString()),
      unit_price: parseFloat(item.unit_price.toString()),
      line_total: parseFloat(item.line_total.toString()),
      original_item_id: item.original_item_id
    })),
    notes: commercialInvoice.notes || ''
  } : {
    // Use original invoice items if creating
    buyer_name: '', // Not used in form
    buyer_business_name: '', // Not used in form
    buyer_address: '', // Not used in form
    buyer_country: '', // Not used in form
    buyer_tax_id: '', // Not used in form
    items: invoice.items.map(item => ({
      description: item.item_name,
      hs_code: item.hs_code || '',
      uom: item.uom || 'Pcs',
      quantity: parseFloat(item.quantity.toString()),
      unit_price: parseFloat(item.unit_price.toString()),
      line_total: parseFloat(item.quantity.toString()) * parseFloat(item.unit_price.toString()),
      original_item_id: item.id
    })),
    notes: ''
  };

  return (
    // <SellerLayout>
      <div className="p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/seller/invoices/${params.id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Invoice
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit' : 'Create'} Commercial Invoice
              </h1>
              <p className="text-sm text-gray-600">
                Based on Invoice: <span className="font-semibold">{invoice.invoice_number}</span>
                {isEditMode && commercialInvoice && (
                  <span className="ml-2 text-purple-600">
                    • Commercial Invoice: <span className="font-semibold">{commercialInvoice.commercial_invoice_number}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Preview Button - Only show if commercial invoice exists */}
          {isEditMode && (
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
            >
              👁️ Preview & Print
            </button>
          )}
        </div>

        {/* Important Notice */}
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">📄</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900 mb-2">
                {isEditMode ? 'Editing' : 'Creating'} Commercial Invoice (Separate from FBR Invoice)
              </h3>
              <div className="space-y-2 text-sm text-purple-800">
                <p>
                  <strong>This is a Commercial Invoice</strong> - designed for international trade, customs, and export purposes.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Separate Entity:</strong> This commercial invoice is completely separate from your FBR invoice</li>
                  <li><strong>Editable Data:</strong> You can modify all fields including descriptions, HS codes, UOMs, quantities, and prices</li>
                  <li><strong>No FBR Submission:</strong> This invoice will NOT be sent to FBR and will NOT include FBR data or QR codes</li>
                  <li><strong>Original Unchanged:</strong> Your original invoice remains intact and unaffected</li>
                  <li><strong>Saved Separately:</strong> All changes are saved to a separate commercial invoice record</li>
                </ul>
                <p className="mt-3 font-semibold">
                  ✓ Use this for customs documentation, export paperwork, and international trade
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details with Editable HS Code & UOM */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
          
          {/* Editable HS Code and UOM - Applies to all items */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-purple-900 mb-3">
              📝 Commercial Invoice Fields (Applies to all items)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HS Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={globalHsCode}
                  onChange={(e) => setGlobalHsCode(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  placeholder="Enter HS Code for all items"
                  required
                />
                <p className="text-xs text-purple-600 mt-1">This HS Code will be applied to all items</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UOM (Unit of Measurement) <span className="text-red-500">*</span>
                </label>
                <select
                  value={globalUom}
                  onChange={(e) => setGlobalUom(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  required
                >
                  {FBR_UOMS.map(uom => (
                    <option key={uom.uoM_ID} value={uom.description}>
                      {uom.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-purple-600 mt-1">This UOM will be applied to all items</p>
              </div>
            </div>
          </div>

          {/* Read-only invoice details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoice.invoice_number}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date
              </label>
              <input
                type="text"
                value={new Date(invoice.invoice_date || '').toLocaleDateString()}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Type
              </label>
              <input
                type="text"
                value={invoice.invoice_type || 'N/A'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Customer Details (Read-Only) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details (Read-Only)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buyer Name
              </label>
              <input
                type="text"
                value={invoice.buyer_name}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={invoice.buyer_business_name || 'N/A'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NTN/CNIC
              </label>
              <input
                type="text"
                value={invoice.buyer_ntn_cnic || 'N/A'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              <input
                type="text"
                value={invoice.buyer_province || 'N/A'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={invoice.buyer_address || 'N/A'}
                disabled
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Info Box - Editable Commercial Invoice Data */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-xl">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-semibold mb-1">
                {isEditMode ? 'Editing Commercial Invoice Items' : 'Creating Commercial Invoice'}
              </p>
              <p className="text-sm text-blue-800">
                {isEditMode ? (
                  <>
                    You are editing commercial invoice <strong>{commercialInvoice?.commercial_invoice_number}</strong>. 
                    The <strong>HS Code and UOM</strong> (set above) will apply to all items. 
                    Edit item descriptions, quantities, and prices below. Buyer information is from the original invoice and country is Pakistan.
                  </>
                ) : (
                  <>
                    Items are pre-filled from invoice <strong>{invoice.invoice_number}</strong>. 
                    The <strong>HS Code and UOM</strong> (set above) will apply to all items. 
                    Edit item descriptions, quantities, and prices as needed. Buyer information will be from the original invoice and country will be Pakistan.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Editable Commercial Invoice Form */}
        <CommercialInvoiceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isEditMode ? 'Update Commercial Invoice' : 'Create Commercial Invoice'}
          isSubmitting={submitting}
        />
      </div>
    // </SellerLayout>
  );
}
