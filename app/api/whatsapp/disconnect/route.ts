import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Delete WhatsApp number from database
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('key', 'whatsapp_number');

    if (error) {
      console.error('Error removing WhatsApp number:', error);
      return NextResponse.json(
        { error: 'Failed to remove WhatsApp number' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'disconnected',
      message: 'WhatsApp number removed successfully'
    });

  } catch (error: any) {
    console.error('Error disconnecting WhatsApp:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect WhatsApp' },
      { status: 500 }
    );
  }
}
