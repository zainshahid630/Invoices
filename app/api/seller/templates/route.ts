import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Get all templates with access info for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get all active templates
    const { data: templates, error: templatesError } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      return NextResponse.json({ error: templatesError.message }, { status: 500 });
    }

    // Get company's template access
    const { data: accessRecords, error: accessError } = await supabase
      .from('company_template_access')
      .select('template_id, is_active, expires_at')
      .eq('company_id', company_id)
      .eq('is_active', true);

    if (accessError) {
      console.error('Error fetching access records:', accessError);
      return NextResponse.json({ error: accessError.message }, { status: 500 });
    }

    // Create a map of template access
    const accessMap = new Map();
    accessRecords?.forEach((record) => {
      // Check if access is still valid (not expired)
      const isValid = !record.expires_at || new Date(record.expires_at) > new Date();
      if (isValid) {
        accessMap.set(record.template_id, true);
      }
    });

    // Combine templates with access info
    const templatesWithAccess = templates?.map((template) => ({
      ...template,
      has_access: !template.is_paid || accessMap.has(template.id),
    }));

    return NextResponse.json({ templates: templatesWithAccess });
  } catch (error: any) {
    console.error('Error in GET /api/seller/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

