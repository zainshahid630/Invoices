import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET all companies
export async function GET() {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        *,
        subscriptions (
          status,
          end_date,
          payment_status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      business_name,
      address,
      ntn_number,
      gst_number,
      fbr_token,
    } = body;

    if (!name || !business_name) {
      return NextResponse.json(
        { success: false, error: 'Name and business name are required' },
        { status: 400 }
      );
    }

    // Check if NTN number already exists (if provided)
    if (ntn_number && ntn_number.trim() !== '') {
      const { data: existingCompanies } = await supabase
        .from('companies')
        .select('id, business_name')
        .eq('ntn_number', ntn_number.trim());

      if (existingCompanies && existingCompanies.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `NTN number ${ntn_number} is already registered to ${existingCompanies[0].business_name}` 
          },
          { status: 400 }
        );
      }
    }

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name,
        business_name,
        address,
        ntn_number,
        gst_number,
        fbr_token,
        is_active: true,
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      return NextResponse.json(
        { success: false, error: 'Failed to create company' },
        { status: 500 }
      );
    }

    // Create default settings for the company
    await supabase.from('settings').insert({
      company_id: company.id,
      invoice_prefix: 'INV',
      invoice_counter: 1,
      default_sales_tax_rate: 18.0,
      default_further_tax_rate: 0.0,
    });

    // Create default feature toggles
    const features = [
      'inventory_management',
      'customer_management',
      'invoice_creation',
      'fbr_integration',
      'payment_tracking',
      'whatsapp_integration',
      'email_integration',
    ];

    await supabase.from('feature_toggles').insert(
      features.map((feature) => ({
        company_id: company.id,
        feature_name: feature,
        is_enabled: true,
      }))
    );

    // Create 7-day free trial subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

    await supabase.from('subscriptions').insert({
      company_id: company.id,
      start_date: new Date().toISOString(),
      end_date: trialEndDate.toISOString(),
      status: 'active',
      payment_status: 'trial',
      amount: 0,
    });

    return NextResponse.json({ 
      success: true, 
      company,
      trial_end_date: trialEndDate.toISOString()
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

