/* eslint-disable @next/next/no-img-element */
import { LetterheadTemplateProps } from './types';

export function LetterheadTemplate({
  invoice,
  company,
  qrCodeUrl,
  topSpace = 120,
  showQr = true,
  letterheadTopSpace,
  letterheadShowQr,
  isCommercialInvoice = false,
  commercialHsCode = '',
  commercialUom = ''
}: LetterheadTemplateProps) {
  // Use letterhead-specific props if provided, otherwise use defaults
  const actualTopSpace = letterheadTopSpace !== undefined ? letterheadTopSpace : topSpace;
  const actualShowQr = letterheadShowQr !== undefined ? letterheadShowQr : showQr;
  
  // Get most frequent HS Code and UOM from items
  const getMostFrequent = (arr: string[]) => {
    const frequency: { [key: string]: number } = {};
    arr.forEach(val => {
      if (val) frequency[val] = (frequency[val] || 0) + 1;
    });
    return Object.keys(frequency).reduce((a, b) =>
      frequency[a] > frequency[b] ? a : b, arr[0] || ''
    );
  };

  const hsCodes = invoice.items.map(item => item.hs_code).filter(Boolean);
  const uoms = invoice.items.map(item => item.uom).filter(Boolean);
  const mostFrequentHsCode = hsCodes.length > 0 ? getMostFrequent(hsCodes) : '';
  const mostFrequentUom = uoms.length > 0 ? getMostFrequent(uoms) : '';

  // Use commercial values if this is a commercial invoice
  const displayHsCode = isCommercialInvoice ? commercialHsCode : mostFrequentHsCode;
  const displayUom = isCommercialInvoice ? commercialUom : mostFrequentUom;

  return (
    <div className="max-w-4xl mx-auto bg-white invoice-container text-[11px]">
      {/* Space for Pre-printed Letterhead */}
      <div
        className="border-2 border-dashed border-gray-300 print:border-none flex items-center justify-center text-gray-400 print:text-transparent"
        style={{ height: `${actualTopSpace}mm` }}
      >
        <div className="text-center">
          <p className="text-sm font-semibold">PRE-PRINTED LETTERHEAD AREA</p>
          <p className="text-xs mt-2">Company Name, Address, Contact Info</p>
          <p className="text-xs">Space: {actualTopSpace}mm</p>
        </div>
      </div>

<div className="w-full flex justify-center">
  {isCommercialInvoice && (
    <p className="text-xs font-bold text-purple-600 mt-2 text-center">
      COMMERCIAL INVOICE
    </p>
  )}
</div>

      {/* Invoice Details Row */}
           
      <div className="grid grid-cols-2 gap-4 p-3 text-[10px] border-b border-black">
        <div className="space-y-1">
          <div className="flex">
            <span className="w-24">Invoice No:</span>
            <span className="font-semibold flex-1 border-b border-gray-400">{invoice.invoice_number.replace('CI-','')}</span>
          </div>
          {/* {displayHsCode && (
            <div className="flex">
              <span className="w-24">HS Code:</span>
              <span className="font-semibold flex-1">{displayHsCode}</span>
            </div>
          )}
          {displayUom && (
            <div className="flex">
              <span className="w-24">UOM:</span>
              <span className="font-semibold flex-1">{displayUom}</span>
            </div>
          )} */}
          {invoice.buyer_name !== invoice.buyer_business_name && (
            <div className="flex">
              <span className="w-24">Buyer&apos;s Name:</span>
              <span className="font-semibold flex-1">{invoice.buyer_name}</span>
            </div>
          )}
          <div className="flex">
            <span className="w-24">M/S:</span>
            <span className="font-semibold flex-1">{invoice.buyer_business_name || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-24">Address:</span>
            <span className="flex-1 text-[9px]">{invoice.buyer_address}</span>
          </div>
          {invoice.po_number && (
            <div className="flex">
              <span className="w-24">P.O NO:</span>
              <span className="font-semibold flex-1 border-b border-gray-400">{invoice.po_number}</span>
            </div>
          )}
          {invoice.dc_code && (
            <div className="flex">
              <span className="w-24">DC NO:</span>
              <span className="font-semibold flex-1 border-b border-gray-400">{invoice.dc_code}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex">
            <span className="w-32">Date:</span>
            <span className="font-semibold flex-1 border-b border-gray-400">
              {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className="flex">
            <span className="w-32">ST Registration No:</span>
            <span className="font-semibold flex-1 border-b border-gray-400">{invoice.buyer_gst_number || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-32">National Tax No:</span>
            <span className="font-semibold flex-1 border-b border-gray-400">{invoice.buyer_ntn_cnic || '-'}</span>
          </div>
          {invoice.fbr_invoice_number && (
            <div className="flex">
              <span className="w-32">FBR Invoice No:</span>
              <span className="font-semibold flex-1 border-b border-gray-400">{invoice.fbr_invoice_number}</span>
            </div>
          )}
          {invoice.items[0]?.hs_code && (
            <div className="flex">
              <span className="w-32">HS Code:</span>
              <span className="font-semibold flex-1 border-b border-gray-400">{invoice.items[0].hs_code}</span>
            </div>
          )}
          {invoice.items[0]?.uom && (
            <div className="flex">
              <span className="w-32">UOM:</span>
              <span className="font-semibold flex-1 border-b border-gray-400">{invoice.items[0].uom}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="border border-black p-1 w-[8%] text-center">Qty.</th>
            <th className="border border-black p-1 w-[40%] text-left">Description</th>
            <th className="border border-black p-1 w-[10%] text-center">Rate</th>
            <th className="border border-black p-1 w-[14%] text-right">
              Amount<br />Excluding Tax<br />Rs.
            </th>
            <th className="border border-black p-1 w-[14%] text-right">
              Sales Tax @<br />{invoice.sales_tax_rate}%<br />Rs.
            </th>
            <th className="border border-black p-1 w-[14%] text-right">
              Further<br />Tax @ {invoice.further_tax_rate || 0}%<br />Rs.
            </th>
            <th className="border border-black p-1 w-[14%] text-right">
              Amount<br />Including Tax<br />Rs.
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => {
            const itemSalesTax = (parseFloat(item.line_total.toString()) * invoice.sales_tax_rate) / 100;
            const itemFurtherTax = invoice.further_tax_rate
              ? (parseFloat(item.line_total.toString()) * invoice.further_tax_rate) / 100
              : 0;
            const itemTotal = parseFloat(item.line_total.toString()) + itemSalesTax + itemFurtherTax;

            return (
              <tr key={item.id} className="border-b border-black">
                <td className="border border-black p-1 text-center">{parseFloat(item.quantity.toString())}</td>
                <td className="border border-black p-1">
                  {item.item_name}
                  {/* {item.hs_code && <span className="text-[9px] text-gray-600"> </span>} */}
                </td>
                <td className="border border-black p-1 text-right">
                  {parseFloat(item.unit_price.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-black p-1 text-right font-semibold">
                  {parseFloat(item.line_total.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-black p-1 text-right">
                  {itemSalesTax.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-black p-1 text-right">
                  {itemFurtherTax > 0 ? itemFurtherTax.toLocaleString('en-PK', { minimumFractionDigits: 2 }) : '-'}
                </td>
                <td className="border border-black p-1 text-right font-semibold">
                  {itemTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}

          {/* TOTAL Row */}
          <tr className="border-b-2 border-black bg-gray-100 font-bold">
            <td colSpan={4} className="border border-black p-1 text-right">TOTAL</td>
            <td className="border border-black p-1 text-right">
              {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </td>
            <td className="border border-black p-1 text-right">
              {invoice.further_tax_amount > 0
                ? parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })
                : '-'}
            </td>
            <td className="border border-black p-1 text-right">
              {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-4 p-3 border-b border-black">
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span>Excl. Value:</span>
            <span className="font-bold border-b border-gray-400 px-2">
              {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax:</span>
            <span className="font-bold border-b border-gray-400 px-2">
              {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {invoice.further_tax_amount > 0 && (
            <div className="flex justify-between">
              <span>Further Tax:</span>
              <span className="font-bold border-b border-gray-400 px-2">
                {parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <span className="font-bold">Incl. Value:</span>
            <span className="font-bold border-b-2 border-black px-2">
              {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex justify-end items-start gap-10">
          {/* QR Code and FBR Logo */}
          {!isCommercialInvoice && actualShowQr && qrCodeUrl && invoice.status === 'fbr_posted' && invoice.fbr_invoice_number && (
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
          )}

          {/* Signature Section */}
          <div className="flex flex-col justify-end h-20 text-center">
            <div className="border-t-2 border-black w-40 mb-1"></div>
            <p className="font-bold text-[10px]">Signature:</p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {invoice.notes && (
        <div className="border-t border-gray-300 p-3 bg-gray-50 text-[11px]">
          <p className="font-bold mb-1">NOTES:</p>
          <p>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
