import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function POST(request: NextRequest) {
  try {
    // Insert Excel template
    const { data, error } = await supabase
      .from('invoice_templates')
      .insert({
        name: 'Excel Template',
        description: 'Simple spreadsheet-style design optimized for black and white printing. Clean grid layout perfect for professional documentation.',
        template_key: 'excel',
        is_paid: false,
        price: 0.00,
        display_order: 6,
        is_active: true,
        features: [
          'Excel-style grid layout',
          'B&W print optimized',
          'Clean table design',
          'FBR logo & QR code',
          'Professional spreadsheet format',
          'Easy to read'
        ]
      })
      .select()
      .single();

    if (error) {
      // Check if it already exists
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Excel template already exists in the database',
            error: 'duplicate_key'
          },
          { status: 409 }
        );
      }
      
      console.error('Error inserting template:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to insert template', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Excel template added successfully!',
      data
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
