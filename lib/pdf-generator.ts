// Invoice PDF Generator
// This uses Puppeteer to generate PDFs from HTML

interface Invoice {
  invoice_number: string;
  invoice_date: string;
  buyer_name: string;
  buyer_business_name?: string;
  buyer_address?: string;
  buyer_ntn_cnic?: string;
  subtotal: number;
  sales_tax_amount: number;
  total_amount: number;
  items: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
}

interface Company {
  name: string;
  business_name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

/**
 * Generate invoice HTML for PDF conversion
 */
export function generateInvoiceHTML(invoice: Invoice, company: Company): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    .logo { max-width: 150px; max-height: 80px; }
    .company-info { text-align: right; }
    .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 30px;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-box {
      width: 48%;
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
    }
    .info-box h3 {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .info-box p {
      margin: 5px 0;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    tr:hover { background: #f9fafb; }
    .text-right { text-align: right; }
    .totals {
      margin-top: 30px;
      float: right;
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
    }
    .totals-row.total {
      border-top: 2px solid #2563eb;
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
      margin-top: 10px;
      padding-top: 15px;
    }
    .footer {
      clear: both;
      margin-top: 80px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${company.logo_url ? `<img src="${company.logo_url}" class="logo" alt="Logo">` : ''}
      <div style="margin-top: 10px;">
        <div style="font-size: 18px; font-weight: bold;">${company.name}</div>
        ${company.business_name ? `<div style="font-size: 14px; color: #6b7280;">${company.business_name}</div>` : ''}
      </div>
    </div>
    <div class="company-info">
      ${company.address ? `<p>${company.address}</p>` : ''}
      ${company.phone ? `<p>Phone: ${company.phone}</p>` : ''}
      ${company.email ? `<p>Email: ${company.email}</p>` : ''}
    </div>
  </div>

  <div class="invoice-title">INVOICE</div>

  <div class="info-section">
    <div class="info-box">
      <h3>Bill To</h3>
      <p><strong>${invoice.buyer_name}</strong></p>
      ${invoice.buyer_business_name ? `<p>${invoice.buyer_business_name}</p>` : ''}
      ${invoice.buyer_address ? `<p>${invoice.buyer_address}</p>` : ''}
      ${invoice.buyer_ntn_cnic ? `<p>NTN/CNIC: ${invoice.buyer_ntn_cnic}</p>` : ''}
    </div>
    <div class="info-box">
      <h3>Invoice Details</h3>
      <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
      <p><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td>${item.item_name}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">Rs. ${parseFloat(item.unit_price.toString()).toLocaleString('en-PK')}</td>
          <td class="text-right">Rs. ${parseFloat(item.line_total.toString()).toLocaleString('en-PK')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>Rs. ${parseFloat(invoice.subtotal.toString()).toLocaleString('en-PK')}</span>
    </div>
    <div class="totals-row">
      <span>Sales Tax:</span>
      <span>Rs. ${parseFloat(invoice.sales_tax_amount.toString()).toLocaleString('en-PK')}</span>
    </div>
    <div class="totals-row total">
      <span>Total:</span>
      <span>Rs. ${parseFloat(invoice.total_amount.toString()).toLocaleString('en-PK')}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>This is a computer-generated invoice.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Get public URL for invoice PDF
 * This assumes you have a print page that can be accessed publicly
 */
export function getInvoicePDFUrl(invoiceId: string, baseUrl: string): string {
  return `${baseUrl}/api/invoices/${invoiceId}/pdf`;
}
