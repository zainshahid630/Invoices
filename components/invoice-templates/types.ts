export interface InvoiceItem {
  id: string;
  item_name: string;
  hs_code: string;
  uom: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Invoice {
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
  buyer_gst_number: string;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  fbr_invoice_number?: string;
  items: InvoiceItem[];
}

export interface Company {
  name: string;
  business_name: string;
  address: string;
  ntn_number: string;
  gst_number: string;
  phone: string;
  email: string;
  logo_url?: string;
}

export interface InvoiceTemplateProps {
  invoice: Invoice;
  company: Company | null;
  qrCodeUrl: string;
}

export interface LetterheadTemplateProps extends InvoiceTemplateProps {
  topSpace?: number;
  showQr?: boolean;
}
