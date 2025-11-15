import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSubscription } from '@/lib/subscription-check';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all customers for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Error in GET /api/seller/customers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      name,
      business_name,
      address,
      ntn_cnic,
      gst_number,
      province,
      registration_type,
    } = body;

    // Validation
    if (!company_id || !name) {
      return NextResponse.json(
        { error: 'Company ID and Customer Name are required' },
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

    // Check for duplicate NTN/CNIC within the same company
    if (ntn_cnic) {
      const { data: existingNTN, error: ntnError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('company_id', company_id)
        .eq('ntn_cnic', ntn_cnic)
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

    // Check for duplicate GST Number within the same company
    if (gst_number) {
      const { data: existingGST, error: gstError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('company_id', company_id)
        .eq('gst_number', gst_number)
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

    // Create customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        company_id,
        name,
        business_name,
        address,
        ntn_cnic,
        gst_number,
        province,
        registration_type: registration_type || 'Unregistered',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/seller/customers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

