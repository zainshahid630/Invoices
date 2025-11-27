/* eslint-disable @next/next/no-img-element */
import { InvoiceTemplateProps } from './types';

export function ExcelTemplate({ 
  invoice, 
  company, 
  qrCodeUrl,
  isCommercialInvoice = false,
  commercialHsCode = '',
  commercialUom = ''
}: InvoiceTemplateProps) {
  const getMostFrequent = (arr: string[]) => {
    const freq: Record<string, number> = {};
    let maxCount = 0;
    let mostFreq = "";
    arr.forEach(val => {
      if (!val) return;
      freq[val] = (freq[val] || 0) + 1;
      if (freq[val] > maxCount) {
        maxCount = freq[val];
        mostFreq = val;
      }
    });
    return mostFreq || "-";
  };

  const mostHSCode = getMostFrequent(invoice.items.map(item => item.hs_code || ""));
  const mostUOM = getMostFrequent(invoice.items.map(item => item.uom || ""));
  
  // Use commercial values if this is a commercial invoice
  const displayHsCode = isCommercialInvoice ? commercialHsCode : mostHSCode;
  const displayUom = isCommercialInvoice ? commercialUom : mostUOM;
  
  const itemCount = invoice.items.length;
  const isCompact = itemCount > 12;

  return (
    <div className={`max-w-3xl mx-auto bg-white shadow-lg print:shadow-none text-[12px] leading-tight invoice-container ${isCompact ? 'compact-mode' : ''}`}>
      <div className="invoice-content-wrapper">
        {/* HEADER */}
        <div className="border-b-2 border-black p-4">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">
              {isCommercialInvoice ? 'COMMERCIAL INVOICE' : 'SALES TAX INVOICE'}
            </h1>
            <div className="text-right">
              {company?.logo_url && (
                <img
                  src={company.logo_url}
                  className="w-20 h-20 object-contain ml-auto mb-1"
                  alt={company.business_name || company.name}
                />
              )}
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div className="space-y-1">
              <p>Invoice #: <span className="font-semibold">{invoice.invoice_number}</span></p>
              {invoice.status === 'fbr_posted' && (
                <p>FBR Invoice No: <span className="font-semibold">{invoice.fbr_invoice_number}</span></p>
              )}
              <p>Date: <span className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</span></p>
              {displayHsCode && displayHsCode !== '-' && <p>HS Code: <span className="font-semibold">{displayHsCode}</span></p>}
              {displayUom && displayUom !== '-' && <p>UOM: <span className="font-semibold">{displayUom}</span></p>}
              {invoice.po_number && (
                <p>PO Number: <span className="font-semibold">{invoice.po_number}</span></p>
              )}
              {invoice.dc_code && (
                <p>DC Code: <span className="font-semibold">{invoice.dc_code}</span></p>
              )}
            </div>

            <div className="space-y-1 text-right">
              <p>Invoice Type: <span className="font-semibold">{invoice.invoice_type}</span></p>
              <p>HS Code: <span className="font-semibold">{displayHsCode}</span></p>
              <p>UOM: <span className="font-semibold">{displayUom}</span></p>
            </div>
          </div>
        </div>

        {/* SELLER & BUYER */}
        <div className="border-b border-black p-4">
          <div className="grid grid-cols-2 gap-4 text-[12px]">
            {/* SELLER */}
            <div>
              <h2 className="font-bold bg-gray-100 px-2 py-1 text-sm">SELLER</h2>
              <div className="mt-1">
                <p className="font-semibold">{company?.business_name || company?.name}</p>
                {company?.address && <p>{company.address}</p>}
                <p>
                  {company?.ntn_number && <>NTN: {company.ntn_number}</>}
                  {company?.gst_number && <span className="ml-3">GST: {company.gst_number}</span>}
                </p>
                <p>
                  {company?.phone && <>Phone: {company.phone}</>}
                  {company?.email && <span className="ml-3">Email: {company.email}</span>}
                </p>
              </div>
            </div>

            {/* BUYER */}
            <div>
              <h2 className="font-bold bg-gray-100 px-2 py-1 text-sm">BUYER</h2>
              <div className="mt-1">
                {invoice.buyer_name !== invoice.buyer_business_name && (
                  <p className="font-semibold">{invoice.buyer_name}</p>
                )}
                {invoice.buyer_business_name && <p>{invoice.buyer_business_name}</p>}
                {invoice.buyer_address && <p>{invoice.buyer_address}, {invoice.buyer_province}</p>}
                <p>
                  {invoice.buyer_ntn_cnic && <>NTN: {invoice.buyer_ntn_cnic}</>}
                  {invoice.buyer_gst_number && <span className="ml-3">GST: {invoice.buyer_gst_number}</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="p-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-gray-200 border-t-2 border-b-2 border-black">
                <th className="text-left py-1 px-2 w-[5%]">#</th>
                <th className="text-left py-1 px-2 w-[70%]">DESCRIPTION</th>
                <th className="text-right py-1 px-2 w-[12.5%]">QTY</th>
                <th className="text-right py-1 px-2 w-[12.5%]">RATE</th>
                <th className="text-right py-1 px-2 w-[12.5%]">AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-1 px-2 text-center">{i + 1}</td>
                  <td className="py-1 px-2">{item.item_name}</td>
                  <td className="py-1 px-2 text-right">{item.quantity}</td>
                  <td className="py-1 px-2 text-right">{Number(item.unit_price).toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-semibold">{Number(item.line_total).toLocaleString()}</td>
                </tr>
              ))}

              {/* TOTALS */}
              <tr><td colSpan={5} className="py-1"></td></tr>
              <tr>
                <td colSpan={4} className="text-right font-bold py-1 px-2">SUBTOTAL:</td>
                <td className="text-right font-bold py-1 px-2">{Number(invoice.subtotal).toLocaleString()}</td>
              </tr>

              {invoice.sales_tax_rate > 0 && (
                <tr>
                  <td colSpan={4} className="text-right py-1 px-2">Sales Tax ({invoice.sales_tax_rate}%):</td>
                  <td className="text-right py-1 px-2">{Number(invoice.sales_tax_amount).toLocaleString()}</td>
                </tr>
              )}

              {invoice.further_tax_rate > 0 && (
                <tr>
                  <td colSpan={4} className="text-right py-1 px-2">Further Tax ({invoice.further_tax_rate}%):</td>
                  <td className="text-right py-1 px-2">{Number(invoice.further_tax_amount).toLocaleString()}</td>
                </tr>
              )}

              <tr className="border-t-2 border-black bg-gray-200">
                <td colSpan={4} className="text-right font-bold py-2 px-2">TOTAL:</td>
                <td className="text-right font-bold py-2 px-2">{Number(invoice.total_amount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* NOTES */}
        {invoice.notes && (
          <div className="border-t border-gray-300 p-2 bg-gray-50 text-[11px]">
            <p className="font-bold mb-1">NOTES:</p>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* QR + SIGN */}
      <div className="border-t-2 border-black p-2 flex justify-between items-center invoice-qr-footer">
        <div className="flex items-center gap-3">
          {!isCommercialInvoice && qrCodeUrl && invoice.status === 'fbr_posted' && invoice.fbr_invoice_number && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 border border-black" />
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrqaitV5qiVR9gX9hEQmxX4Gx43m0JR3T5Pg&s"
                  alt="FBR Digital Invoicing"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <p className="text-[8px] mt-1 font-semibold">{invoice.fbr_invoice_number || 'FBR-2025-00001'}</p>
            </div>
          )}
          {isCommercialInvoice && (
            <div className="text-center text-gray-600">
              <p className="text-xs font-semibold">Commercial Invoice</p>
              <p className="text-[10px]">For customs purposes</p>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="border-t-2 border-black w-40 mb-1"></div>
          <p className="font-bold text-[10px]">Signature:</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center p-2 bg-gray-100 border-t border-black text-[10px]">
        <p className="font-semibold">Thank you for your business!</p>
      </div>
    </div>
  );
}
