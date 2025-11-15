import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get WhatsApp number from database
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .single();

    if (error || !data) {
      return NextResponse.json({
        status: 'disconnected',
        phoneNumber: null,
      });
    }
    
    return NextResponse.json({
      status: 'connected',
      phoneNumber: data.value,
    });
  } catch (error: any) {
    console.error('Error getting WhatsApp status:', error);
    return NextResponse.json({
      status: 'disconnected',
      phoneNumber: null,
    });
  }
}
