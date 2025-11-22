'use client';

/**
 * Example: Invoice Creation Page with Combined Init Data
 * 
 * BEFORE: 3-4 separate API calls on page load
 * AFTER: 1 optimized API call with all data
 */

import { useState, useEffect } from 'react';
import { useInvoiceInitData } from '@/hooks/useInvoiceInitData';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { useRouter } from 'next/navigation';

export default function InvoiceCreationPage() {
  const router = useRouter();

  // Get company ID
  const session = JSON.parse(localStorage.getItem('seller_session') || '{}');
  const companyId = session.company_id;

  // Single API call for all initialization data
  const { data: initData, isLoading } = useInvoiceInitData(companyId);

  // Mutation for creating invoice
  const createInvoice = useCreateInvoice();

  // Form state
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    customer_id: '',
    buyer_name: '',
    sales_tax_rate: '18',
    items: [],
  });

  // Set initial data when loaded
  useEffect(() => {
    if (initData) {
      setFormData(prev => ({
        ...prev,
        invoice_number: initData.nextInvoiceNumber,
        sales_tax_rate: initData.defaultSalesTaxRate.toString(),
      }));

      console.log('✅ All initial data loaded in single request');
    }
  }, [initData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createInvoice.mutate(
      { ...formData, company_id: companyId },
      {
        onSuccess: (invoice) => {
          router.push(`/seller/invoices/${invoice.id}`);
        },
        onError: (error) => {
          alert(error.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return <div>Invoice Creation Form</div>;
}
