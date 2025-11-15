import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET subscription for logged-in seller's company
export async function GET(request: NextRequest) {
  try {
    // Get user session from localStorage (passed via headers or cookies)
    const authHeader = request.headers.get('authorization');
    
    // For now, we'll get company_id from the session stored in localStorage
    // In a production app, you'd validate the JWT token here
    
    // Try to get company_id from query params (temporary solution)
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    
    if (!companyId) {
      // Try to get from cookie or session
      const cookieHeader = request.headers.get('cookie');
      const sessionCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('seller_session='));
      
      if (!sessionCookie) {
        return NextResponse.json(
          { success: false, error: 'Not authenticated' },
          { status: 401 }
        );
      }
      
      // Parse session from cookie
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]));
        const company_id = sessionData.company_id;
        
        if (!company_id) {
          return NextResponse.json(
            { success: false, error: 'Company ID not found in session' },
            { status: 400 }
          );
        }
        
        return await fetchSubscription(company_id);
      } catch (e) {
        // If cookie parsing fails, try localStorage approach
        return NextResponse.json(
          { success: false, error: 'Invalid session' },
          { status: 401 }
        );
      }
    }
    
    return await fetchSubscription(companyId);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function fetchSubscription(companyId: string) {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned"
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    success: true, 
    subscription: subscription || null 
  });
}
