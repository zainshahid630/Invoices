import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Get a single customer
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

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', company_id)
      .single();

    if (error) {
      console.error('Error fetching customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error in GET /api/seller/customers/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update a customer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      company_id,
      name,
      business_name,
      address,
      ntn_cnic,
      gst_number,
      phone,
      province,
      registration_type,
      is_active,
    } = body;

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Check for duplicate NTN/CNIC (excluding current customer)
    if (ntn_cnic) {
      const { data: existingNTN, error: ntnError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('company_id', company_id)
        .eq('ntn_cnic', ntn_cnic)
        .neq('id', params.id)
        .single();

      if (existingNTN) {
        return NextResponse.json(
          { 
            error: `NTN Number/CNIC already exists for customer: ${existingNTN.name}`,
            field: 'ntn_cnic'
          },
          { status: 409 }
        );
      }
    }

    // Check for duplicate GST Number (excluding current customer)
    if (gst_number) {
      const { data: existingGST, error: gstError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('company_id', company_id)
        .eq('gst_number', gst_number)
        .neq('id', params.id)
        .single();

      if (existingGST) {
        return NextResponse.json(
          { 
            error: `GST Number already exists for customer: ${existingGST.name}`,
            field: 'gst_number'
          },
          { status: 409 }
        );
      }
    }

    // Update customer
    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        name,
        business_name,
        address,
        ntn_cnic,
        gst_number,
        phone,
        province,
        registration_type,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('company_id', company_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error in PATCH /api/seller/customers/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a customer
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

    // Check if customer has invoices
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('customer_id', params.id)
      .limit(1);

    if (invoiceError) {
      console.error('Error checking invoices:', invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    if (invoices && invoices.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing invoices. Deactivate instead.' },
        { status: 400 }
      );
    }

    // Delete customer
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', params.id)
      .eq('company_id', company_id);

    if (error) {
      console.error('Error deleting customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/seller/customers/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

