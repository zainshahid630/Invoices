/**
 * Server-Side Cache Manager for API Routes
 * Uses Next.js unstable_cache for server-side caching
 */

import { unstable_cache } from 'next/cache';

interface CacheConfig {
  revalidate?: number; // seconds
  tags?: string[];
}

/**
 * Create a cached version of an async function
 * 
 * @example
 * const getCachedInvoices = createCachedFunction(
 *   async (companyId: string) => {
 *     return await db.invoices.findMany({ where: { companyId } });
 *   },
 *   ['invoices'],
 *   { revalidate: 60 }
 * );
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  config?: CacheConfig
): T {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: config?.revalidate,
      tags: config?.tags,
    }
  ) as T;
}

/**
 * Cache tags for different data types
 */
export const CacheTags = {
  INVOICES: 'invoices',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  PAYMENTS: 'payments',
  SETTINGS: 'settings',
  STATS: 'stats',
  REPORTS: 'reports',
} as const;

/**
 * Cache durations (in seconds)
 */
export const CacheDurations = {
  SHORT: 30,        // 30 seconds - frequently changing data
  MEDIUM: 300,      // 5 minutes - moderate changes
  LONG: 3600,       // 1 hour - rarely changing data
  VERY_LONG: 86400, // 24 hours - static data
} as const;

/**
 * Helper to create cache key from parameters
 */
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}

/**
 * Revalidate cache by tag
 * Use this after mutations to invalidate related caches
 */
export async function revalidateByTag(tag: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(tag);
}

/**
 * Revalidate cache by path
 */
export async function revalidateByPath(path: string) {
  const { revalidatePath } = await import('next/cache');
  revalidatePath(path);
}
