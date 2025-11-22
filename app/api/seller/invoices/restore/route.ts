import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// POST - Restore a deleted invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, invoice_id } = body;

    if (!company_id || !invoice_id) {
      return NextResponse.json(
        { error: 'Company ID and Invoice ID are required' },
        { status: 400 }
      );
    }

    // Get invoice to verify it exists and is deleted
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, invoice_number, deleted_at')
      .eq('id', invoice_id)
      .eq('company_id', company_id)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!invoice.deleted_at) {
      return NextResponse.json({ error: 'Invoice is not deleted' }, { status: 400 });
    }

    // Restore: Clear deleted_at timestamp
    const { error } = await supabase
      .from('invoices')
      .update({ 
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice_id)
      .eq('company_id', company_id);

    if (error) {
      console.error('Error restoring invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invoice restored successfully' });
  } catch (error: any) {
    console.error('Error in POST /api/seller/invoices/restore:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

