import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single payment
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

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(id, invoice_number, total_amount, buyer_name),
        customer:customers(id, name, business_name)
      `)
      .eq('id', params.id)
      .eq('company_id', company_id)
      .single();

    if (error) {
      console.error('Error fetching payment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Error in GET /api/seller/payments/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get payment details before deleting
    const { data: payment } = await supabase
      .from('payments')
      .select('invoice_id')
      .eq('id', params.id)
      .eq('company_id', company_id)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Delete payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', params.id)
      .eq('company_id', company_id);

    if (deleteError) {
      console.error('Error deleting payment:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update invoice payment status if payment was linked to invoice
    if (payment.invoice_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', payment.invoice_id)
        .single();

      if (invoice) {
        const { data: remainingPayments } = await supabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', payment.invoice_id);

        const totalPaid = remainingPayments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        const invoiceTotal = parseFloat(invoice.total_amount);

        let newPaymentStatus = 'pending';
        if (totalPaid >= invoiceTotal) {
          newPaymentStatus = 'paid';
        } else if (totalPaid > 0) {
          newPaymentStatus = 'partial';
        }

        await supabase
          .from('invoices')
          .update({ payment_status: newPaymentStatus })
          .eq('id', payment.invoice_id);
      }
    }

    return NextResponse.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/seller/payments/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

