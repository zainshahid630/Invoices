import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Public invoice verification (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get invoice with company and items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        company:companies(
          id,
          name,
          business_name,
          address,
          ntn_number,
          gst_number,
          phone,
          email,
          logo_url,
          province
        )
      `)
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Only show FBR posted invoices publicly
    if (invoice.status !== 'fbr_posted' && invoice.status !== 'verified' && invoice.status !== 'paid') {
      return NextResponse.json({ error: 'Invoice not available for public verification' }, { status: 403 });
    }

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', params.id);

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch invoice items' }, { status: 500 });
    }

    // Return invoice data
    return NextResponse.json({
      ...invoice,
      items: items || []
    });

  } catch (error: any) {
    console.error('Error fetching invoice for verification:', error);
    return NextResponse.json({
      error: error.message || 'Error fetching invoice'
    }, { status: 500 });
  }
}
