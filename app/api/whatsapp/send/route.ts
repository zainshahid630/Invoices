import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

export async function POST(request: Request) {
  try {
    const { phoneNumber, message, invoiceUrl } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Get WhatsApp sender number from database
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .single();

    if (!settings) {
      return NextResponse.json(
        { error: 'WhatsApp not configured. Please register your number first.' },
        { status: 400 }
      );
    }

    // Build WhatsApp message
    let fullMessage = message;
    if (invoiceUrl) {
      fullMessage += `\n\nView Invoice: ${invoiceUrl}`;
    }

    // Generate WA.me link
    const waLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(fullMessage)}`;

    return NextResponse.json({
      success: true,
      waLink,
      message: 'WhatsApp link generated successfully'
    });

  } catch (error: any) {
    console.error('Error generating WhatsApp link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate WhatsApp link' },
      { status: 500 }
    );
  }
}
