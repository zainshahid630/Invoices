import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Check if invoice number exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const invoice_number = searchParams.get('invoice_number');

    if (!company_id || !invoice_number) {
      return NextResponse.json(
        { error: 'Company ID and invoice number are required' },
        { status: 400 }
      );
    }

    // Check if invoice number exists (excluding deleted invoices)
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('company_id', company_id)
      .eq('invoice_number', invoice_number)
      .is('deleted_at', null)
      .single();

    return NextResponse.json({ exists: !!existingInvoice });
  } catch (error: any) {
    console.error('Error checking invoice number:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
