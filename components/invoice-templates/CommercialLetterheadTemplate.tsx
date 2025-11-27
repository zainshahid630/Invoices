/* eslint-disable @next/next/no-img-element */
import { LetterheadTemplateProps } from './types';

export function CommercialLetterheadTemplate({
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

  return (
    <div className="max-w-4xl mx-auto bg-white invoice-container text-[11px] print:mb-[10mm]">
      <style jsx>{`
        @media print {
          .invoice-container {
            page-break-after: avoid;
            page-break-inside: avoid;
            margin-bottom: 10mm;
          }
          @page {
            margin-bottom: 10mm;
            size: A4;
          }
        }
      `}</style>
      {/* Green Letterhead Area - Space for Pre-printed Letterhead */}
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

      {/* Reference Number and Title Row */}
      {/* <div className="grid grid-cols-2 gap-4 p-3 border-b border-gray-300">
        <div className="text-[10px]">
          <span className="text-gray-600">Ref. No:</span>
          <span className="ml-2 border-b border-gray-400 inline-block w-32"></span>
        </div>
        <div className="text-right text-[10px]">
          <span className="text-gray-600">Date:</span>
          <span className="ml-2 border-b border-gray-400 inline-block w-32"></span>
        </div>
      </div> */}

      {/* Commercial Invoice Title */}
      <div className="text-center py-2 border-b border-gray-300">
        <h2 className="text-lg font-bold tracking-wider">COMMERCIAL INVOICE</h2>
      </div>

      {/* Invoice Details Row */}
      <div className="grid grid-cols-2 gap-4 p-3 text-[10px] border-b border-gray-300">
        <div className="space-y-2">
          <div className="flex">
            <span className="w-28 text-gray-700">Invoice No:</span>
            <span className="font-semibold flex-1 border-b border-gray-400 px-1">
              {invoice.invoice_number.replace('CI-', '')}
            </span>
          </div>
          <div className="flex">
            <span className="w-28 text-gray-700">Buyer&apos;s Name:</span>
            <span className="font-semibold flex-1">{invoice.buyer_name || invoice.buyer_business_name}</span>
          </div>
          {/* <div className="flex">
            <span className="w-28 text-gray-700">M/S:</span>
            <span className="font-semibold flex-1">{invoice.buyer_business_name || '-'}</span>
          </div> */}
          <div className="flex items-start">
            <span className="w-28 text-gray-700">Address:</span>
            <span className="flex-1 text-[9px]">{invoice.buyer_address}</span>
          </div>
          {invoice.po_number && (
            <div className="flex">
              <span className="w-28 text-gray-700">P.O NO:</span>
              <span className="font-semibold flex-1 border-b border-gray-400 px-1">{invoice.po_number}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex">
            <span className="w-36 text-gray-700">Date:</span>
            <span className="font-semibold flex-1 border-b border-gray-400 px-1">
              {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className="flex">
            <span className="w-36 text-gray-700">ST Registration No:</span>
            <span className="font-semibold flex-1 border-b border-gray-400 px-1">
              {invoice.buyer_gst_number || '-'}
            </span>
          </div>
          <div className="flex">
            <span className="w-36 text-gray-700">National Tax No:</span>
            <span className="font-semibold flex-1 border-b border-gray-400 px-1">
              {invoice.buyer_ntn_cnic || '-'}
            </span>
          </div>
          {/* {invoice.items && invoice.items.length > 0 && invoice.items[0]?.hs_code && (
            <div className="flex">
              <span className="w-36 text-gray-700">HS CODE:</span>
              <span className="font-semibold flex-1 border-b border-gray-400 px-1">
                {invoice.items[0].hs_code}
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* Items Table - Compact for single page */}
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-1 w-[8%] text-center font-semibold">Qty.</th>
            <th className="border border-gray-400 p-1 w-[35%] text-center font-semibold">Description</th>
            <th className="border border-gray-400 p-1 w-[10%] text-center font-semibold">Rate</th>
            <th className="border border-gray-400 p-1 w-[10%] text-center font-semibold">Unit</th>
            <th className="border border-gray-400 p-1 w-[12%] text-center font-semibold text-[9px]">
              Amount<br />Excl. Tax<br />Rs.
            </th>
            <th className="border border-gray-400 p-1 w-[12%] text-center font-semibold text-[9px]">
              Sales Tax<br />{invoice.sales_tax_rate}%<br />Rs.
            </th>
            <th className="border border-gray-400 p-1 w-[13%] text-center font-semibold text-[9px]">
              Further Tax<br />{invoice.further_tax_rate || 0}%<br />Rs.
            </th>
            <th className="border border-gray-400 p-1 w-[13%] text-center font-semibold text-[9px]">
              Amount<br />Incl. Tax<br />Rs.
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 && invoice.items.map((item) => {
            const itemSalesTax = (parseFloat(item.line_total.toString()) * invoice.sales_tax_rate) / 100;
            const itemFurtherTax = invoice.further_tax_rate
              ? (parseFloat(item.line_total.toString()) * invoice.further_tax_rate) / 100
              : 0;
            const itemTotal = parseFloat(item.line_total.toString()) + itemSalesTax + itemFurtherTax;

            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-400 p-1 text-center">
                  {parseFloat(item.quantity.toString())}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {item.item_name}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {parseFloat(item.unit_price.toString()).toLocaleString('en-PK', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {item.uom || 'RFT'}
                </td>
                <td className="border border-gray-400 p-1 text-center font-semibold">
                  {parseFloat(item.line_total.toString()).toLocaleString('en-PK', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {itemSalesTax.toLocaleString('en-PK', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="border border-gray-400 p-1 text-center">
                  {itemFurtherTax > 0 
                    ? itemFurtherTax.toLocaleString('en-PK', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      }) 
                    : '-'}
                </td>
                <td className="border border-gray-400 p-1 text-center font-semibold">
                  {itemTotal.toLocaleString('en-PK', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
              </tr>
            );
          })}

          {/* Empty rows to maintain table height - 10 rows total */}
          {Array.from({ length: Math.max(0, 12 - (invoice.items?.length || 0)) }).map((_, index) => (
            <tr key={`empty-${index}`} className="h-8">
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1"></td>
            </tr>
          ))}

          {/* TOTAL Row */}
          <tr className="bg-gray-100 font-bold border-t-2 border-gray-600">
            <td colSpan={4} className="border border-gray-400 p-1 text-center">TOTAL</td>
            <td className="border border-gray-400 p-1 text-center">
              {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </td>
            <td className="border border-gray-400 p-1 text-center">
              {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </td>
            <td className="border border-gray-400 p-1 text-center">
              {invoice.further_tax_amount > 0
                ? parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })
                : '-'}
            </td>
            <td className="border border-gray-400 p-1 text-center">
              {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Summary and Signature Section */}
      <div className="grid grid-cols-2 gap-4 p-3 border-t-2 border-gray-400">
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Excl. Value:</span>
            <span className="font-bold border-b border-gray-400 px-3 min-w-[150px] text-right">
              {parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Sales Tax:</span>
            <span className="font-bold border-b border-gray-400 px-3 min-w-[150px] text-right">
              {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
          {invoice.further_tax_amount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Further Tax:</span>
              <span className="font-bold border-b border-gray-400 px-3 min-w-[150px] text-right">
                {parseFloat(invoice.further_tax_amount.toString()).toLocaleString('en-PK', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="font-bold text-gray-900">Incl. Value:</span>
            <span className="font-bold border-b-2 border-gray-600 px-3 min-w-[150px] text-right">
              {parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-end items-end">
          {/* Signature Section */}
          <div className="text-center">
            <div className="h-12 w-40 mb-1"></div>
            <div className="border-t-2 border-gray-600 w-40 mb-1"></div>
            <p className="font-semibold text-[9px] text-gray-700">Signature</p>
          </div>
        </div>
      </div>

      {/* Footer - Factory Address */}
      {/* <div className="bg-gray-100 p-2 text-center text-[9px] text-gray-700 border-t-2 border-gray-400">
        <p className="font-semibold">
          Factory Address: {company?.address || 'Company Address Here'}
        </p>
      </div> */}

      {/* Notes Section - Compact */}
      {/* {invoice.notes && (
        <div className="border-t border-gray-300 p-2 bg-gray-50 text-[9px]">
          <p className="font-bold mb-1 text-gray-700">NOTES:</p>
          <p className="text-gray-600 line-clamp-2">{invoice.notes}</p>
        </div>
      )} */}
    </div>
  );
}
