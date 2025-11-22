/* eslint-disable @next/next/no-img-element */
import { InvoiceTemplateProps } from './types';

export function ClassicTemplate({ invoice, company, qrCodeUrl }: InvoiceTemplateProps) {
  const itemCount = invoice.items.length;
  const isCompact = itemCount > 5;

  return (
    <div
      className={`max-w-4xl mx-auto bg-white shadow-lg print:shadow-none border-2 border-gray-700 
      invoice-container flex flex-col min-h-[1050px] ${isCompact ? 'compact-mode' : ''}`}
    >

      {/* MAIN CONTENT */}
      <div className="invoice-content-wrapper flex-grow">

        {/* Header */}
        <div className="border-b-2 border-gray-700 p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'serif' }}>INVOICE</h1>
              <div className="h-1 w-16 bg-gray-800"></div>
            </div>
            <div className="text-right">
              {company?.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.business_name}
                  className="h-10 mb-1 ml-auto object-contain"
                />
              )}
              <p className="text-xs font-semibold text-gray-700">
                {company?.business_name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-0.5">Invoice Number</p>
              <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'monospace' }}>
                {invoice.invoice_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 uppercase mb-0.5">Invoice Date</p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(invoice.invoice_date).toLocaleDateString('en-PK')}
              </p>
            </div>
          </div>
        </div>

        {/* Company & Buyer */}
        <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-300">
          <div className="border border-gray-300 p-3 bg-gray-50">
            <h2 className="text-xs font-bold text-gray-600 uppercase mb-2 border-b border-gray-300 pb-1">
              Seller Information
            </h2>
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-900">{company?.business_name}</p>
              {company?.address && <p className="text-xs text-gray-700">{company.address}</p>}
              {company?.ntn_number && <p className="text-xs text-gray-700">NTN: {company.ntn_number}</p>}
              {company?.gst_number && <p className="text-xs text-gray-700">GST: {company.gst_number}</p>}
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-gray-50">
            <h2 className="text-xs font-bold text-gray-600 uppercase mb-2 border-b border-gray-300 pb-1">
              Buyer Information
            </h2>
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-900">{invoice.buyer_name}</p>
              {invoice.buyer_business_name && <p className="text-xs">{invoice.buyer_business_name}</p>}
              {invoice.buyer_ntn_cnic && <p className="text-xs">NTN/CNIC: {invoice.buyer_ntn_cnic}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-4">
          <table className="w-full border border-gray-700 text-xs">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="text-left py-2 px-2 uppercase">Description</th>
                <th className="text-left py-2 px-2 uppercase">HS Code</th>
                <th className="text-center py-2 px-2 uppercase">UOM</th>
                <th className="text-right py-2 px-2 uppercase">Rate</th>
                <th className="text-right py-2 px-2 uppercase">Qty</th>
                <th className="text-right py-2 px-2 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                  <td className="py-1.5 px-2">{item.item_name}</td>
                  <td className="py-1.5 px-2">{item.hs_code || '-'}</td>
                  <td className="py-1.5 px-2 text-center">{item.uom}</td>
                  <td className="py-1.5 px-2 text-right">
                    {Number(item.unit_price).toLocaleString()}
                  </td>
                  <td className="py-1.5 px-2 text-right">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-right font-bold">
                    {Number(item.line_total).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="grid grid-cols-2 gap-4 p-4 border-t-2 border-gray-700">

        {/* QR Code and FBR Logo */}
        <div className="flex items-center justify-center border p-3">
          {qrCodeUrl && invoice.status === 'fbr_posted' && invoice.fbr_invoice_number ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 border border-black" />
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrqaitV5qiVR9gX9hEQmxX4Gx43m0JR3T5Pg&s"
                  alt="FBR Digital Invoicing"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <p className="text-[8px] mt-1 font-semibold">{invoice.fbr_invoice_number}</p>
            </div>
          ) : (
            <div className="w-28 h-28 border border-dashed flex items-center justify-center text-xs text-gray-400">
              QR
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{invoice.subtotal.toLocaleString()}</span>
          </div>

          {invoice.sales_tax_rate > 0 && (
            <div className="flex justify-between">
              <span>Sales Tax:</span>
              <span>{invoice.sales_tax_amount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>{invoice.total_amount.toLocaleString()}</span>
          </div>

          {/* Signature Section */}
          <div className="flex flex-col items-end mt-4">
            <div className="border-t-2 border-black w-40 mb-1"></div>
            <p className="font-bold text-[10px]">Signature:</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-800 text-white text-center text-xs">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
