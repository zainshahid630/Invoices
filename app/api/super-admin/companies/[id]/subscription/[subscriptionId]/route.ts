import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// PATCH update subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; subscriptionId: string } }
) {
  try {
    const body = await request.json();

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(body)
      .eq('id', params.subscriptionId)
      .eq('company_id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update subscription' },
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

