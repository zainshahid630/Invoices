import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// GET - List all queries (Admin only)
export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabaseServer();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // TODO: Add Super Admin verification here
        // For now, relying on the fact that this route is under /super-admin which should be protected by middleware
        // or we can check a specific role/table if needed.

        const offset = (page - 1) * limit;

        let query = supabase
            .from('queries')
            .select(`
        *,
        company:companies(name, business_name, email:users!inner(email))
      `, { count: 'exact' });

        // Note: The nested select company:companies(...) might need adjustment depending on exact schema relationships.
        // If users table has email and is linked to company, we might need to join differently.
        // Based on schema: queries -> companies. queries -> users.
        // Better to fetch user email from users table.

        // Refined query:
        // .select(`*, company:companies(name, business_name), user:users(email, name)`)

        query = supabase
            .from('queries')
            .select(`
        *,
        company:companies(name, business_name),
        user:users(email, name)
      `, { count: 'exact' });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: queries, error, count } = await query;

        if (error) {
            console.error('Error fetching admin queries:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            queries: queries || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error: any) {
        console.error('Error in GET /api/super-admin/queries:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
