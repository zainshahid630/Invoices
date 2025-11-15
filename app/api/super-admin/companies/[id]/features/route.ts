import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all feature toggles for company
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: features, error } = await supabase
      .from('feature_toggles')
      .select('*')
      .eq('company_id', params.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch features' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, features: features || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create or update feature toggle
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { feature_name, is_enabled } = body;

    if (!feature_name) {
      return NextResponse.json(
        { success: false, error: 'Feature name is required' },
        { status: 400 }
      );
    }

    // Check if feature toggle exists
    const { data: existing } = await supabase
      .from('feature_toggles')
      .select('*')
      .eq('company_id', params.id)
      .eq('feature_name', feature_name)
      .single();

    let result;

    if (existing) {
      // Update existing
      result = await supabase
        .from('feature_toggles')
        .update({ is_enabled })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new
      result = await supabase
        .from('feature_toggles')
        .insert({
          company_id: params.id,
          feature_name,
          is_enabled,
        })
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update feature toggle' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, feature: result.data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

