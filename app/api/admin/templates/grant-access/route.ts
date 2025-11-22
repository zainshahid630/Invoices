import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// POST - Grant template access to a company (Super Admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, template_id, granted_by, expires_at } = body;

    if (!company_id || !template_id) {
      return NextResponse.json(
        { error: 'Company ID and Template ID are required' },
        { status: 400 }
      );
    }

    // Check if access already exists
    const { data: existing } = await supabase
      .from('company_template_access')
      .select('*')
      .eq('company_id', company_id)
      .eq('template_id', template_id)
      .single();

    if (existing) {
      // Update existing access
      const { data: access, error } = await supabase
        .from('company_template_access')
        .update({
          is_active: true,
          expires_at: expires_at || null,
          granted_by: granted_by || null,
        })
        .eq('company_id', company_id)
        .eq('template_id', template_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating access:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ access, message: 'Template access updated successfully' });
    } else {
      // Create new access
      const { data: access, error } = await supabase
        .from('company_template_access')
        .insert({
          company_id,
          template_id,
          granted_by: granted_by || null,
          expires_at: expires_at || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error granting access:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ access, message: 'Template access granted successfully' });
    }
  } catch (error: any) {
    console.error('Error in POST /api/admin/templates/grant-access:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Revoke template access (Super Admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const template_id = searchParams.get('template_id');

    if (!company_id || !template_id) {
      return NextResponse.json(
        { error: 'Company ID and Template ID are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('company_template_access')
      .update({ is_active: false })
      .eq('company_id', company_id)
      .eq('template_id', template_id);

    if (error) {
      console.error('Error revoking access:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template access revoked successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/templates/grant-access:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

