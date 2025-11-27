import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// GET - Public invoice view (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServer();

    // Get invoice with items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, business_name, address, ntn_number, gst_number, phone, email, logo_url, province')
      .eq('id', invoice.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get settings for template preference
    const { data: settings } = await supabase
      .from('settings')
      .select('invoice_template')
      .eq('company_id', invoice.company_id)
      .single();

    // Return invoice and company data
    return NextResponse.json({
      invoice: {
        ...invoice,
        items: invoice.items || []
      },
      company,
      template: settings?.invoice_template || 'modern'
    });

  } catch (error: any) {
    console.error('Error fetching public invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
