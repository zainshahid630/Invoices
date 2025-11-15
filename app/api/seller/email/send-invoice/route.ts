import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EmailService, generateInvoiceEmailHTML } from '@/lib/email-service';
import puppeteer from 'puppeteer';
import { generateInvoiceHTML } from '@/lib/pdf-generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { company_id, invoice_id, customer_email } = await request.json();

    if (!company_id || !invoice_id) {
      return NextResponse.json(
        { error: 'Company ID and Invoice ID are required' },
        { status: 400 }
      );
    }

    // Get company email settings
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (!company.email_enabled) {
      return NextResponse.json(
        { error: 'Email integration is not enabled. Please enable it in Settings > Email.' },
        { status: 400 }
      );
    }

    // Validate SMTP configuration
    if (!company.smtp_host || !company.smtp_user || !company.smtp_password || !company.smtp_from_email) {
      return NextResponse.json(
        { error: 'Email SMTP not configured. Please complete the setup in Settings > Email.' },
        { status: 400 }
      );
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq('id', invoice_id)
      .eq('company_id', company_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Determine customer email
    let recipientEmail = customer_email;
    let customerName = invoice.buyer_name || 'Valued Customer';
    
    if (invoice.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('name, email, business_name')
        .eq('id', invoice.customer_id)
        .single();
      
      if (customer) {
        if (!recipientEmail && customer.email) {
          recipientEmail = customer.email;
        }
        if (customer.name) {
          customerName = customer.name;
        }
      }
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Customer email not available. Please provide an email address.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // Generate PDF from invoice HTML
    const invoiceHTML = generateInvoiceHTML(invoice, company);
    
    let pdfBuffer: Buffer;
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(invoiceHTML, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });
      await browser.close();
    } catch (pdfError: any) {
      console.error('PDF generation error:', pdfError);
      return NextResponse.json(
        { error: 'Failed to generate PDF: ' + pdfError.message },
        { status: 500 }
      );
    }

    // Prepare email content
    const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build subject from template
    let subject = company.email_subject_template || 'Invoice {invoice_number} from {company_name}';
    subject = subject
      .replace(/{invoice_number}/g, invoice.invoice_number)
      .replace(/{company_name}/g, company.name)
      .replace(/{customer_name}/g, customerName)
      .replace(/{invoice_date}/g, invoiceDate)
      .replace(/{total_amount}/g, parseFloat(invoice.total_amount).toLocaleString('en-PK'));

    // Build body from template
    let bodyMessage = company.email_body_template || 
      `Dear {customer_name},\n\nPlease find attached your invoice {invoice_number} dated {invoice_date}.\n\nThank you for your business!\n\nBest regards,\n{company_name}`;
    
    bodyMessage = bodyMessage
      .replace(/{customer_name}/g, customerName)
      .replace(/{invoice_number}/g, invoice.invoice_number)
      .replace(/{total_amount}/g, parseFloat(invoice.total_amount).toLocaleString('en-PK'))
      .replace(/{invoice_date}/g, invoiceDate)
      .replace(/{company_name}/g, company.name)
      .replace(/{subtotal}/g, parseFloat(invoice.subtotal).toLocaleString('en-PK'))
      .replace(/{payment_status}/g, invoice.payment_status.toUpperCase());

    // Generate HTML email
    const emailHTML = generateInvoiceEmailHTML(
      company.name,
      company.logo_url,
      customerName,
      invoice.invoice_number,
      invoiceDate,
      parseFloat(invoice.total_amount).toLocaleString('en-PK'),
      invoice.payment_status.toUpperCase(),
      bodyMessage
    );

    // Initialize email service
    const emailService = new EmailService(
      company.smtp_host,
      company.smtp_port || 587,
      company.smtp_secure || 'tls',
      company.smtp_user,
      company.smtp_password,
      company.smtp_from_email,
      company.smtp_from_name || company.name
    );

    // Send email with PDF attachment
    const result = await emailService.sendInvoiceEmail(
      recipientEmail,
      subject,
      emailHTML,
      pdfBuffer,
      invoice.invoice_number
    );

    if (result.success) {
      // Log the sent email
      await supabase.from('email_logs').insert({
        company_id: company_id,
        invoice_id: invoice_id,
        recipient_email: recipientEmail,
        subject: subject,
        status: 'sent',
        message_id: result.messageId,
        sent_at: new Date().toISOString(),
      }).catch(() => {
        // Ignore if table doesn't exist
      });

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Invoice email sent successfully',
        recipientEmail: recipientEmail,
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to send email',
          details: result.details
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}
