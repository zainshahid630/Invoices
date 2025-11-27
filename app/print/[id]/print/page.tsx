'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
  po_number: string;
  invoice_date: string;
  invoice_type: string;
  scenario: string;
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
  buyer_gst_number:string;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  fbr_invoice_number?: string;
  items: InvoiceItem[];
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

export default function InvoicePrintPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || 'modern';
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [letterheadTopSpace, setLetterheadTopSpace] = useState(120); // Default 120mm
  const [letterheadShowQr, setLetterheadShowQr] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, []);

  useEffect(() => {
    if (invoice) {
      // Generate QR code URL that links to public verification page
      const verificationUrl = `${window.location.origin}/verify/${invoice.id}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;
      setQrCodeUrl(qrUrl);

      // Auto-print if requested (for bulk printing)
      const autoprint = searchParams.get('autoprint');
      if (autoprint === 'true') {
        setTimeout(() => {
          window.print();
        }, 1500);
      }
    }
  }, [invoice]);

  const loadInvoice = async () => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) {
        router.push('/seller/login');
        return;
      }

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      // Check if this is bulk print mode
      const isBulk = searchParams.get('bulk') === 'true';
      const bulkIds = searchParams.get('ids')?.split(',') || [];

      if (isBulk && bulkIds.length > 1) {
        // Bulk mode: Load all invoices
        // For now, just load the single invoice
        // TODO: Implement multi-invoice loading
        console.log('Bulk print mode with IDs:', bulkIds);
      }

      // Load invoice
      const invoiceResponse = await fetch(
        `/api/seller/invoices/${params.id}?company_id=${companyId}`
      );
      const invoiceData = await invoiceResponse.json();

      if (invoiceResponse.ok) {
        setInvoice(invoiceData);
      }

      // Load company details and settings
      const companyResponse = await fetch(
        `/api/seller/settings?company_id=${companyId}`
      );
      const companyData = await companyResponse.json();

      if (companyResponse.ok && companyData.company) {
        setCompany(companyData.company);
        
        // Load letterhead settings
        if (companyData.settings) {
          setLetterheadTopSpace(companyData.settings.letterhead_top_space || 120);
          setLetterheadShowQr(companyData.settings.letterhead_show_qr !== false);
        }
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <div>Loading invoice...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm;
            height: 297mm;
            overflow: hidden;
          }
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:min-h-0 {
            min-height: 0 !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          
          /* Force invoice to fit A4 page - single page only */
          .invoice-container {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            display: flex !important;
            flex-direction: column !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            position: relative !important;
          }
          
          .invoice-content-wrapper {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          
          .invoice-qr-footer {
            margin-top: auto !important;
            flex-shrink: 0 !important;
            page-break-inside: avoid !important;
          }
          
          /* Dynamic scaling based on item count */
          ${invoice && invoice.items.length > 10 ? `
            .invoice-container {
              transform: scale(${Math.max(0.75, 1 - (invoice.items.length - 10) * 0.02)}) !important;
              transform-origin: top center !important;
            }
          ` : ''}
          
          /* Compact mode for many items */
          ${invoice && invoice.items.length > 12 ? `
            .invoice-header { padding: 8px !important; }
            .invoice-section { padding: 6px !important; }
            .invoice-table td, .invoice-table th { padding: 3px !important; font-size: 9px !important; line-height: 1.2 !important; }
            .invoice-totals { padding: 6px !important; }
            .invoice-footer { padding: 6px !important; }
            .qr-code-section img { width: 60px !important; height: 60px !important; }
          ` : ''}
          
          /* Extra compact for Excel template with many items */
          ${invoice && invoice.items.length > 15 && template === 'excel' ? `
            .invoice-container {
              font-size: 10px !important;
              transform: scale(${Math.max(0.7, 1 - (invoice.items.length - 15) * 0.015)}) !important;
            }
            table { font-size: 9px !important; }
            .invoice-qr-footer { padding: 4px !important; }
            .invoice-qr-footer img { width: 50px !important; height: 50px !important; }
          ` : ''}
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:min-h-0 print:bg-white print:h-auto print:overflow-visible">
        {/* Action Bar - Hidden on print and when embedded */}
        {searchParams.get('embedded') !== 'true' && (
          <div className="max-w-4xl mx-auto mb-6 print:hidden">
            <div className="bg-white rounded-lg shadow-lg p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
                <p className="text-sm text-gray-600">Review your invoice before printing</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/seller/invoices/${params.id}`)}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold flex items-center gap-2"
                >
                  ← Back
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 shadow-lg"
                >
                  🖨️ Print Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Template */}
        <div className="print:block">
          {template === 'modern' ? (
            <ModernTemplate invoice={invoice} company={company} qrCodeUrl={qrCodeUrl} />
          ) : template === 'excel' ? (
            <ExcelTemplate invoice={invoice} company={company} qrCodeUrl={qrCodeUrl} />
          ) : template === 'dc' ? (
            <DCTemplate invoice={invoice} company={company} qrCodeUrl={qrCodeUrl} />
          ) : template === 'letterhead' ? (
            <LetterheadTemplate 
              invoice={invoice} 
              company={company} 
              qrCodeUrl={qrCodeUrl}
              topSpace={letterheadTopSpace}
              showQr={letterheadShowQr}
            />
          ) : (
            <ClassicTemplate invoice={invoice} company={company} qrCodeUrl={qrCodeUrl} />
          )}
        </div>
      </div>
    </>
  );
}



// Modern Template Component
// function ModernTemplate({ invoice, company, qrCodeUrl }: { invoice: Invoice; company: Company | null; qrCodeUrl: string }) {
//   const itemCount = invoice.items.length;
//   const isCompact = itemCount > 12;
  
//   return (
//     <div className={`max-w-4xl mx-auto bg-white shadow-lg print:shadow-none invoice-container ${isCompact ? 'compact-mode' : ''}`}>
//       <div className="invoice-content-wrapper">
//         {/* Header with Blue Accent */}
//         <div className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white invoice-header ${isCompact ? 'p-4' : 'p-8'}`}>
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
//             <p className="text-blue-100 text-lg">{invoice.invoice_number}</p>
//           </div>
//           <div className="text-right">
//             {company?.logo_url ? (
//               <img
//                 src={company.logo_url}
//                 alt={company.business_name || company.name}
//                 className="h-16 mb-2 ml-auto object-contain"
//               />
//             ) : null}
//             <p className="text-sm text-blue-100 font-semibold">
//               {company?.business_name || company?.name || 'Business Name'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Company and Buyer Info */}
//       <div className={`grid grid-cols-2 gap-8 border-b-2 border-gray-200 invoice-section ${isCompact ? 'p-4 gap-4' : 'p-8'}`}>
//         {/* From */}
//         <div>
//           <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">From</h2>
//           <div className="space-y-1">
//             <p className="text-xl font-bold text-gray-900">{company?.business_name || company?.name || 'Your Company'}</p>
//             {company?.address && <p className="text-gray-700">{company.address}</p>}
//             {company?.ntn_number && <p className="text-gray-700">NTN: {company.ntn_number}</p>}
//             {company?.gst_number && <p className="text-gray-700">GST: {company.gst_number}</p>}
//             {company?.phone && <p className="text-gray-700">Phone: {company.phone}</p>}
//             {company?.email && <p className="text-gray-700">Email: {company.email}</p>}
//           </div>
//         </div>

//         {/* To */}
//         <div>
//           <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Bill To</h2>
//           <div className="space-y-1">
//             <p className="text-xl font-bold text-gray-900">{invoice.buyer_name}</p>
//             {invoice.buyer_business_name && <p className="text-gray-700">{invoice.buyer_business_name}</p>}
//             {invoice.buyer_ntn_cnic && <p className="text-gray-700">NTN/CNIC: {invoice.buyer_ntn_cnic}</p>}
//             {invoice.buyer_province && <p className="text-gray-700">Province: {invoice.buyer_province}</p>}
//             {invoice.buyer_address && <p className="text-gray-700">{invoice.buyer_address}</p>}
//           </div>
//         </div>
//       </div>

//       {/* Invoice Details */}
//       <div className={`grid ${invoice.fbr_invoice_number && invoice.status === 'fbr_posted' ? 'grid-cols-5' : 'grid-cols-4'} gap-4 bg-gray-50 border-b border-gray-200 invoice-section ${isCompact ? 'p-3' : 'p-8'}`}>
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase">Invoice Date</p>
//           <p className="text-sm font-bold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
//         </div>
//         {invoice.po_number && (
//           <div>
//             <p className="text-xs font-semibold text-gray-500 uppercase">PO Number</p>
//             <p className="text-sm font-bold text-gray-900">{invoice.po_number}</p>
//           </div>
//         )}
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase">Invoice Type</p>
//           <p className="text-sm font-bold text-gray-900">{invoice.invoice_type}</p>
//         </div>
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase">Payment Status</p>
//           <p className="text-sm font-bold text-green-600 uppercase">{invoice.payment_status}</p>
//         </div>
//         {invoice.fbr_invoice_number && invoice.status === 'fbr_posted' && (
//           <div>
//             <p className="text-xs font-semibold text-gray-500 uppercase">FBR Invoice #</p>
//             <p className="text-sm font-bold text-blue-600">{invoice.fbr_invoice_number}</p>
//           </div>
//         )}
//       </div>

//       {/* Items Table */}
//       <div className={`invoice-section ${isCompact ? 'p-3' : 'p-8'}`}>
//         <table className="w-full invoice-table">
//           <thead>
//             <tr className="border-b-2 border-gray-300">
//               <th className="text-left py-3 text-xs font-bold text-gray-700 uppercase">Item Description</th>
//               <th className="text-left py-3 text-xs font-bold text-gray-700 uppercase">HS Code</th>
//               <th className="text-center py-3 text-xs font-bold text-gray-700 uppercase">UOM</th>
//               <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Unit Price</th>
//               <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Qty</th>
//               <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.items.map((item, index) => (
//               <tr key={item.id} className="border-b border-gray-200">
//                 <td className="py-4 text-gray-900">{item.item_name}</td>
//                 <td className="py-4 text-gray-700 text-sm">{item.hs_code || '-'}</td>
//                 <td className="py-4 text-gray-700 text-sm text-center">{item.uom}</td>
//                 <td className="py-4 text-gray-900 text-right">PKR {parseFloat(item.unit_price.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
//                 <td className="py-4 text-gray-900 text-right">{parseFloat(item.quantity.toString())}</td>
//                 <td className="py-4 text-gray-900 font-semibold text-right">PKR {parseFloat(item.line_total.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       </div>
      
//       {/* Totals and QR Code - Always at bottom */}
//       <div className={`grid grid-cols-2 gap-8 border-t-2 border-gray-200 invoice-totals invoice-qr-footer ${isCompact ? 'p-4' : 'p-8'}`}>
//         {/* QR Code - Only show if FBR Posted or later */}
//         <div className="flex items-center justify-center qr-code-section">
//           {qrCodeUrl && (invoice.status === 'fbr_posted' || invoice.status === 'verified' || invoice.status === 'paid') && (
//             <div className="flex items-center gap-6">
//               <div className="text-center">
//                 <img src={qrCodeUrl} alt="Invoice QR Code" className="w-40 h-40 mb-2" />
//                 <p className="text-xs text-gray-600">Scan for invoice verification</p>
//               </div>
//               <div className="text-center">
//                 <img
//                   src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfNBZnQll2YCxZiYxluZPBoEmfHhoyxLJblQ&s"
//                   alt="FBR Digital Invoice"
//                   className="w-40 h-40 object-contain mb-2"
//                 />
//                 <p className="text-xs text-gray-600">FBR Digital Invoice</p>
//               </div>
//             </div>
//           )}
//           {invoice.status === 'draft' && (
//             <div className="text-center text-gray-400">
//               <div className="w-40 h-40 border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
//                 <p className="text-xs">QR Code</p>
//               </div>
//               <p className="text-xs">Available after FBR posting</p>
//             </div>
//           )}
//         </div>

//         {/* Totals */}
//         <div className="space-y-3">
//           <div className="flex justify-between text-gray-700">
//             <span className="font-medium">Subtotal:</span>
//             <span className="font-semibold">PKR {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
//           </div>
//           {invoice.sales_tax_rate > 0 && (
//             <div className="flex justify-between text-gray-700">
//               <span className="font-medium">Sales Tax ({invoice.sales_tax_rate}%):</span>
//               <span className="font-semibold">PKR {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
//             </div>
//           )}
//           {invoice.further_tax_rate > 0 && (
//             <div className="flex justify-between text-gray-700">
//               <span className="font-medium">Further Tax ({invoice.further_tax_rate}%):</span>
//               <span className="font-semibold">PKR {parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
//             </div>
//           )}
//           <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t-2 border-blue-600">
//             <span>Total Amount:</span>
//             <span>PKR {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
//           </div>
//         </div>
//       </div>

//       {/* Notes */}
//       {invoice.notes && (
//         <div className={`bg-gray-50 border-t border-gray-200 invoice-section ${isCompact ? 'p-3' : 'p-8'}`}>
//           <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Notes</h3>
//           <p className="text-gray-700">{invoice.notes}</p>
//         </div>
//       )}

//       {/* Footer */}
//       <div className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center invoice-footer ${isCompact ? 'p-3' : 'p-8'}`}>
//         <p className="text-sm">Thank you for your business!</p>
//         <p className="text-xs text-blue-100 mt-2">This is a computer-generated invoice and requires no signature.</p>
//       </div>
//     </div>
//   );
// }

// Excel Template Component - Simple spreadsheet style optimized for B&W printing
// function ExcelTemplate({ invoice, company, qrCodeUrl }: { invoice: Invoice; company: Company | null; qrCodeUrl: string }) {
//   const getMostFrequent = (arr: string[]) => {
//     const freq: Record<string, number> = {};
//     let maxCount = 0;
//     let mostFreq = "";
//     arr.forEach(val => {
//       if (!val) return;
//       freq[val] = (freq[val] || 0) + 1;
//       if (freq[val] > maxCount) {
//         maxCount = freq[val];
//         mostFreq = val;
//       }
//     });
//     return mostFreq || "-";
//   };

//   const mostHSCode = getMostFrequent(invoice.items.map(item => item.hs_code || ""));

//   const itemCount = invoice.items.length;
//   const isCompact = itemCount > 12;
  
//   return (
//     <div className={`max-w-3xl mx-auto bg-white shadow-lg print:shadow-none text-[12px] leading-tight invoice-container ${isCompact ? 'compact-mode' : ''}`}>
//       <div className="invoice-content-wrapper">
//         {/* HEADER */}
//         <div className="border-b-2 border-black p-4">
//         <div className="flex justify-between items-start">
//           <h1 className="text-2xl font-bold">SALES TAX INVOICE</h1>

//           <div className="text-right">
//             {company?.logo_url && (
//               <img
//                 src={company.logo_url}
//                 className="w-20 h-20 object-contain ml-auto mb-1"
//               />
//             )}
//             {/* <p className="font-semibold text-sm">
//               {company?.business_name || company?.name}
//             </p> */}
//           </div>
//         </div>

//         {/* Invoice Meta */}
//         <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
//           <div className="space-y-1">
//             <p>Invoice #: <span className="font-semibold">{invoice.invoice_number}</span></p>
//            {
//             invoice.status === 'fbr_posted' ?
//              <p>FBR Invoice No: <span className="font-semibold">{invoice.fbr_invoice_number}</span></p>
//              : <></>
//            }
           
//                       {/* <p className="text-[9px] font-semibold mt-1">{invoice.fbr_invoice_number}</p> */}
//             <p>Date: <span className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</span></p>
//             <p>PO Number: <span className="font-semibold">{invoice.po_number}</span></p>
//           </div>

//           <div className="space-y-1 text-right">
//             <p>Invoice Type: <span className="font-semibold">{invoice.invoice_type}</span></p>
//             {/* <p>Payment Status: <span className="font-semibold">{invoice.payment_status}</span></p> */}
//             <p>HS Code: <span className="font-semibold">{mostHSCode}</span></p>
//           </div>
//         </div>
//       </div>

//       {/* SELLER & BUYER */}
//       <div className="border-b border-black p-4">
//         <div className="grid grid-cols-2 gap-4 text-[12px]">

//           {/* SELLER */}
//           <div>
//             <h2 className="font-bold bg-gray-100 px-2 py-1 text-sm">SELLER</h2>
//             <div className="mt-1">
//               <p className="font-semibold">{company?.business_name || company?.name}</p>
//               {company?.address && <p>{company.address}</p>}
//               <p>
//                 {company?.ntn_number && <>NTN: {company.ntn_number}</>}
//                 {company?.gst_number && <span className="ml-3">GST: {company.gst_number}</span>}
//               </p>
//               <p>
//                 {company?.phone && <>Phone: {company.phone}</>}
//                 {company?.email && <span className="ml-3">Email: {company.email}</span>}
//               </p>
//             </div>
//           </div>

//           {/* BUYER */}
//           <div>
//             <h2 className="font-bold bg-gray-100 px-2 py-1 text-sm">BUYER</h2>
//             <div className="mt-1">
//               <p className="font-semibold">{invoice.buyer_name}</p>
//               {invoice.buyer_business_name && <p>{invoice.buyer_business_name}</p>}
//               {invoice.buyer_address && <p>{invoice.buyer_address} ,{invoice.buyer_province}</p>}
//               <p>
//                 {invoice.buyer_ntn_cnic && <>NTN: {invoice.buyer_ntn_cnic}</>}
//                 {invoice.buyer_gst_number && <span className="ml-3">GST:{invoice.buyer_gst_number} </span>}
//               </p>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* ITEMS TABLE */}
//       <div className="p-4">
//         <table className="w-full border-collapse text-[11px]">
//           <thead>
//             <tr className="bg-gray-200 border-t-2 border-b-2 border-black">
//               <th className="text-left py-1 px-2 w-[5%]">#</th>
//               <th className="text-left py-1 px-2 w-[55%]">DESCRIPTION</th>
//               <th className="text-right py-1 px-2 w-[10%]">QTY</th>
//               <th className="text-right py-1 px-2 w-[10%]">UOM</th>
//               <th className="text-right py-1 px-2 w-[10%]">RATE</th>
//               <th className="text-right py-1 px-2 w-[10%]">AMOUNT</th>
//             </tr>
//           </thead>

//           <tbody>
//             {invoice.items.map((item, i) => (
//               <tr key={item.id} className="border-b border-gray-300">
//                 <td className="py-1 px-2 text-center">{i + 1}</td>
//                 <td className="py-1 px-2">{item.item_name}</td>
//                 <td className="py-1 px-2 text-right">{item.quantity}</td>
//                 <td className="py-1 px-2 text-right">{item.uom}</td>
//                 <td className="py-1 px-2 text-right">
//                   {Number(item.unit_price).toLocaleString()}
//                 </td>
//                 <td className="py-1 px-2 text-right font-semibold">
//                   {Number(item.line_total).toLocaleString()}
//                 </td>
//               </tr>
//             ))}

//             {/* TOTALS */}
//             <tr className="">
//               <td colSpan={6} className="py-1"></td>
//             </tr>

//             <tr>
//               <td colSpan={5} className="text-right font-bold py-1 px-2">SUBTOTAL:</td>
//               <td className="text-right font-bold py-1 px-2">
//                 {Number(invoice.subtotal).toLocaleString()}
//               </td>
//             </tr>

//             {invoice.sales_tax_rate > 0 && (
//               <tr>
//                 <td colSpan={5} className="text-right py-1 px-2">
//                   Sales Tax ({invoice.sales_tax_rate}%):
//                 </td>
//                 <td className="text-right py-1 px-2">
//                   {Number(invoice.sales_tax_amount).toLocaleString()}
//                 </td>
//               </tr>
//             )}

//             {invoice.further_tax_rate > 0 && (
//               <tr>
//                 <td colSpan={5} className="text-right py-1 px-2">
//                   Further Tax ({invoice.further_tax_rate}%):
//                 </td>
//                 <td className="text-right py-1 px-2">
//                   {Number(invoice.further_tax_amount).toLocaleString()}
//                 </td>
//               </tr>
//             )}

//             <tr className="border-t-2 border-black bg-gray-200">
//               <td colSpan={5} className="text-right font-bold py-2 px-2">TOTAL:</td>
//               <td className="text-right font-bold py-2 px-2">
//                 {Number(invoice.total_amount).toLocaleString()}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* NOTES */}
//       {invoice.notes && (
//         <div className="border-t border-gray-300 p-2 bg-gray-50 text-[11px]">
//           <p className="font-bold mb-1">NOTES:</p>
//           <p>{invoice.notes}</p>
//         </div>
//       )}

//       </div>
      
//       {/* QR + SIGN - Always at bottom */}
//        {qrCodeUrl && (invoice.status === 'fbr_posted' || invoice.status === 'verified' || invoice.status === 'paid') && (
         
//       <div className="border-t-2 border-black p-2 flex justify-between items-center invoice-qr-footer">
//         <div className="flex items-center gap-3">
//           <div className="text-center">
//             <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 border" />
//             <p className="text-[9px] font-semibold mt-1">SCAN TO VERIFY</p>
//           </div>

//           <div className="text-center">
//             <img
//               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfNBZnQll2YCxZiYxluZPBoEmfHhoyxLJblQ&s"
//               alt="FBR Logo"
//               className="w-16 h-16 border object-contain grayscale"
//             />
//             <p className="text-[9px] font-semibold mt-1">FBR VERIFIED</p>
//           </div>

//                 <div className="text-center">
//                 <h1>[ORIGINAL]</h1>       
//             <p className="text-[9px] font-semibold mt-1">{invoice.fbr_invoice_number}</p>
//           </div>
//         </div>

        

//         <div className="text-right">
//           <div className="border-t border-black w-32 mb-1"></div>
//           <p className="font-bold text-[11px]">AUTHORIZED SIGNATURE</p>
//         </div>
//       </div>
//        )}

//       {/* FOOTER */}
//       <div className="text-center p-2 bg-gray-100 border-t border-black text-[10px]">
//         <p className="font-semibold">Thank you for your business!</p>
//       </div>

//     </div>
//   );
// }




// Classic Template Component
// function ClassicTemplate({ invoice, company, qrCodeUrl }: { invoice: Invoice; company: Company | null; qrCodeUrl: string }) {
//   const itemCount = invoice.items.length;
//   const isCompact = itemCount > 12;
  
//   return (
//     <div className={`max-w-4xl mx-auto bg-white shadow-lg print:shadow-none border-4 border-gray-800 invoice-container ${isCompact ? 'compact-mode' : ''}`}>
//       <div className="invoice-content-wrapper">
//         {/* Header */}
//         <div className="border-b-4 border-gray-800 p-8">
//         <div className="flex justify-between items-start mb-6">
//           <div>
//             <h1 className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'serif' }}>INVOICE</h1>
//             <div className="h-1 w-24 bg-gray-800"></div>
//           </div>
//           <div className="text-right">
//             {company?.logo_url ? (
//               <img
//                 src={company.logo_url}
//                 alt={company.business_name || company.name}
//                 className="h-16 mb-2 ml-auto object-contain"
//               />
//             ) : null}
//             <p className="text-sm font-semibold text-gray-700">
//               {company?.business_name || company?.name || 'Business Name'}
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-8">
//           <div>
//             <p className="text-sm font-bold text-gray-500 uppercase mb-1">Invoice Number</p>
//             <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'monospace' }}>{invoice.invoice_number}</p>
//           </div>
//           <div className="text-right">
//             <p className="text-sm font-bold text-gray-500 uppercase mb-1">Invoice Date</p>
//             <p className="text-xl font-bold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
//           </div>
//         </div>
//       </div>

//       {/* Company and Buyer Info */}
//       <div className="grid grid-cols-2 gap-8 p-8 border-b-2 border-gray-300">
//         {/* From */}
//         <div className="border-2 border-gray-300 p-6 bg-gray-50">
//           <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 border-b border-gray-400 pb-2">Seller Information</h2>
//           <div className="space-y-2">
//             <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'serif' }}>{company?.business_name || company?.name || 'Your Company'}</p>
//             {company?.address && <p className="text-sm text-gray-700">{company.address}</p>}
//             {company?.ntn_number && (
//               <p className="text-sm text-gray-700">
//                 <span className="font-semibold">NTN:</span> {company.ntn_number}
//               </p>
//             )}
//             {company?.gst_number && (
//               <p className="text-sm text-gray-700">
//                 <span className="font-semibold">GST:</span> {company.gst_number}
//               </p>
//             )}
//             {company?.phone && (
//               <p className="text-sm text-gray-700">
//                 <span className="font-semibold">Phone:</span> {company.phone}
//               </p>
//             )}
//             {company?.email && (
//               <p className="text-sm text-gray-700">
//                 <span className="font-semibold">Email:</span> {company.email}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* To */}
//         <div className="border-2 border-gray-300 p-6 bg-gray-50">
//           <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 border-b border-gray-400 pb-2">Buyer Information</h2>
//           <div className="space-y-2">
//             <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'serif' }}>{invoice.buyer_name}</p>
//             {invoice.buyer_business_name && <p className="text-sm text-gray-700">{invoice.buyer_business_name}</p>}
//             {invoice.buyer_ntn_cnic && (
//               <p className="text-sm text-gray-700">
//                 <span className="font-semibold">NTN/CNIC:</span> {invoice.buyer_ntn_cnic}
//               </p>
//             )}
//             {invoice.buyer_province && (
//               <p className="text-sm text-gray-700">
//                 <span className="font-semibold">Province:</span> {invoice.buyer_province}
//               </p>
//             )}
//             {invoice.buyer_address && <p className="text-sm text-gray-700">{invoice.buyer_address}</p>}
//           </div>
//         </div>
//       </div>

//       {/* Additional Details */}
//       {(invoice.po_number || invoice.invoice_type) && (
//         <div className="grid grid-cols-3 gap-4 p-6 bg-gray-100 border-b border-gray-300">
//           {invoice.po_number && (
//             <div>
//               <p className="text-xs font-bold text-gray-500 uppercase">PO Number</p>
//               <p className="text-sm font-bold text-gray-900">{invoice.po_number}</p>
//             </div>
//           )}
//           <div>
//             <p className="text-xs font-bold text-gray-500 uppercase">Invoice Type</p>
//             <p className="text-sm font-bold text-gray-900">{invoice.invoice_type}</p>
//           </div>
//           <div>
//             <p className="text-xs font-bold text-gray-500 uppercase">Payment Status</p>
//             <p className="text-sm font-bold text-green-700 uppercase">{invoice.payment_status}</p>
//           </div>
//         </div>
//       )}

//       {/* Items Table */}
//       <div className="p-8">
//         <table className="w-full border-2 border-gray-800">
//           <thead>
//             <tr className="bg-gray-800 text-white">
//               <th className="text-left py-3 px-4 text-xs font-bold uppercase">Description</th>
//               <th className="text-left py-3 px-4 text-xs font-bold uppercase">HS Code</th>
//               <th className="text-center py-3 px-4 text-xs font-bold uppercase">UOM</th>
//               <th className="text-right py-3 px-4 text-xs font-bold uppercase">Rate</th>
//               <th className="text-right py-3 px-4 text-xs font-bold uppercase">Quantity</th>
//               <th className="text-right py-3 px-4 text-xs font-bold uppercase">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.items.map((item, index) => (
//               <tr key={item.id} className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                 <td className="py-3 px-4 text-gray-900 font-medium">{item.item_name}</td>
//                 <td className="py-3 px-4 text-gray-700 text-sm">{item.hs_code || '-'}</td>
//                 <td className="py-3 px-4 text-gray-700 text-sm text-center">{item.uom}</td>
//                 <td className="py-3 px-4 text-gray-900 text-right">PKR {parseFloat(item.unit_price.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
//                 <td className="py-3 px-4 text-gray-900 text-right font-semibold">{parseFloat(item.quantity.toString())}</td>
//                 <td className="py-3 px-4 text-gray-900 font-bold text-right">PKR {parseFloat(item.line_total.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       </div>
      
//       {/* Totals and QR Code - Always at bottom */}
//       <div className="grid grid-cols-2 gap-8 p-8 border-t-4 border-gray-800 invoice-qr-footer">
//         {/* QR Code - Only show if FBR Posted or later */}
//         <div className="flex items-center justify-center border-2 border-gray-300 p-6">
//           {qrCodeUrl && (invoice.status === 'fbr_posted' || invoice.status === 'verified' || invoice.status === 'paid') && (
//             <div className="flex items-center gap-6">
//               <div className="text-center">
//                 <img src={qrCodeUrl} alt="Invoice QR Code" className="w-40 h-40 mb-3 border-2 border-gray-800" />
//                 <p className="text-xs font-semibold text-gray-700 uppercase">Scan to Verify</p>
//                 <p className="text-xs text-gray-600 mt-1">Invoice Authenticity</p>
//               </div>
//               <div className="text-center">
//                 <img
//                   src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfNBZnQll2YCxZiYxluZPBoEmfHhoyxLJblQ&s"
//                   alt="FBR Digital Invoice"
//                   className="w-40 h-40 object-contain mb-3 border-2 border-gray-800"
//                 />
//                 <p className="text-xs font-semibold text-gray-700 uppercase">FBR Digital</p>
//                 <p className="text-xs text-gray-600 mt-1">Invoice System</p>
//               </div>
//             </div>
//           )}
//           {invoice.status === 'draft' && (
//             <div className="text-center text-gray-400">
//               <div className="w-40 h-40 border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
//                 <p className="text-xs font-semibold uppercase">QR Code</p>
//               </div>
//               <p className="text-xs font-semibold uppercase">Available After</p>
//               <p className="text-xs mt-1">FBR Posting</p>
//             </div>
//           )}
//         </div>

//         {/* Totals */}
//         <div className="space-y-3 border-2 border-gray-300 p-6 bg-gray-50">
//           <div className="flex justify-between text-gray-700 pb-2 border-b border-gray-300">
//             <span className="font-semibold">Subtotal:</span>
//             <span className="font-bold">PKR {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
//           </div>
//           {invoice.sales_tax_rate > 0 && (
//             <div className="flex justify-between text-gray-700 pb-2 border-b border-gray-300">
//               <span className="font-semibold">Sales Tax ({invoice.sales_tax_rate}%):</span>
//               <span className="font-bold">PKR {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
//             </div>
//           )}
//           {invoice.further_tax_rate > 0 && (
//             <div className="flex justify-between text-gray-700 pb-2 border-b border-gray-300">
//               <span className="font-semibold">Further Tax ({invoice.further_tax_rate}%):</span>
//               <span className="font-bold">PKR {parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
//             </div>
//           )}
//           <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t-4 border-gray-800">
//             <span>TOTAL:</span>
//             <span>PKR {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
//           </div>
//         </div>
//       </div>

//       {/* Notes */}
//       {invoice.notes && (
//         <div className="p-8 border-t-2 border-gray-300 bg-gray-50">
//           <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-400 pb-2">Terms & Notes</h3>
//           <p className="text-gray-700 text-sm">{invoice.notes}</p>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="p-6 bg-gray-800 text-white text-center border-t-4 border-gray-900">
//         <p className="text-sm font-semibold">Thank you for your business!</p>
//         <p className="text-xs text-gray-300 mt-2">This is a computer-generated invoice. No signature required.</p>
//         <p className="text-xs text-gray-400 mt-1">For queries, please contact us at {company?.email || 'your-email@example.com'}</p>
//       </div>
//     </div>
//   );
// }



// Letterhead Template - For pre-printed letterhead paper
// function LetterheadTemplate({ 
//   invoice, 
//   company, 
//   qrCodeUrl,
//   topSpace = 120,
//   showQr = true 
// }: { 
//   invoice: Invoice; 
//   company: Company | null; 
//   qrCodeUrl: string;
//   topSpace?: number;
//   showQr?: boolean;
// }) {
//   return (
//     <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none invoice-container text-[11px]">
//       <div className="invoice-content-wrapper">
        
//         {/* Space for Pre-printed Letterhead - Dynamic height */}
//         <div 
//           className="border-2 border-dashed border-gray-300 print:border-none flex items-center justify-center text-gray-400 print:text-transparent"
//           style={{ height: `${topSpace}mm` }}
//         >
//           <div className="text-center">
//             <p className="text-sm font-semibold">PRE-PRINTED LETTERHEAD AREA</p>
//             <p className="text-xs mt-2">Company Name, Address, Contact Info</p>
//             <p className="text-xs">Space: {topSpace}mm (Adjust in Settings)</p>
//           </div>
//         </div>

//         {/* SALES TAX INVOICE Title */}
//         <div className="text-center py-2 border-b-2 border-black">
//           {/* <h1 className="text-lg font-bold">SALES TAX INVOICE</h1> */}
//         </div>

//         {/* Invoice Details Row */}
//         <div className="grid grid-cols-2 gap-4 p-3 text-[10px] border-b border-black">
//           <div className="space-y-1">
//             <div className="flex">
//               <span className="w-24">Invoice No:</span>
//               <span className="font-semibold flex-1 border-b border-gray-400">{invoice.invoice_number}</span>
//             </div>
//             <div className="flex">
//               <span className="w-24">Buyer's Name:</span>
//               <span className="font-semibold flex-1">{invoice.buyer_name}</span>
//             </div>
//             <div className="flex">
//               <span className="w-24">M/S:</span>
//               <span className="font-semibold flex-1">{invoice.buyer_business_name || '-'}</span>
//             </div>
//             <div className="flex">
//               <span className="w-24">Address:</span>
//               <span className="flex-1 text-[9px]">{invoice.buyer_address}</span>
//             </div>
//             <div className="flex">
//               <span className="w-24">P.O NO:</span>
//               <span className="font-semibold flex-1 border-b border-gray-400">{invoice.po_number || '-'}</span>
//             </div>
//           </div>

//           <div className="space-y-1">
//             <div className="flex">
//               <span className="w-32">Date:</span>
//               <span className="font-semibold flex-1 border-b border-gray-400">
//                 {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
//               </span>
//             </div>
//             <div className="flex">
//               <span className="w-32">ST Registration No:</span>
//               <span className="font-semibold flex-1 border-b border-gray-400">{invoice.buyer_gst_number || '-'}</span>
//             </div>
//             <div className="flex">
//               <span className="w-32">National Tax No:</span>
//               <span className="font-semibold flex-1 border-b border-gray-400">{invoice.buyer_ntn_cnic || '-'}</span>
//             </div>
//  {/* {invoice.fbr_invoice_number && (
//           <p className="mt-1">{invoice.fbr_invoice_number}</p>
//        */}
//          {invoice.fbr_invoice_number && (
//                <div className="flex">
//               <span className="w-32">FBR Invoice No</span>
//               <span className="font-semibold flex-1 border-b border-gray-400">{invoice.fbr_invoice_number || '-'}</span>
//             </div>
//               )}
//           </div>
//         </div>

//         {/* Items Table */}
//         <table className="w-full border-collapse text-[10px]">
//           <thead>
//             <tr className="border-b-2 border-black">
//               <th className="border border-black p-1 w-[8%] text-center">Qty.</th>
//               <th className="border border-black p-1 w-[32%] text-left">Description</th>
//               <th className="border border-black p-1 w-[10%] text-center">Rate</th>
//               <th className="border border-black p-1 w-[8%] text-center">Unit</th>
//               <th className="border border-black p-1 w-[14%] text-right">
//                 Amount<br/>Excluding Tax<br/>Rs.
//               </th>
//               <th className="border border-black p-1 w-[14%] text-right">
//                 Sales Tax @<br/>{invoice.sales_tax_rate}%<br/>Rs.
//               </th>
//               <th className="border border-black p-1 w-[14%] text-right">
//                 Further<br/>Tax @ {invoice.further_tax_rate || 0}%<br/>Rs.
//               </th>
//               <th className="border border-black p-1 w-[14%] text-right">
//                 Amount<br/>Including Tax<br/>Rs.
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.items.map((item, index) => {
//               const itemSalesTax = (parseFloat(item.line_total.toString()) * invoice.sales_tax_rate) / 100;
//               const itemFurtherTax = invoice.further_tax_rate 
//                 ? (parseFloat(item.line_total.toString()) * invoice.further_tax_rate) / 100 
//                 : 0;
//               const itemTotal = parseFloat(item.line_total.toString()) + itemSalesTax + itemFurtherTax;

//               return (
//                 <tr key={item.id} className="border-b border-black">
//                   <td className="border border-black p-1 text-center">{parseFloat(item.quantity.toString())}</td>
//                   <td className="border border-black p-1">
//                     {item.item_name}
//                     {item.hs_code && <span className="text-[9px] text-gray-600"> (HS: {item.hs_code})</span>}
//                   </td>
//                   <td className="border border-black p-1 text-right">
//                     {parseFloat(item.unit_price.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//                   </td>
//                   <td className="border border-black p-1 text-center">{item.uom}</td>
//                   <td className="border border-black p-1 text-right font-semibold">
//                     {parseFloat(item.line_total.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//                   </td>
//                   <td className="border border-black p-1 text-right">
//                     {itemSalesTax.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//                   </td>
//                   <td className="border border-black p-1 text-right">
//                     {itemFurtherTax > 0 ? itemFurtherTax.toLocaleString('en-PK', { minimumFractionDigits: 2 }) : '-'}
//                   </td>
//                   <td className="border border-black p-1 text-right font-semibold">
//                     {itemTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//                   </td>
//                 </tr>
//               );
//             })}

//             {/* Empty rows for spacing if needed */}
//             {invoice.items.length < 5 && Array.from({ length: 5 - invoice.items.length }).map((_, i) => (
//               <tr key={`empty-${i}`} className="border-b border-black">
//                 <td className="border border-black p-1 h-8">&nbsp;</td>
//                 <td className="border border-black p-1">&nbsp;</td>
//                 <td className="border border-black p-1">&nbsp;</td>
//                 <td className="border border-black p-1">&nbsp;</td>
//                 <td className="border border-black p-1">&nbsp;</td>
//                 <td className="border border-black p-1">&nbsp;</td>
//                 <td className="border border-black p-1">&nbsp;</td>
//                 <td className="border border-black p-1">&nbsp;</td>
//               </tr>
//             ))}

//             {/* TOTAL Row */}
//             <tr className="border-b-2 border-black bg-gray-100 font-bold">
//               <td colSpan={4} className="border border-black p-1 text-center">TOTAL</td>
//               <td className="border border-black p-1 text-right">
//                 {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//               </td>
//               <td className="border border-black p-1 text-right">
//                 {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//               </td>
//               <td className="border border-black p-1 text-right">
//                 {invoice.further_tax_amount > 0 
//                   ? parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })
//                   : '-'}
//               </td>
//               <td className="border border-black p-1 text-right">
//                 {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         {/* Summary Section */}
//         <div className="grid grid-cols-2 gap-4 p-3 border-b border-black">
//           <div className="space-y-1 text-[10px]">
//             <div className="flex justify-between">
//               <span>Excl. Value:</span>
//               <span className="font-bold border-b border-gray-400 px-2">
//                 {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Sales Tax:</span>
//               <span className="font-bold border-b border-gray-400 px-2">
//                 {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//               </span>
//             </div>
//             {invoice.further_tax_amount > 0 && (
//               <div className="flex justify-between">
//                 <span>Further Tax:</span>
//                 <span className="font-bold border-b border-gray-400 px-2">
//                   {parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//                 </span>
//               </div>
//             )}
//             <div className="flex justify-between pt-2">
//               <span className="font-bold">Incl. Value:</span>
//               <span className="font-bold border-b-2 border-black px-2">
//                 {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
//               </span>
//             </div>
//           </div>

// <div className="flex justify-end items-start gap-10">

//   {/* LEFT SIDE → QR + LOGO + INVOICE NUMBER BELOW */}
//   {showQr && qrCodeUrl && (invoice.status === 'fbr_posted' || invoice.status === 'verified' || invoice.status === 'paid') && (
//     <div className="flex flex-col items-center">
      
//       {/* QR + Logo Side by Side */}
//       <div className="flex items-center gap-2">
//         <img 
//           src={qrCodeUrl} 
//           alt="QR Code" 
//           className="w-16 h-16 border border-black" 
//         />

//         <img 
//   src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrqaitV5qiVR9gX9hEQmxX4Gx43m0JR3T5Pg&s"
//  alt="FBR Digital Invoicing" 
//           className="w-16 h-16 object-contain"
//         />
//       </div>

//       {/* Invoice # BELOW the images */}
//       {invoice.fbr_invoice_number && (
//         <p className="text-[8px] mt-1 font-semibold">
//           {invoice.fbr_invoice_number}
//         </p>
//       )}
//     </div>
//   )}

//   {/* RIGHT SIDE → Signature Section */}
//   <div className="flex flex-col justify-end h-20 text-center">
//     <div className="border-t-2 border-black w-40 mb-1"></div>
//     <p className="font-bold text-[10px]">Signature:</p>
//   </div>

// </div>

//         </div>

//       </div>
//     </div>
//   );
// }
