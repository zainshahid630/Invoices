import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Get next available invoice number (optimized single query)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get company settings
    const { data: settings } = await supabase
      .from('settings')
      .select('invoice_prefix, invoice_counter, default_hs_code')
      .eq('company_id', company_id)
      .single();

    const prefix = settings?.invoice_prefix || 'INV';
    const counter = settings?.invoice_counter || 1;
    const default_hs_code = settings?.default_hs_code || '';

    // Generate the next invoice number
    const invoice_number = `${prefix}${counter}`;

    // Quick check if this number exists (single query)
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('company_id', company_id)
      .eq('invoice_number', invoice_number)
      .is('deleted_at', null)
      .maybeSingle();

    // If number exists, find the next available one
    let finalInvoiceNumber = invoice_number;
    
    if (existingInvoice) {
      // Get all invoice numbers with this prefix to find gaps
      const { data: allInvoices } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('company_id', company_id)
        .like('invoice_number', `${prefix}%`)
        .is('deleted_at', null);

      // Extract numeric parts and find the highest
      const usedNumbers = new Set(
        (allInvoices || [])
          .map(inv => {
            const numPart = inv.invoice_number.replace(prefix, '');
            return parseInt(numPart) || 0;
          })
          .filter(num => num > 0)
      );

      // Find next available number starting from counter
      let nextNum = counter;
      while (usedNumbers.has(nextNum) && nextNum < counter + 1000) {
        nextNum++;
      }

      finalInvoiceNumber = `${prefix}${nextNum}`;
    }

    return NextResponse.json({
      invoice_number: finalInvoiceNumber,
      default_hs_code,
    });
  } catch (error: any) {
    console.error('Error getting next invoice number:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
