import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { checkSubscription } from '@/lib/subscription-check';

const supabase = getSupabaseServer();

// GET - List all payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(id, invoice_number, total_amount),
        customer:customers(id, name, business_name)
      `)
      .eq('company_id', company_id)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error in GET /api/seller/payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      invoice_id,
      customer_id,
      amount,
      payment_date,
      payment_method,
      payment_type,
      reference_number,
      notes,
      created_by,
    } = body;

    if (!company_id || !amount || !payment_date) {
      return NextResponse.json(
        { error: 'Company ID, amount, and payment date are required' },
        { status: 400 }
      );
    }

    // Check subscription status
    const subscriptionStatus = await checkSubscription(company_id);
    if (!subscriptionStatus.isActive) {
      return NextResponse.json(
        { 
          error: subscriptionStatus.message || 'Subscription expired',
          subscription_expired: true,
          subscription: subscriptionStatus.subscription
        },
        { status: 403 }
      );
    }

    // Create payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        company_id,
        invoice_id: invoice_id || null,
        customer_id: customer_id || null,
        amount: parseFloat(amount),
        payment_date,
        payment_method: payment_method || null,
        payment_type: payment_type || 'received',
        reference_number: reference_number || null,
        notes: notes || null,
        created_by: created_by || null,
        payment_gateway: body.payment_gateway || null,
        payment_status: body.payment_status || 'completed',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // If payment is linked to an invoice, update invoice payment status
    if (invoice_id) {
      // Get invoice details
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', invoice_id)
        .single();

      if (invoice) {
        // Get total payments for this invoice
        const { data: allPayments } = await supabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', invoice_id);

        const totalPaid = allPayments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        const invoiceTotal = parseFloat(invoice.total_amount);

        let newPaymentStatus = 'pending';
        if (totalPaid >= invoiceTotal) {
          newPaymentStatus = 'paid';
        } else if (totalPaid > 0) {
          newPaymentStatus = 'partial';
        }

        // Update invoice payment status
        await supabase
          .from('invoices')
          .update({ payment_status: newPaymentStatus })
          .eq('id', invoice_id);
      }
    }

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Error in POST /api/seller/payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

