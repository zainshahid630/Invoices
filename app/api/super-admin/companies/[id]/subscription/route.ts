import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET subscription for company
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, subscription: subscription || null });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create subscription
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { start_date, end_date, amount, status, payment_status } = body;

    if (!start_date || !end_date || !amount) {
      return NextResponse.json(
        { success: false, error: 'Start date, end date, and amount are required' },
        { status: 400 }
      );
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        company_id: params.id,
        start_date,
        end_date,
        amount,
        status: status || 'active',
        payment_status: payment_status || 'pending',
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

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

