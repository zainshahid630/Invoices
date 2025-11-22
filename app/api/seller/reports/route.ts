import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Get reports data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const report_type = searchParams.get('report_type');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    if (!report_type) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 });
    }

    // Sales Summary Report
    if (report_type === 'sales_summary') {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company_id)
        .is('deleted_at', null) // Exclude deleted invoices
        .gte('invoice_date', start_date || '1900-01-01')
        .lte('invoice_date', end_date || '2100-12-31')
        .order('invoice_date', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calculate summary
      const total_invoices = invoices.length;
      const total_revenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
      const total_tax = invoices.reduce((sum, inv) => sum + parseFloat(inv.sales_tax_amount || 0) + parseFloat(inv.further_tax_amount || 0), 0);
      const total_subtotal = invoices.reduce((sum, inv) => sum + parseFloat(inv.subtotal || 0), 0);

      const by_status = invoices.reduce((acc: any, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {});

      const by_payment_status = invoices.reduce((acc: any, inv) => {
        acc[inv.payment_status] = (acc[inv.payment_status] || 0) + 1;
        return acc;
      }, {});

      return NextResponse.json({
        summary: {
          total_invoices,
          total_revenue: total_revenue.toFixed(2),
          total_tax: total_tax.toFixed(2),
          total_subtotal: total_subtotal.toFixed(2),
          by_status,
          by_payment_status,
        },
        invoices,
      });
    }

    // Customer Report
    if (report_type === 'customer_report') {
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', company_id)
        .order('name');

      if (customerError) {
        console.error('Error fetching customers:', customerError);
        return NextResponse.json({ error: customerError.message }, { status: 500 });
      }

      // Get invoices for each customer
      const customerData = await Promise.all(
        customers.map(async (customer) => {
          const { data: invoices } = await supabase
            .from('invoices')
            .select('*')
            .eq('company_id', company_id)
            .eq('customer_id', customer.id)
            .is('deleted_at', null) // Exclude deleted invoices
            .gte('invoice_date', start_date || '1900-01-01')
            .lte('invoice_date', end_date || '2100-12-31');

          const total_invoices = invoices?.length || 0;
          const total_amount = invoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0;
          const paid_invoices = invoices?.filter(inv => inv.payment_status === 'paid').length || 0;
          const pending_amount = invoices?.filter(inv => inv.payment_status !== 'paid').reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0;

          return {
            ...customer,
            total_invoices,
            total_amount: total_amount.toFixed(2),
            paid_invoices,
            pending_amount: pending_amount.toFixed(2),
          };
        })
      );

      return NextResponse.json({ customers: customerData });
    }

    // Product Report
    if (report_type === 'product_report') {
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', company_id)
        .order('name');

      if (productError) {
        console.error('Error fetching products:', productError);
        return NextResponse.json({ error: productError.message }, { status: 500 });
      }

      // Get invoice items for each product
      const productData = await Promise.all(
        products.map(async (product) => {
          const { data: items } = await supabase
            .from('invoice_items')
            .select('*, invoice:invoices!inner(*)')
            .eq('product_id', product.id)
            .gte('invoice.invoice_date', start_date || '1900-01-01')
            .lte('invoice.invoice_date', end_date || '2100-12-31');

          const total_sold = items?.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0) || 0;
          const total_revenue = items?.reduce((sum, item) => sum + parseFloat(item.line_total || 0), 0) || 0;

          return {
            ...product,
            total_sold: total_sold.toFixed(2),
            total_revenue: total_revenue.toFixed(2),
          };
        })
      );

      return NextResponse.json({ products: productData });
    }

    // Payment Report
    if (report_type === 'payment_report') {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*, invoice:invoices(*), customer:customers(*)')
        .eq('company_id', company_id)
        .gte('payment_date', start_date || '1900-01-01')
        .lte('payment_date', end_date || '2100-12-31')
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const total_payments = payments.length;
      const total_amount = payments.reduce((sum, pay) => sum + parseFloat(pay.amount || 0), 0);

      const by_method = payments.reduce((acc: any, pay) => {
        const method = pay.payment_method || 'Unknown';
        acc[method] = (acc[method] || 0) + parseFloat(pay.amount || 0);
        return acc;
      }, {});

      return NextResponse.json({
        summary: {
          total_payments,
          total_amount: total_amount.toFixed(2),
          by_method,
        },
        payments,
      });
    }

    // Tax Report
    if (report_type === 'tax_report') {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company_id)
        .is('deleted_at', null) // Exclude deleted invoices
        .gte('invoice_date', start_date || '1900-01-01')
        .lte('invoice_date', end_date || '2100-12-31')
        .order('invoice_date', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const total_sales_tax = invoices.reduce((sum, inv) => sum + parseFloat(inv.sales_tax_amount || 0), 0);
      const total_further_tax = invoices.reduce((sum, inv) => sum + parseFloat(inv.further_tax_amount || 0), 0);
      const total_tax = total_sales_tax + total_further_tax;
      const total_subtotal = invoices.reduce((sum, inv) => sum + parseFloat(inv.subtotal || 0), 0);

      return NextResponse.json({
        summary: {
          total_sales_tax: total_sales_tax.toFixed(2),
          total_further_tax: total_further_tax.toFixed(2),
          total_tax: total_tax.toFixed(2),
          total_subtotal: total_subtotal.toFixed(2),
        },
        invoices,
      });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in GET /api/seller/reports:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

