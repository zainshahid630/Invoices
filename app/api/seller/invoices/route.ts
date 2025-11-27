import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { checkSubscription } from '@/lib/subscription-check';

const supabase = getSupabaseServer();

// OPTIMIZED: Generate invoice number using settings: PREFIX + COUNTER
// This function finds the next available invoice number in ONE database query
async function generateInvoiceNumber(companyId: string): Promise<string> {
  // Get company settings
  const { data: settings } = await supabase
    .from('settings')
    .select('invoice_prefix, invoice_counter')
    .eq('company_id', companyId)
    .single();

  const prefix = settings?.invoice_prefix || 'INV';
  const counter = settings?.invoice_counter || 1;

  // Get all used invoice numbers in ONE query (instead of 100+ queries)
  const { data: usedInvoices } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('company_id', companyId)
    .like('invoice_number', `${prefix}%`)
    .is('deleted_at', null);

  // Extract numeric parts and create a Set for O(1) lookup
  const usedNumbers = new Set(
    (usedInvoices || [])
      .map(inv => {
        const numPart = inv.invoice_number.replace(prefix, '');
        return parseInt(numPart) || 0;
      })
      .filter(num => num > 0)
  );

  // Find first available number starting from counter
  let nextNum = counter;
  while (usedNumbers.has(nextNum) && nextNum < counter + 1000) {
    nextNum++;
  }

  return `${prefix}${nextNum}`;
}

// Increment the invoice counter after successful invoice creation
async function incrementInvoiceCounter(companyId: string, invoiceNumber: string): Promise<void> {
  // Extract the numeric part from the invoice number
  const { data: settings } = await supabase
    .from('settings')
    .select('invoice_prefix, invoice_counter')
    .eq('company_id', companyId)
    .single();

  const prefix = settings?.invoice_prefix || 'INV';
  const numericPart = invoiceNumber.replace(prefix, '');
  const usedCounter = parseInt(numericPart) || settings?.invoice_counter || 1;

  // Only increment if the used counter is >= current counter
  if (usedCounter >= (settings?.invoice_counter || 1)) {
    await supabase
      .from('settings')
      .update({ invoice_counter: usedCounter + 1 })
      .eq('company_id', companyId);
  }
}

// GET - List all invoices for a company with server-side pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const buyer = searchParams.get('buyer') || '';
    const invoiceNumberFrom = searchParams.get('invoice_number_from') || '';
    const invoiceNumberTo = searchParams.get('invoice_number_to') || '';

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, name, business_name)
      `, { count: 'exact' })
      .eq('company_id', company_id)
      .is('deleted_at', null); // Exclude deleted invoices

    // Apply search filter
    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,buyer_name.ilike.%${search}%`);
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply date range filter
    if (dateFrom) {
      query = query.gte('invoice_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('invoice_date', dateTo);
    }

    // Apply buyer filter
    if (buyer) {
      query = query.or(`buyer_name.ilike.%${buyer}%,buyer_business_name.ilike.%${buyer}%`);
    }

    // Apply invoice number range filter
    if (invoiceNumberFrom) {
      query = query.gte('invoice_number', invoiceNumberFrom);
    }
    if (invoiceNumberTo) {
      query = query.lte('invoice_number', invoiceNumberTo);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // OPTIMIZED: Get stats using database aggregation (single efficient query)
    // This is much faster than fetching all invoices and calculating in JavaScript
    const { data: statsData } = await supabase
      .rpc('get_invoice_stats_optimized', { p_company_id: company_id });

    // Fallback to manual calculation if RPC function doesn't exist yet
    let stats;
    if (statsData && statsData.length > 0) {
      stats = statsData[0];
    } else {
      // Fallback: Use aggregation query instead of fetching all records
      const { data: allInvoices } = await supabase
        .from('invoices')
        .select('status, payment_status, total_amount')
        .eq('company_id', company_id)
        .is('deleted_at', null);

      stats = {
        total: allInvoices?.length || 0,
        draft: allInvoices?.filter(i => i.status === 'draft').length || 0,
        posted: allInvoices?.filter(i => i.status === 'fbr_posted').length || 0,
        verified: allInvoices?.filter(i => i.status === 'verified').length || 0,
        totalAmount: allInvoices?.reduce((sum, i) => sum + parseFloat(i.total_amount.toString()), 0) || 0,
        pendingAmount: allInvoices?.filter(i => i.payment_status === 'pending' || i.payment_status === 'partial')
          .reduce((sum, i) => sum + parseFloat(i.total_amount.toString()), 0) || 0,
      };
    }

    return NextResponse.json({
      invoices: invoices || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
    });
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
      dc_code, // Delivery Challan code
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
    if (!company_id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!invoice_date) {
      return NextResponse.json(
        { error: 'Invoice date is required' },
        { status: 400 }
      );
    }

    if (!invoice_type) {
      return NextResponse.json(
        { error: 'Invoice type is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    if (!buyer_name || buyer_name.trim() === '') {
      return NextResponse.json(
        { error: 'Buyer name is required' },
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

    // Check if invoice number already exists in THIS company
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('company_id', company_id)
      .eq('invoice_number', invoice_number)
      .single();

    if (existingInvoice) {
      return NextResponse.json(
        { error: `Invoice number ${invoice_number} already exists in your company. Please use a different number.` },
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
            address: (buyer_address && buyer_address.trim() !== '') ? buyer_address : null,
            province: buyer_province || null,
            registration_type: buyer_registration_type || 'Unregistered',
            is_active: true,
          })
          .select()
          .single();

        if (customerError) {
          console.error('Error creating customer:', customerError);
          return NextResponse.json(
            { error: `Failed to create customer: ${customerError.message}` },
            { status: 500 }
          );
        }

        if (newCustomer) {
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
        dc_code: dc_code || null,
        invoice_date,
        invoice_type,
        scenario,
        buyer_name,
        buyer_business_name,
        buyer_ntn_cnic,
        buyer_gst_number: buyer_gst_number || null,
        buyer_address: (buyer_address && buyer_address.trim() !== '') ? buyer_address : null,
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

      // Provide more specific error messages
      let errorMessage = invoiceError.message;
      if (invoiceError.code === '23502') {
        // Not null violation
        const match = invoiceError.message.match(/column "([^"]+)"/);
        if (match) {
          const columnName = match[1];
          const fieldNames: Record<string, string> = {
            'buyer_name': 'Buyer name',
            'invoice_date': 'Invoice date',
            'invoice_type': 'Invoice type',
            'buyer_province': 'Buyer province',
          };
          errorMessage = `${fieldNames[columnName] || columnName} is required`;
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Create invoice items
    const invoiceItems = items.map((item: any) => ({
      invoice_id: invoice.id,
      product_id: item.product_id || null,
      item_name: item.item_name,
      hs_code: item.hs_code || '',
      uom: item.uom || 'Numbers, pieces, units',
      sale_type: item.sale_type || 'Goods at standard rate (default)',
      unit_price: parseFloat(item.unit_price).toFixed(2),
      quantity: parseFloat(item.quantity).toFixed(2),
      line_total: (parseFloat(item.unit_price) * parseFloat(item.quantity)).toFixed(2),
    }));

    console.log('📦 Creating invoice items:', JSON.stringify(invoiceItems, null, 2));

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

    // Increment the invoice counter ONLY after successful invoice creation
    await incrementInvoiceCounter(company_id, invoice_number);

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/seller/invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

