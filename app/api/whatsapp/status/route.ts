import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

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
