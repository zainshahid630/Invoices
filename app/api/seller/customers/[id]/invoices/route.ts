import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get all invoices for a customer
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

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', params.id)
      .eq('company_id', company_id)
      .is('deleted_at', null) // Exclude deleted invoices
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer invoices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(invoices || []);
  } catch (error: any) {
    console.error('Error in GET /api/seller/customers/[id]/invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

