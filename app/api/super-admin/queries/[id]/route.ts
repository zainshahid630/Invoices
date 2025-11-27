import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// GET - Fetch a single query details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getSupabaseServer();
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Query ID is required' }, { status: 400 });
        }

        const { data: query, error } = await supabase
            .from('queries')
            .select(`
        *,
        company:companies(name, business_name),
        user:users(email, name)
      `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching query details:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(query);
    } catch (error: any) {
        console.error('Error in GET /api/super-admin/queries/[id]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update query status and response
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getSupabaseServer();
        const { id } = params;
        const body = await request.json();
        const { status, admin_response } = body;

        if (!id) {
            return NextResponse.json({ error: 'Query ID is required' }, { status: 400 });
        }

        // Build update object
        const updates: any = { updated_at: new Date().toISOString() };
        if (status) updates.status = status;
        if (admin_response !== undefined) updates.admin_response = admin_response;

        const { data: query, error } = await supabase
            .from('queries')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating query:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(query);
    } catch (error: any) {
        console.error('Error in PATCH /api/super-admin/queries/[id]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
