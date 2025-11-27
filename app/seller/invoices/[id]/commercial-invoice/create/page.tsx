'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../../../components/SellerLayout';
import { useToast } from '../../../../../components/ToastProvider';
import CommercialInvoiceForm from '@/components/CommercialInvoiceForm';

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
  buyer_name: string;
  buyer_business_name: string;
  buyer_address: string;
  buyer_ntn_cnic: string;
  items: InvoiceItem[];
}

export default function CreateCommercialInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    setCompanyId(userData.company_id);
    loadInvoice(userData.company_id);
  }, [router, params.id]);

  const loadInvoice = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/seller/invoices/${params.id}?company_id=${companyId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
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

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      
      const response = await fetch(
        `/api/seller/invoices/${params.id}/commercial-invoice`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            ...formData
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          'Commercial Invoice Created',
          `Commercial invoice ${data.commercialInvoiceNumber} has been created successfully.`
        );
        router.push(`/seller/invoices/${params.id}/commercial-invoice/preview`);
      } else {
        toast.error('Creation Failed', data.error || 'Failed to create commercial invoice.');
      }
    } catch (error) {
      console.error('Error creating commercial invoice:', error);
      toast.error('Network Error', 'Failed to create commercial invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/seller/invoices/${params.id}`);
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

  // Prepare initial form data from original invoice
  const initialData = {
    buyer_name: invoice.buyer_name,
    buyer_business_name: invoice.buyer_business_name || '',
    buyer_address: invoice.buyer_address || '',
    buyer_country: '',
    buyer_tax_id: invoice.buyer_ntn_cnic || '',
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
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/seller/invoices/${params.id}`}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Invoice
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Commercial Invoice</h1>
            <p className="text-sm text-gray-600">
              Based on Invoice: <span className="font-semibold">{invoice.invoice_number}</span>
            </p>
          </div>
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
                Creating Commercial Invoice (Separate from FBR Invoice)
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

        {/* Info Box - Pre-filled Data */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-xl">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-semibold mb-1">
                Form Pre-filled with Original Invoice Data
              </p>
              <p className="text-sm text-blue-800">
                The form below is pre-filled with buyer information and items from invoice <strong>{invoice.invoice_number}</strong>. 
                You can edit any field as needed for your commercial invoice. All changes will be saved separately.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <CommercialInvoiceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Commercial Invoice"
          isSubmitting={submitting}
        />
      </div>
    // </SellerLayout>
  );
}
