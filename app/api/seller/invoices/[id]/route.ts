import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Get a single invoice with items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get invoice (exclude deleted)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, name, business_name, ntn_cnic, gst_number, address, province, registration_type)
      `)
      .eq('id', params.id)
      .eq('company_id', company_id)
      .is('deleted_at', null)
      .single();

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select(`
        *,
        product:products(id, name, hs_code, uom, unit_price)
      `)
      .eq('invoice_id', params.id)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('Error fetching invoice items:', itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ ...invoice, items: items || [] });
  } catch (error: any) {
    console.error('Error in GET /api/seller/invoices/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update invoice status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { company_id, status, payment_status } = body;

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', params.id)
      .eq('company_id', company_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error in PATCH /api/seller/invoices/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update an invoice (only draft invoices can be edited)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      company_id,
      customer_id,
      invoice_number,
      po_number,
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
      items,
    } = body;

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get current invoice to verify it exists and is editable
    const { data: currentInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, deleted_at')
      .eq('id', params.id)
      .eq('company_id', company_id)
      .single();

    if (fetchError || !currentInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (currentInvoice.deleted_at) {
      return NextResponse.json({ error: 'Cannot edit deleted invoice' }, { status: 400 });
    }

    if (currentInvoice.status !== 'draft' && currentInvoice.status !== 'verified') {
      return NextResponse.json({ 
        error: 'Only draft and verified invoices can be edited. Current status: ' + currentInvoice.status 
      }, { status: 400 });
    }

    // Check if invoice number is being changed and if it already exists
    if (invoice_number !== currentInvoice.invoice_number) {
      const { data: existingInvoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', invoice_number)
        .eq('company_id', company_id)
        .neq('id', params.id)
        .is('deleted_at', null);

      if (existingInvoices && existingInvoices.length > 0) {
        return NextResponse.json(
          { error: `Invoice number ${invoice_number} already exists. Please use a different number.` },
          { status: 409 }
        );
      }
    }

    // Validation
    if (!invoice_date || !invoice_type) {
      return NextResponse.json(
        { error: 'Invoice date and invoice type are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required. Items cannot be empty.' },
        { status: 400 }
      );
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.item_name || !item.unit_price || !item.quantity) {
        return NextResponse.json(
          { error: `Item ${i + 1} is missing required fields (item_name, unit_price, or quantity)` },
          { status: 400 }
        );
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

    // Update invoice
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        customer_id: customer_id || null,
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
        payment_status: payment_status || 'pending',
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('company_id', company_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Prepare new invoice items BEFORE deleting old ones
    const invoiceItems = items.map((item: any) => ({
      invoice_id: params.id,
      product_id: item.product_id || null,
      item_name: item.item_name,
      hs_code: item.hs_code || '',
      uom: item.uom,
      unit_price: parseFloat(item.unit_price).toFixed(2),
      quantity: parseFloat(item.quantity).toFixed(2),
      line_total: (parseFloat(item.unit_price) * parseFloat(item.quantity)).toFixed(2),
    }));

    console.log(`Updating invoice ${params.id} with ${invoiceItems.length} items`);

    // Delete existing invoice items
    const { error: deleteItemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', params.id);

    if (deleteItemsError) {
      console.error('Error deleting old invoice items:', deleteItemsError);
      return NextResponse.json({ 
        error: 'Failed to delete old items: ' + deleteItemsError.message 
      }, { status: 500 });
    }

    // Create new invoice items
    const { data: insertedItems, error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems)
      .select();

    if (itemsError) {
      console.error('Error creating new invoice items:', itemsError);
      console.error('Items that failed to insert:', invoiceItems);
      return NextResponse.json({ 
        error: 'Failed to create new items: ' + itemsError.message,
        details: 'Items were deleted but could not be recreated. Please try again.'
      }, { status: 500 });
    }

    console.log(`Successfully inserted ${insertedItems?.length || 0} items for invoice ${params.id}`);

    return NextResponse.json(updatedInvoice);
  } catch (error: any) {
    console.error('Error in PUT /api/seller/invoices/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Soft delete an invoice (mark as deleted)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get invoice to verify it exists
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, invoice_number, deleted_at')
      .eq('id', params.id)
      .eq('company_id', company_id)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.deleted_at) {
      return NextResponse.json({ error: 'Invoice is already deleted' }, { status: 400 });
    }

    // Soft delete: Set deleted_at timestamp
    const { error } = await supabase
      .from('invoices')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('company_id', company_id);

    if (error) {
      console.error('Error deleting invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/seller/invoices/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

