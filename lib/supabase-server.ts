import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance for server-side Supabase client
let supabaseServerClient: SupabaseClient | null = null;

/**
 * Get or create a singleton Supabase server client
 * This prevents creating a new client on every API request
 * 
 * @returns SupabaseClient instance
 */
export function getSupabaseServer(): SupabaseClient {
  if (!supabaseServerClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseServerClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false, // Server-side doesn't need session persistence
        autoRefreshToken: false,
      },
    });

    console.log('✅ Supabase server client initialized');
  }

  return supabaseServerClient;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetSupabaseServer(): void {
  supabaseServerClient = null;
}
