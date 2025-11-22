/* eslint-disable @next/next/no-img-element */
import { InvoiceTemplateProps } from './types';

export function ModernTemplate({ invoice, company, qrCodeUrl }: InvoiceTemplateProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none flex flex-col min-h-[1120px] a4-compact">

      {/* MAIN CONTENT (Flexible Height) */}
      <div className="invoice-content-wrapper flex-grow">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">INVOICE</h1>
              <p className="text-blue-100 text-sm">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              {company?.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.business_name || company.name}
                  className="h-10 mb-1 ml-auto object-contain"
                />
              )}
              <p className="text-xs text-blue-100 font-semibold">
                {company?.business_name || company?.name || 'Business Name'}
              </p>
            </div>
          </div>
        </div>

        {/* Company + Buyer */}
        <div className="grid grid-cols-2 gap-4 border-b-2 border-gray-200 p-4">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-1">From</h2>
            <div className="space-y-0.5 text-xs">
              <p className="text-base font-bold text-gray-900">{company?.business_name || company?.name}</p>
              {company?.address && <p>{company.address}</p>}
              {company?.ntn_number && <p>NTN: {company.ntn_number}</p>}
              {company?.gst_number && <p>GST: {company.gst_number}</p>}
              {company?.phone && <p>Phone: {company.phone}</p>}
              {company?.email && <p>Email: {company.email}</p>}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-1">Bill To</h2>
            <div className="space-y-0.5 text-xs">
              <p className="text-base font-bold text-gray-900">{invoice.buyer_name}</p>
              {invoice.buyer_business_name && <p>{invoice.buyer_business_name}</p>}
              {invoice.buyer_ntn_cnic && <p>NTN/CNIC: {invoice.buyer_ntn_cnic}</p>}
              {invoice.buyer_province && <p>Province: {invoice.buyer_province}</p>}
              {invoice.buyer_address && <p>{invoice.buyer_address}</p>}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-4 gap-2 bg-gray-50 border-b border-gray-200 p-4 text-xs">
          <div>
            <p className="font-semibold text-gray-500 uppercase">Date</p>
            <p className="font-bold text-gray-900 text-sm">
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
          </div>

          {invoice.po_number && (
            <div>
              <p className="font-semibold text-gray-500 uppercase">PO #</p>
              <p className="font-bold text-gray-900 text-sm">{invoice.po_number}</p>
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-500 uppercase">Type</p>
            <p className="font-bold text-gray-900 text-sm">{invoice.invoice_type}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500 uppercase">Status</p>
            <p className="font-bold text-green-600 text-sm uppercase">{invoice.payment_status}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-1 font-bold">Description</th>
                <th className="text-left py-1 font-bold">HS Code</th>
                <th className="text-center py-1 font-bold">UOM</th>
                <th className="text-right py-1 font-bold">Unit Price</th>
                <th className="text-right py-1 font-bold">Qty</th>
                <th className="text-right py-1 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-1">{item.item_name}</td>
                  <td className="py-1">{item.hs_code || '-'}</td>
                  <td className="py-1 text-center">{item.uom}</td>
                  <td className="py-1 text-right">
                    PKR {(+item.unit_price).toLocaleString()}
                  </td>
                  <td className="py-1 text-right">{+item.quantity}</td>
                  <td className="py-1 text-right font-semibold">
                    PKR {(+item.line_total).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-gray-50 border-t border-gray-200 p-3 text-xs">
            <h3 className="font-bold uppercase mb-1">Notes</h3>
            <p>{invoice.notes}</p>
          </div>
        )}

      </div>
      {/* END FLEX-GROW MAIN CONTENT */}

      {/* BOTTOM SECTION (ALWAYS AT END) */}
      <div className="grid grid-cols-2 gap-4 border-t-2 border-gray-200 p-4 text-xs">

        {/* QR Code and FBR Logo */}
        <div className="flex items-center justify-center">
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
            <div className="text-center text-gray-400 text-xs">
              <div className="w-28 h-28 border-2 border-dashed border-gray-300 mb-1"></div>
              QR available after FBR posting
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">
              PKR {(+invoice.subtotal).toLocaleString()}
            </span>
          </div>

          {invoice.sales_tax_rate > 0 && (
            <div className="flex justify-between">
              <span>Sales Tax ({invoice.sales_tax_rate}%)</span>
              <span className="font-semibold">PKR {(+invoice.sales_tax_amount).toLocaleString()}</span>
            </div>
          )}

          {invoice.further_tax_rate > 0 && (
            <div className="flex justify-between">
              <span>Further Tax ({invoice.further_tax_rate}%)</span>
              <span className="font-semibold">PKR {(+invoice.further_tax_amount).toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>PKR {(+invoice.total_amount).toLocaleString()}</span>
          </div>

          {/* Signature Section */}
          <div className="flex flex-col items-end mt-4">
            <div className="border-t-2 border-black w-40 mb-1"></div>
            <p className="font-bold text-[10px]">Signature:</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center p-3 text-xs">
        <p>Thank you for your business!</p>
        <p className="text-[10px] text-blue-100 mt-1">This invoice is computer-generated.</p>
      </div>

    </div>
  );
}
