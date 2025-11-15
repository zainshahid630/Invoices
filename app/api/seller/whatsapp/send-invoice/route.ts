import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { company_id, invoice_id, customer_phone } = await request.json();

    if (!company_id || !invoice_id) {
      return NextResponse.json(
        { error: 'Company ID and Invoice ID are required' },
        { status: 400 }
      );
    }

    // Get company WhatsApp settings
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name, whatsapp_number, whatsapp_enabled, whatsapp_message_template')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (!company.whatsapp_enabled) {
      return NextResponse.json(
        { error: 'WhatsApp is not enabled. Please enable it in Settings > WhatsApp.' },
        { status: 400 }
      );
    }

    if (!company.whatsapp_number) {
      return NextResponse.json(
        { error: 'WhatsApp number not configured. Please add your WhatsApp Business number in Settings.' },
        { status: 400 }
      );
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .eq('company_id', company_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice query error:', invoiceError);
      return NextResponse.json(
        { error: 'Invoice not found', details: invoiceError?.message },
        { status: 404 }
      );
    }

    // Determine customer phone number
    let phoneNumber = customer_phone;
    let customerName = invoice.buyer_name || 'Valued Customer';
    
    // Try to get phone and name from linked customer if available
    if (invoice.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('name, phone, business_name')
        .eq('id', invoice.customer_id)
        .single();
      
      if (customer) {
        if (!phoneNumber && customer.phone) {
          phoneNumber = customer.phone;
        }
        if (customer.name) {
          customerName = customer.name;
        }
      }
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Customer phone number not available. Please provide a phone number.' },
        { status: 400 }
      );
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Ensure it starts with country code (default to Pakistan +92 if not present)
    let finalNumber = cleanNumber;
    if (!cleanNumber.startsWith('92') && cleanNumber.length === 10) {
      finalNumber = '92' + cleanNumber;
    }

    // Build message from template
    const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let message = company.whatsapp_message_template || 
      `Hello {customer_name},\n\nYour invoice {invoice_number} for Rs. {total_amount} is ready.\n\nThank you for your business!\n\n{company_name}`;

    // Replace placeholders
    message = message
      .replace(/{customer_name}/g, customerName)
      .replace(/{invoice_number}/g, invoice.invoice_number)
      .replace(/{total_amount}/g, parseFloat(invoice.total_amount).toLocaleString('en-PK'))
      .replace(/{invoice_date}/g, invoiceDate)
      .replace(/{company_name}/g, company.name)
      .replace(/{subtotal}/g, parseFloat(invoice.subtotal).toLocaleString('en-PK'))
      .replace(/{payment_status}/g, invoice.payment_status.toUpperCase());

    // Generate WhatsApp link (wa.me format)
    const waLink = `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;

    // Log the activity (optional - you can create a whatsapp_logs table)
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      waLink,
      message: 'WhatsApp link generated successfully',
      phoneNumber: finalNumber,
      preview: message
    });

  } catch (error: any) {
    console.error('Error generating WhatsApp link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate WhatsApp link' },
      { status: 500 }
    );
  }
}
