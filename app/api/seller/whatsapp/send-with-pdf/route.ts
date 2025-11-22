import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { WhatsAppBusinessAPI, formatWhatsAppNumber } from '@/lib/whatsapp-business';

const supabase = getSupabaseServer();

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
      .select('name, whatsapp_number, whatsapp_enabled, whatsapp_message_template, whatsapp_phone_number_id, whatsapp_access_token')
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

    // Check if WhatsApp Business API is configured
    if (!company.whatsapp_phone_number_id || !company.whatsapp_access_token) {
      return NextResponse.json(
        {
          error: 'WhatsApp Business API not configured. Please add your Phone Number ID and Access Token in Settings.',
          fallback: true // Indicates client should use wa.me fallback
        },
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
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Determine customer phone number
    let phoneNumber = customer_phone;
    let customerName = invoice.buyer_name || 'Valued Customer';

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

    // Format phone number
    const formattedPhone = formatWhatsAppNumber(phoneNumber);

    // Build message from template
    const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let message = company.whatsapp_message_template ||
      `Hello {customer_name},\n\nYour invoice {invoice_number} for Rs. {total_amount} is ready.\n\nPlease find the invoice PDF attached.\n\nThank you for your business!\n\n{company_name}`;

    message = message
      .replace(/{customer_name}/g, customerName)
      .replace(/{invoice_number}/g, invoice.invoice_number)
      .replace(/{total_amount}/g, parseFloat(invoice.total_amount).toLocaleString('en-PK'))
      .replace(/{invoice_date}/g, invoiceDate)
      .replace(/{company_name}/g, company.name)
      .replace(/{subtotal}/g, parseFloat(invoice.subtotal).toLocaleString('en-PK'))
      .replace(/{payment_status}/g, invoice.payment_status.toUpperCase());

    // Initialize WhatsApp Business API
    const whatsappAPI = new WhatsAppBusinessAPI({
      phoneNumberId: company.whatsapp_phone_number_id,
      accessToken: company.whatsapp_access_token,
      businessAccountId: '', // Optional
    });

    // Generate PDF URL (publicly accessible)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const pdfUrl = `${baseUrl}/seller/invoices/${invoice_id}/print?template=modern&download=true`;

    // Send WhatsApp message with PDF
    const result = await whatsappAPI.sendDocument({
      to: formattedPhone,
      message: message,
      mediaUrl: pdfUrl,
      filename: `Invoice_${invoice.invoice_number}.pdf`,
    });

    if (result.success) {
      // Log the sent message (optional - create whatsapp_messages table)
      await supabase.from('whatsapp_messages').insert({
        company_id: company_id,
        invoice_id: invoice_id,
        recipient_phone: formattedPhone,
        message_id: result.messageId,
        message_text: message,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Invoice sent successfully via WhatsApp',
        phoneNumber: formattedPhone,
      });
    } else {
      return NextResponse.json(
        {
          error: result.error || 'Failed to send WhatsApp message',
          details: result.details,
          fallback: true // Indicates client should use wa.me fallback
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error sending WhatsApp with PDF:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to send WhatsApp message',
        fallback: true
      },
      { status: 500 }
    );
  }
}
