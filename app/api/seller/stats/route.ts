import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { cachedJsonResponse, CachePresets } from '@/lib/api-response-cache';

const supabase = getSupabaseServer();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    // Get low stock products (stock < 10)
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .lt('current_stock', 10);

    // Get total customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    // Get pending invoices
    const { count: pendingInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'pending');

    // Return with cache headers (30 seconds cache, 60 seconds stale-while-revalidate)
    return cachedJsonResponse(
      {
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        totalCustomers: totalCustomers || 0,
        pendingInvoices: pendingInvoices || 0,
      },
      CachePresets.SHORT
    );
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

