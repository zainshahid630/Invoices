import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Check if commercial invoice exists for this invoice
    const { data, error } = await supabase
      .from('commercial_invoices')
      .select('id, commercial_invoice_number, created_at, updated_at')
      .eq('invoice_id', params.id)
      .eq('company_id', companyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking commercial invoice:', error);
      return NextResponse.json(
        { error: 'Failed to check commercial invoice' },
        { status: 500 }
      );
    }

    if (data) {
      return NextResponse.json({
        exists: true,
        commercialInvoice: data
      });
    }

    return NextResponse.json({
      exists: false
    });
  } catch (error) {
    console.error('Error checking commercial invoice:', error);
    return NextResponse.json(
      { error: 'Failed to check commercial invoice' },
      { status: 500 }
    );
  }
}
