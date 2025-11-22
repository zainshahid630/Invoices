// Health check endpoint for load balancer
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Check database connectivity using singleton
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('companies')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 3001,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
