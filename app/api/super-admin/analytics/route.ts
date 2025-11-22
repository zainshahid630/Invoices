import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function GET() {
  try {
    // Get all companies with their stats
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, business_name, is_active, created_at')
      .order('created_at', { ascending: false });

    if (companiesError) throw companiesError;

    // Get stats for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        // Get customer count
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);

        // Get invoice stats
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, status, total_amount')
          .eq('company_id', company.id);

        const totalInvoices = invoices?.length || 0;
        const fbrPostedInvoices = invoices?.filter(inv => 
          inv.status === 'fbr_posted' || inv.status === 'verified'
        ).length || 0;
        
        const totalRevenue = invoices?.reduce((sum, inv) => 
          sum + (parseFloat(inv.total_amount as any) || 0), 0
        ) || 0;

        // Get user count
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);

        // Get latest subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...company,
          stats: {
            customers: customerCount || 0,
            users: userCount || 0,
            totalInvoices,
            fbrPostedInvoices,
            totalRevenue: totalRevenue.toFixed(2),
          },
          subscription: subscription || null,
        };
      })
    );

    // Calculate overall stats
    const overallStats = {
      totalCompanies: companies.length,
      activeCompanies: companies.filter(c => c.is_active).length,
      inactiveCompanies: companies.filter(c => !c.is_active).length,
      totalCustomers: companiesWithStats.reduce((sum, c) => sum + c.stats.customers, 0),
      totalInvoices: companiesWithStats.reduce((sum, c) => sum + c.stats.totalInvoices, 0),
      totalFbrPosted: companiesWithStats.reduce((sum, c) => sum + c.stats.fbrPostedInvoices, 0),
      totalRevenue: companiesWithStats.reduce((sum, c) => sum + parseFloat(c.stats.totalRevenue), 0).toFixed(2),
    };

    return NextResponse.json({
      success: true,
      companies: companiesWithStats,
      overallStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
