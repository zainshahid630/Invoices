import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Get company settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError) {
      console.error('Error fetching company:', companyError);
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    // Get settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('company_id', company_id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching settings:', settingsError);
      return NextResponse.json({ error: settingsError.message }, { status: 500 });
    }

    // If no settings exist, create default settings
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('settings')
        .insert({
          company_id,
          invoice_prefix: 'INV',
          invoice_counter: 1,
          default_sales_tax_rate: 18.0,
          default_further_tax_rate: 0.0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating settings:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      return NextResponse.json({ company, settings: newSettings });
    }

    return NextResponse.json({ company, settings });
  } catch (error: any) {
    console.error('Error in GET /api/seller/settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update company and settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, company_data, settings_data } = body;

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Update company if company_data provided
    if (company_data) {
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          ...company_data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company_id);

      if (companyError) {
        console.error('Error updating company:', companyError);
        return NextResponse.json({ error: companyError.message }, { status: 500 });
      }
    }

    // Update settings if settings_data provided
    if (settings_data) {
      const { error: settingsError } = await supabase
        .from('settings')
        .update({
          ...settings_data,
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', company_id);

      if (settingsError) {
        console.error('Error updating settings:', settingsError);
        return NextResponse.json({ error: settingsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('Error in PATCH /api/seller/settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

