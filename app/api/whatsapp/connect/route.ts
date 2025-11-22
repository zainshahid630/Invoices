import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Validate phone number format
    if (cleanNumber.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Check if settings already exist
    const { data: existing } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'whatsapp_number')
      .single();

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('system_settings')
        .update({
          value: cleanNumber,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'whatsapp_number');

      if (updateError) {
        console.error('Error updating WhatsApp number:', updateError);
        return NextResponse.json(
          { error: 'Failed to update WhatsApp number' },
          { status: 500 }
        );
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert({
          key: 'whatsapp_number',
          value: cleanNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error saving WhatsApp number:', insertError);
        return NextResponse.json(
          { error: 'Failed to save WhatsApp number' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      status: 'connected',
      phoneNumber: cleanNumber,
      message: 'WhatsApp number registered successfully'
    });

  } catch (error: any) {
    console.error('Error registering WhatsApp:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register WhatsApp number' },
      { status: 500 }
    );
  }
}
