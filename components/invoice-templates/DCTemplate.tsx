import React from 'react';
import { InvoiceTemplateProps } from './types';

export const DCTemplate: React.FC<InvoiceTemplateProps> = ({ 
  invoice, 
  company, 
  qrCodeUrl,
  isCommercialInvoice = false,
  commercialHsCode = '',
  commercialUom = ''
}) => {
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
    <div className="bg-white p-6 max-w-[210mm] mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Orange Top Bar */}
      <div className={`${isCommercialInvoice ? 'bg-purple-500' : 'bg-orange-500'} h-2 mb-4`}></div>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        {/* Company Info */}
        <div className="flex items-start gap-3">
          {company?.logo_url && (
            <img src={company.logo_url} alt="Company Logo" className="w-16 h-16 object-contain" />
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{company?.business_name || company?.name}</h1>
            <p className="text-xs text-gray-700 leading-tight">{company?.address}</p>
            <p className="text-xs text-gray-700">NTN No. {company?.ntn_number}</p>
            <p className="text-xs text-gray-700">ST Reg No. {company?.gst_number}</p>
          </div>
        </div>

        {/* Invoice Title and Details */}
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isCommercialInvoice ? 'COMMERCIAL INVOICE' : 'SALES TAX INVOICE'}
          </h2>
          <p className="text-xs text-gray-700 mb-1">
            <span className="font-semibold">Dated:</span> {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
          </p>
          <div className="border-t border-b border-gray-300 py-1 my-1">
            <p className="text-xs font-bold">INVOICE NO. {invoice.invoice_number}</p>
            {invoice.dc_code && <p className="text-xs">DC No: {invoice.dc_code}</p>}
            {invoice.fbr_invoice_number && (
              <p className="text-xs font-bold text-green-700">FBR: {invoice.fbr_invoice_number}</p>
            )}
            {displayHsCode && <p className="text-[10px] text-gray-600">HS Code: {displayHsCode}</p>}
            {displayUom && <p className="text-[10px] text-gray-600">UOM: {displayUom}</p>}
          </div>
          {invoice.notes && (
            <p className="text-[10px] italic text-gray-600 mt-1">{invoice.notes}</p>
          )}
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mb-3">
        <h3 className="text-xs font-bold text-gray-700 mb-1">BILL TO</h3>
        <div className="border-b border-gray-300 pb-1">
          <p className="text-sm font-bold text-gray-900 leading-tight">{invoice.buyer_business_name || invoice.buyer_name}</p>
          <p className="text-xs text-gray-700 leading-tight">{invoice.buyer_address}</p>
          <p className="text-xs text-gray-700">NTN No. {invoice.buyer_ntn_cnic}</p>
          {invoice.buyer_gst_number && (
            <p className="text-xs text-gray-700">ST Reg No. {invoice.buyer_gst_number}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-3">
        <thead>
          <tr className="bg-orange-500 text-white">
            <th className="text-left py-1 px-2 text-xs font-bold">DESCRIPTION</th>
            <th className="text-center py-1 px-2 text-xs font-bold">QTY</th>
            <th className="text-right py-1 px-2 text-xs font-bold">UNIT PRICE</th>
            <th className="text-right py-1 px-2 text-xs font-bold">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="py-1 px-2 text-xs text-gray-900">{item.item_name}</td>
              <td className="py-1 px-2 text-xs text-center text-gray-900">{parseFloat(item.quantity.toString()).toLocaleString()}</td>
              <td className="py-1 px-2 text-xs text-right text-gray-900">{parseFloat(item.unit_price.toString()).toFixed(2)}</td>
              <td className="py-1 px-2 text-xs text-right text-gray-900">{parseFloat(item.line_total.toString()).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Remarks and Totals Section */}
      <div className="flex justify-between mb-4">
        <div className="w-1/2">
          <p className="text-xs font-semibold text-gray-700">Remarks / Payment Instructions:</p>
        </div>
        <div className="w-1/2">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="text-right py-0.5 pr-3 font-semibold">SUBTOTAL</td>
                <td className="text-right py-0.5">{parseFloat(invoice.subtotal.toString()).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="text-right py-0.5 pr-3 font-semibold">DISCOUNT</td>
                <td className="text-right py-0.5">0.00</td>
              </tr>
              <tr>
                <td className="text-right py-0.5 pr-3 font-semibold">SUBTOTAL LESS DISCOUNT</td>
                <td className="text-right py-0.5">{parseFloat(invoice.subtotal.toString()).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="text-right py-0.5 pr-3 font-semibold">TAX RATE</td>
                <td className="text-right py-0.5">{invoice.sales_tax_rate}%</td>
              </tr>
              <tr>
                <td className="text-right py-0.5 pr-3 font-semibold">TOTAL TAX</td>
                <td className="text-right py-0.5">{parseFloat(invoice.sales_tax_amount.toString()).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="text-right py-0.5 pr-3 font-semibold">SHIPPING/HANDLING</td>
                <td className="text-right py-0.5">0.00</td>
              </tr>
              <tr className="border-t-2 border-gray-800">
                <td className="text-right py-1 pr-3 font-bold text-sm">Grand Total</td>
                <td className="text-right py-1 font-bold text-sm border-b-2 border-gray-800">
                  {parseFloat(invoice.total_amount.toString()).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code and FBR Logo Section - Hidden for Commercial Invoice */}
      {!isCommercialInvoice && qrCodeUrl && invoice.status === 'fbr_posted' && invoice.fbr_invoice_number && (
        <div className="mb-3">
          <div className="flex justify-start items-center gap-6">
            <div className="text-center">
              <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
              <p className="text-[10px] text-gray-600 mt-1">Scan for verification</p>
            </div>
            <div className="text-center">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrqaitV5qiVR9gX9hEQmxX4Gx43m0JR3T5Pg&s" 
                alt="FBR Digital Invoicing" 
                className="w-24 h-24 object-contain mx-auto"
              />
              <p className="text-[10px] text-gray-600 mt-1">FBR Compliant</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-green-700">FBR Invoice: {invoice.fbr_invoice_number}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orange Bottom Bar */}
      <div className="bg-orange-500 h-2 mt-4"></div>
    </div>
  );
};
