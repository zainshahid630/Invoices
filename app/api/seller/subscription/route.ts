import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET subscription for logged-in seller's company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID required' },
        { status: 400 }
      );
    }
    
    return await fetchSubscription(companyId);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, planId, amount, txnRefNo } = body;
    
    if (!companyId || !planId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
    
    // Create subscription record
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        company_id: companyId,
        plan_id: planId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        amount: amount,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subscription:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create subscription' },
        { status: 500 }
      );
    }
    
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        company_id: companyId,
        subscription_id: subscription.id,
        amount: amount,
        payment_date: new Date().toISOString().split('T')[0], // Add payment date
        payment_method: 'jazzcash',
        payment_status: 'pending',
        payment_type: 'received',
        reference_number: txnRefNo,
        gateway_transaction_id: txnRefNo,
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error creating payment:', paymentError);
    }
    
    return NextResponse.json({
      success: true,
      subscription,
      payment,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function fetchSubscription(companyId: string) {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned"
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    success: true, 
    subscription: subscription || null 
  });
}
