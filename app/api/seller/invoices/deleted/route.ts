import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all deleted invoices for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, name, business_name)
      `)
      .eq('company_id', company_id)
      .not('deleted_at', 'is', null) // Only deleted invoices
      .order('deleted_at', { ascending: false });

    if (error) {
      console.error('Error fetching deleted invoices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(invoices || []);
  } catch (error: any) {
    console.error('Error in GET /api/seller/invoices/deleted:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

