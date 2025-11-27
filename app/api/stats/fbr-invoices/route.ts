import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { cachedJsonResponse, CachePresets } from '@/lib/api-response-cache';

// OPTIMIZED: Cache for 5 minutes instead of force-dynamic
export const revalidate = 300; // 5 minutes

// In-memory cache for stats (fallback if response caching doesn't work)
let statsCache: {
  data: { fbrCount: number; totalCount: number; companiesCount: number } | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET - Get count of FBR posted invoices and total invoices
export async function GET() {
  try {
    // Check in-memory cache first
    const now = Date.now();
    if (statsCache.data && (now - statsCache.timestamp) < CACHE_TTL) {
      console.log('📦 Stats cache HIT');
      return cachedJsonResponse(statsCache.data, {
        ...CachePresets.MEDIUM,
        public: true, // Allow CDN caching
      });
    }

    console.log('🌐 Stats cache MISS - fetching from DB');
    const supabase = getSupabaseServer();
    
    // Run all queries in parallel for better performance
    const [fbrResult, totalResult, companiesResult] = await Promise.all([
      // Count all invoices with status 'fbr_posted'
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'fbr_posted')
        .is('deleted_at', null),
      
      // Count all invoices (total generated)
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null),
      
      // Count total companies/businesses
      supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
    ]);

    if (fbrResult.error) {
      console.error('Error fetching FBR invoice count:', fbrResult.error);
    }
    if (totalResult.error) {
      console.error('Error fetching total invoice count:', totalResult.error);
    }
    if (companiesResult.error) {
      console.error('Error fetching companies count:', companiesResult.error);
    }

    const data = {
      fbrCount: fbrResult.count || 0,
      totalCount: totalResult.count || 0,
      companiesCount: companiesResult.count || 0
    };

    // Update in-memory cache
    statsCache = {
      data,
      timestamp: now,
    };

    return cachedJsonResponse(data, {
      ...CachePresets.MEDIUM,
      public: true, // Allow CDN caching
    });
  } catch (error: any) {
    console.error('Error in FBR stats API:', error);
    
    // Return cached data if available, even if stale
    if (statsCache.data) {
      console.log('⚠️ Returning stale cache due to error');
      return cachedJsonResponse(statsCache.data, CachePresets.SHORT);
    }
    
    return cachedJsonResponse({ 
      fbrCount: 0,
      totalCount: 0,
      companiesCount: 0
    }, CachePresets.NO_CACHE);
  }
}
