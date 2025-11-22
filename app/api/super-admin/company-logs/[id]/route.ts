import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // Get recent invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, invoice_date, status, total_amount, created_at, created_by, users!invoices_created_by_fkey(name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get recent customers
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, business_name, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get recent payments
    const { data: payments } = await supabase
      .from('payments')
      .select('id, amount, payment_date, payment_method, created_at, created_by, users!payments_created_by_fkey(name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get users activity
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    // Combine all activities into a unified log
    const activities = [
      ...(invoices?.map(inv => ({
        type: 'invoice',
        id: inv.id,
        description: `Invoice ${inv.invoice_number} ${inv.status}`,
        amount: inv.total_amount,
        status: inv.status,
        user: (inv as any).users?.name || 'Unknown',
        timestamp: inv.created_at,
      })) || []),
      ...(customers?.map(cust => ({
        type: 'customer',
        id: cust.id,
        description: `Customer added: ${cust.name}`,
        timestamp: cust.created_at,
      })) || []),
      ...(payments?.map(pay => ({
        type: 'payment',
        id: pay.id,
        description: `Payment received: ${pay.payment_method}`,
        amount: pay.amount,
        user: (pay as any).users?.name || 'Unknown',
        timestamp: pay.created_at,
      })) || []),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      logs: {
        activities: activities.slice(0, 100), // Limit to 100 most recent
        invoices,
        customers,
        payments,
        users,
      },
    });
  } catch (error) {
    console.error('Error fetching company logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company logs' },
      { status: 500 }
    );
  }
}
