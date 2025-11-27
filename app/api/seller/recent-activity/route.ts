import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const company_id = searchParams.get('company_id');

        if (!company_id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // Fetch recent invoices (limit 10)
        const { data: invoices } = await supabase
            .from('invoices')
            .select('id, invoice_number, buyer_name, total_amount, created_at')
            .eq('company_id', company_id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch recent products (limit 10)
        const { data: products } = await supabase
            .from('products')
            .select('id, name, current_stock, uom, created_at')
            .eq('company_id', company_id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch recent customers (limit 10)
        const { data: customers } = await supabase
            .from('customers')
            .select('id, name, business_name, created_at')
            .eq('company_id', company_id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(5);

        interface Activity {
            id: string;
            type: 'invoice' | 'product' | 'customer';
            title: string;
            description: string;
            timestamp: string;
            icon: string;
            link: string;
        }

        const activities: Activity[] = [];

        // Process invoices
        if (invoices) {
            invoices.forEach((invoice) => {
                activities.push({
                    id: invoice.id,
                    type: 'invoice',
                    title: `Invoice ${invoice.invoice_number || 'N/A'}`,
                    description: `${invoice.buyer_name || 'Unknown'} - PKR ${parseFloat(invoice.total_amount || 0).toLocaleString()}`,
                    timestamp: invoice.created_at,
                    icon: '📄',
                    link: `/seller/invoices/${invoice.id}`
                });
            });
        }

        // Process products
        if (products) {
            products.forEach((product) => {
                activities.push({
                    id: product.id,
                    type: 'product',
                    title: `Product: ${product.name || 'Unknown'}`,
                    description: `Stock: ${product.current_stock || 0} ${product.uom || 'units'}`,
                    timestamp: product.created_at,
                    icon: '📦',
                    link: `/seller/products`
                });
            });
        }

        // Process customers
        if (customers) {
            customers.forEach((customer) => {
                activities.push({
                    id: customer.id,
                    type: 'customer',
                    title: `Customer: ${customer.name || 'Unknown'}`,
                    description: customer.business_name || 'New customer added',
                    timestamp: customer.created_at,
                    icon: '👤',
                    link: `/seller/customers/${customer.id}`
                });
            });
        }

        // Sort by timestamp descending and take top 10
        const recentActivity = activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

        return NextResponse.json({ activities: recentActivity });
    } catch (error: any) {
        console.error('Error in GET /api/seller/recent-activity:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
