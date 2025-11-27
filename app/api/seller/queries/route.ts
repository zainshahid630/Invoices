import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// GET - List all queries for the authenticated seller's company
export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabaseServer();
        const { searchParams } = new URL(request.url);
        const company_id = searchParams.get('company_id');

        if (!company_id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // Fetch queries
        const { data: queries, error } = await supabase
            .from('queries')
            .select('*')
            .eq('company_id', company_id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching queries:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ queries: queries || [] });
    } catch (error: any) {
        console.error('Error in GET /api/seller/queries:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new query
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseServer();
        const body = await request.json();
        const { company_id, user_id, subject, message } = body;

        if (!company_id || !user_id || !subject || !message) {
            return NextResponse.json(
                { error: 'Company ID, User ID, subject, and message are required' },
                { status: 400 }
            );
        }

        // Create query
        const { data: query, error } = await supabase
            .from('queries')
            .insert({
                company_id,
                user_id,
                subject,
                message,
                status: 'open',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating query:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(query, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/seller/queries:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
