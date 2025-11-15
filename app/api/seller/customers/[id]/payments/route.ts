import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get all payments for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get all invoices for this customer
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('customer_id', params.id)
      .eq('company_id', company_id);

    if (invoiceError) {
      console.error('Error fetching invoices:', invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    if (!invoices || invoices.length === 0) {
      return NextResponse.json([]);
    }

    const invoiceIds = invoices.map(inv => inv.id);

    // Get all payments for these invoices
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(
          invoice_number,
          total_amount,
          payment_status
        )
      `)
      .in('invoice_id', invoiceIds)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching customer payments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(payments || []);
  } catch (error: any) {
    console.error('Error in GET /api/seller/customers/[id]/payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

