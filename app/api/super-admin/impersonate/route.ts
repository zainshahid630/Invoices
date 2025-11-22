import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    if (!company.is_active) {
      return NextResponse.json(
        { success: false, error: 'Company is inactive' },
        { status: 403 }
      );
    }

    // Get the first admin user for this company
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('role', 'admin')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'No active admin user found for this company' },
        { status: 404 }
      );
    }

    // Create session data for impersonation
    const sessionData = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: 'seller_admin',
      company_id: companyId,
      impersonated: true, // Flag to indicate this is an impersonation session
    };

    return NextResponse.json({
      success: true,
      session: sessionData,
      company: {
        id: company.id,
        name: company.name,
        business_name: company.business_name,
      },
    });
  } catch (error) {
    console.error('Error impersonating company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to impersonate company' },
      { status: 500 }
    );
  }
}
