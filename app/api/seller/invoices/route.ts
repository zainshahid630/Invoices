import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSubscription } from '@/lib/subscription-check';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate invoice number using settings: PREFIX + COUNTER
async function generateInvoiceNumber(companyId: string): Promise<string> {
  // Get company settings
  const { data: settings } = await supabase
    .from('settings')
    .select('invoice_prefix, invoice_counter')
    .eq('company_id', companyId)
    .single();

  const prefix = settings?.invoice_prefix || 'INV';
  const currentCounter = settings?.invoice_counter || 1;

  // Generate invoice number: PREFIX + COUNTER (e.g., INV301, INV.301, etc.)
  // No separator added - user controls format via prefix
  const invoiceNumber = `${prefix}${currentCounter}`;

  // Increment counter in settings for next invoice
  await supabase
    .from('settings')
    .update({ invoice_counter: currentCounter + 1 })
    .eq('company_id', companyId);

  return invoiceNumber;
}

// GET - List all invoices for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const status = searchParams.get('status');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, name, business_name)
      `)
      .eq('company_id', company_id)
      .is('deleted_at', null); // Exclude deleted invoices

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: invoices, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(invoices || []);
  } catch (error: any) {
    console.error('Error in GET /api/seller/invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      customer_id,
      invoice_number: custom_invoice_number, // Allow custom invoice number
      po_number, // Purchase Order number
      invoice_date,
      invoice_type,
      scenario,
      buyer_name,
      buyer_business_name,
      buyer_ntn_cnic,
      buyer_gst_number,
      buyer_address,
      buyer_province,
      buyer_registration_type,
      sales_tax_rate,
      further_tax_rate,
      payment_status,
      notes,
      items, // Array of invoice items
    } = body;

    // Validation
    if (!company_id || !invoice_date || !invoice_type || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Company ID, invoice date, invoice type, and items are required' },
        { status: 400 }
      );
    }

    // Check subscription status
    const subscriptionStatus = await checkSubscription(company_id);
    if (!subscriptionStatus.isActive) {
      return NextResponse.json(
        { 
          error: subscriptionStatus.message || 'Subscription expired',
          subscription_expired: true,
          subscription: subscriptionStatus.subscription
        },
        { status: 403 }
      );
    }

    // Use custom invoice number if provided, otherwise generate
    let invoice_number = custom_invoice_number;
    if (!invoice_number || invoice_number.trim() === '') {
      invoice_number = await generateInvoiceNumber(company_id);
    }

    // Check if invoice number already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoice_number)
      .single();

    if (existingInvoice) {
      return NextResponse.json(
        { error: `Invoice number ${invoice_number} already exists. Please use a different number.` },
        { status: 409 }
      );
    }

    // Auto-save manual customer to customers table if not already linked
    let final_customer_id = customer_id;
    
    if (!customer_id && buyer_name) {
      // Check if customer with same NTN/CNIC already exists
      let existingCustomer = null;
      
      if (buyer_ntn_cnic) {
        const { data } = await supabase
          .from('customers')
          .select('id')
          .eq('company_id', company_id)
          .eq('ntn_cnic', buyer_ntn_cnic)
          .single();
        existingCustomer = data;
      }
      
      // If no existing customer found, create new one
      if (!existingCustomer) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            company_id,
            name: buyer_name,
            business_name: buyer_business_name || null,
            ntn_cnic: buyer_ntn_cnic || null,
            gst_number: buyer_gst_number || null,
            address: buyer_address || null,
            province: buyer_province || null,
            registration_type: buyer_registration_type || 'Unregistered',
            is_active: true,
          })
          .select()
          .single();
        
        if (!customerError && newCustomer) {
          final_customer_id = newCustomer.id;
          console.log('Auto-saved customer:', newCustomer.id);
        }
      } else {
        final_customer_id = existingCustomer.id;
        console.log('Using existing customer:', existingCustomer.id);
      }
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach((item: any) => {
      const lineTotal = parseFloat(item.unit_price) * parseFloat(item.quantity);
      subtotal += lineTotal;
    });

    const sales_tax_amount = sales_tax_rate ? (subtotal * parseFloat(sales_tax_rate)) / 100 : 0;
    const further_tax_amount = further_tax_rate ? (subtotal * parseFloat(further_tax_rate)) / 100 : 0;
    const total_amount = subtotal + sales_tax_amount + further_tax_amount;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id,
        customer_id: final_customer_id || null,
        invoice_number,
        po_number: po_number || null,
        invoice_date,
        invoice_type,
        scenario,
        buyer_name,
        buyer_business_name,
        buyer_ntn_cnic,
        buyer_gst_number: buyer_gst_number || null,
        buyer_address,
        buyer_province,
        buyer_registration_type: buyer_registration_type || 'Unregistered',
        subtotal: subtotal.toFixed(2),
        sales_tax_rate: sales_tax_rate || null,
        sales_tax_amount: sales_tax_amount.toFixed(2),
        further_tax_rate: further_tax_rate || null,
        further_tax_amount: further_tax_amount.toFixed(2),
        total_amount: total_amount.toFixed(2),
        status: 'draft',
        payment_status: payment_status || 'pending',
        notes: notes || null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    // Create invoice items
    const invoiceItems = items.map((item: any) => ({
      invoice_id: invoice.id,
      product_id: item.product_id || null,
      item_name: item.item_name,
      hs_code: item.hs_code,
      uom: item.uom,
      unit_price: parseFloat(item.unit_price).toFixed(2),
      quantity: parseFloat(item.quantity).toFixed(2),
      line_total: (parseFloat(item.unit_price) * parseFloat(item.quantity)).toFixed(2),
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError);
      // Rollback: delete the invoice
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Update product stock if product_id is provided
    for (const item of items) {
      if (item.product_id) {
        // Get current stock
        const { data: product } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = parseFloat(product.current_stock) - parseFloat(item.quantity);

          // Update stock
          await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', item.product_id);

          // Create stock history
          await supabase.from('stock_history').insert({
            product_id: item.product_id,
            company_id,
            change_type: 'out',
            quantity: parseFloat(item.quantity),
            reason: `Sale - Invoice ${invoice_number}`,
            previous_stock: parseFloat(product.current_stock),
            new_stock: newStock,
          });
        }
      }
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/seller/invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

