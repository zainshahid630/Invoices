import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get all templates (Super Admin)
export async function GET(request: NextRequest) {
  try {
    const { data: templates, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Error in GET /api/admin/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new template (Super Admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      template_key,
      preview_image_url,
      is_paid,
      price,
      display_order,
      features,
    } = body;

    if (!name || !template_key) {
      return NextResponse.json(
        { error: 'Name and template key are required' },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from('invoice_templates')
      .insert({
        name,
        description,
        template_key,
        preview_image_url,
        is_paid: is_paid || false,
        price: price || 0.0,
        display_order: display_order || 0,
        features: features || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template, message: 'Template created successfully' });
  } catch (error: any) {
    console.error('Error in POST /api/admin/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update template (Super Admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { data: template, error } = await supabase
      .from('invoice_templates')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template, message: 'Template updated successfully' });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete template (Super Admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('invoice_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

