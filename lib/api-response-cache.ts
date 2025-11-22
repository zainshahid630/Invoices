/**
 * API Response Cache Headers
 * Adds appropriate cache headers to API responses
 */

import { NextResponse } from 'next/server';

export interface CacheOptions {
  /**
   * Cache duration in seconds
   */
  maxAge?: number;
  
  /**
   * Stale-while-revalidate duration in seconds
   */
  staleWhileRevalidate?: number;
  
  /**
   * Whether the response can be cached by CDN/proxies
   */
  public?: boolean;
  
  /**
   * Whether to cache at all
   */
  noCache?: boolean;
}

/**
 * Add cache headers to a NextResponse
 */
export function withCacheHeaders(
  response: NextResponse,
  options: CacheOptions = {}
): NextResponse {
  const {
    maxAge = 0,
    staleWhileRevalidate = 0,
    public: isPublic = false,
    noCache = false,
  } = options;

  if (noCache) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  const cacheControl = [
    isPublic ? 'public' : 'private',
    `max-age=${maxAge}`,
    staleWhileRevalidate > 0 ? `stale-while-revalidate=${staleWhileRevalidate}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  response.headers.set('Cache-Control', cacheControl);
  return response;
}

/**
 * Create a cached JSON response
 */
export function cachedJsonResponse(
  data: any,
  options: CacheOptions & { status?: number } = {}
): NextResponse {
  const { status = 200, ...cacheOptions } = options;
  const response = NextResponse.json(data, { status });
  return withCacheHeaders(response, cacheOptions);
}

/**
 * Predefined cache configurations
 */
export const CachePresets = {
  /**
   * No caching - for mutations and sensitive data
   */
  NO_CACHE: {
    noCache: true,
  },

  /**
   * Short cache - 30 seconds
   * Good for: Real-time data, frequently changing content
   */
  SHORT: {
    maxAge: 30,
    staleWhileRevalidate: 60,
  },

  /**
   * Medium cache - 5 minutes
   * Good for: Dashboard stats, lists with moderate changes
   */
  MEDIUM: {
    maxAge: 300,
    staleWhileRevalidate: 600,
  },

  /**
   * Long cache - 1 hour
   * Good for: Settings, templates, rarely changing data
   */
  LONG: {
    maxAge: 3600,
    staleWhileRevalidate: 7200,
  },

  /**
   * Very long cache - 24 hours
   * Good for: Static data, configuration
   */
  VERY_LONG: {
    maxAge: 86400,
    staleWhileRevalidate: 172800,
  },
} as const;

/**
 * Helper to determine cache strategy based on HTTP method
 */
export function getCacheOptionsForMethod(method: string): CacheOptions {
  switch (method) {
    case 'GET':
      return CachePresets.MEDIUM;
    case 'POST':
    case 'PUT':
    case 'PATCH':
    case 'DELETE':
      return CachePresets.NO_CACHE;
    default:
      return CachePresets.NO_CACHE;
  }
}
