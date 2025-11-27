import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Fetch commercial invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get commercial invoice
    const { data: commercialInvoice, error: invoiceError } = await supabase
      .from('commercial_invoices')
      .select('*')
      .eq('invoice_id', params.id)
      .eq('company_id', companyId)
      .single();

    if (invoiceError) {
      if (invoiceError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Commercial invoice not found' },
          { status: 404 }
        );
      }
      throw invoiceError;
    }

    // Get commercial invoice items
    const { data: items, error: itemsError } = await supabase
      .from('commercial_invoice_items')
      .select('*')
      .eq('commercial_invoice_id', commercialInvoice.id)
      .order('item_order', { ascending: true });

    if (itemsError) throw itemsError;

    // Get original invoice for reference
    const { data: originalInvoice, error: originalError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .single();

    if (originalError) throw originalError;

    return NextResponse.json({
      commercialInvoice,
      items: items || [],
      originalInvoice
    });
  } catch (error) {
    console.error('Error fetching commercial invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commercial invoice' },
      { status: 500 }
    );
  }
}

// POST - Create commercial invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      company_id,
      buyer_name,
      buyer_business_name,
      buyer_address,
      buyer_country,
      buyer_tax_id,
      items,
      notes
    } = body;

    if (!company_id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!buyer_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Buyer name and items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach((item: any) => {
      const lineTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      subtotal += lineTotal;
    });

    // Generate commercial invoice number
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('id', params.id)
      .single();

    const originalInvoiceNumber = invoiceData?.invoice_number || '';
    const commercialInvoiceNumber = `CI-${originalInvoiceNumber}`;

    // Create commercial invoice
    const { data: commercialInvoice, error: createError } = await supabase
      .from('commercial_invoices')
      .insert({
        invoice_id: params.id,
        company_id: company_id,
        commercial_invoice_number: commercialInvoiceNumber,
        buyer_name: buyer_name,
        buyer_business_name: buyer_business_name || null,
        buyer_address: buyer_address || null,
        buyer_country: buyer_country || null,
        buyer_tax_id: buyer_tax_id || null,
        subtotal: subtotal,
        total_amount: subtotal,
        notes: notes || null
      })
      .select()
      .single();

    if (createError) {
      // Check for unique constraint violation
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Commercial invoice already exists for this invoice' },
          { status: 409 }
        );
      }
      throw createError;
    }

    // Create commercial invoice items
    const itemsToInsert = items.map((item: any, index: number) => {
      const lineTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      return {
        commercial_invoice_id: commercialInvoice.id,
        description: item.description,
        hs_code: item.hs_code,
        uom: item.uom,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: lineTotal,
        original_item_id: item.original_item_id || null,
        item_order: index
      };
    });

    const { error: itemsError } = await supabase
      .from('commercial_invoice_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      success: true,
      commercialInvoiceId: commercialInvoice.id,
      commercialInvoiceNumber: commercialInvoiceNumber
    });
  } catch (error: any) {
    console.error('Error creating commercial invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create commercial invoice' },
      { status: 500 }
    );
  }
}

// PUT - Update commercial invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      company_id,
      buyer_name,
      buyer_business_name,
      buyer_address,
      buyer_country,
      buyer_tax_id,
      items,
      notes
    } = body;

    if (!company_id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get existing commercial invoice
    const { data: existing, error: fetchError } = await supabase
      .from('commercial_invoices')
      .select('id')
      .eq('invoice_id', params.id)
      .eq('company_id', company_id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Commercial invoice not found' },
        { status: 404 }
      );
    }

    const commercialInvoiceId = existing.id;

    // Calculate totals
    let subtotal = 0;
    items.forEach((item: any) => {
      const lineTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      subtotal += lineTotal;
    });

    // Update commercial invoice
    const { error: updateError } = await supabase
      .from('commercial_invoices')
      .update({
        buyer_name: buyer_name,
        buyer_business_name: buyer_business_name || null,
        buyer_address: buyer_address || null,
        buyer_country: buyer_country || null,
        buyer_tax_id: buyer_tax_id || null,
        subtotal: subtotal,
        total_amount: subtotal,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', commercialInvoiceId);

    if (updateError) throw updateError;

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('commercial_invoice_items')
      .delete()
      .eq('commercial_invoice_id', commercialInvoiceId);

    if (deleteError) throw deleteError;

    // Create new items
    const itemsToInsert = items.map((item: any, index: number) => {
      const lineTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      return {
        commercial_invoice_id: commercialInvoiceId,
        description: item.description,
        hs_code: item.hs_code,
        uom: item.uom,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: lineTotal,
        original_item_id: item.original_item_id || null,
        item_order: index
      };
    });

    const { error: itemsError } = await supabase
      .from('commercial_invoice_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      success: true,
      message: 'Commercial invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating commercial invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update commercial invoice' },
      { status: 500 }
    );
  }
}

// DELETE - Delete commercial invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Delete commercial invoice (items will be cascade deleted)
    const { data, error } = await supabase
      .from('commercial_invoices')
      .delete()
      .eq('invoice_id', params.id)
      .eq('company_id', companyId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Commercial invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Commercial invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting commercial invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete commercial invoice' },
      { status: 500 }
    );
  }
}
