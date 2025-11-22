import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function GET(request: NextRequest) {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        company:companies(name, business_name),
        invoice:invoices(invoice_number, buyer_name),
        customer:customers(name)
      `)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payments: payments || [],
    });
  } catch (error: any) {
    console.error('Error in GET /api/super-admin/payments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
