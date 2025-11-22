/**
 * API Cache Manager
 * Prevents duplicate API calls and caches responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from URL and options
   */
  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<any>, ttl: number): boolean {
    return Date.now() - entry.timestamp < ttl;
  }

  /**
   * Fetch with caching and deduplication
   */
  async fetch<T = any>(
    url: string,
    options?: RequestInit,
    config?: {
      ttl?: number;
      skipCache?: boolean;
    }
  ): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);
    const ttl = config?.ttl || this.DEFAULT_TTL;

    // Skip cache for mutations
    if (options?.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      return this.executeFetch<T>(url, options);
    }

    // Skip cache if requested
    if (config?.skipCache) {
      return this.executeFetch<T>(url, options);
    }

    // Return cached data if valid
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValid(cached, ttl)) {
      console.log(`📦 Cache HIT: ${url}`);
      return cached.data;
    }

    // Return pending request if exists (deduplication)
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      console.log(`⏳ Deduplicating: ${url}`);
      return pending;
    }

    // Execute new request
    console.log(`🌐 Cache MISS: ${url}`);
    const promise = this.executeFetch<T>(url, options);
    
    // Store pending request
    this.pendingRequests.set(cacheKey, promise);

    try {
      const data = await promise;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } finally {
      // Remove from pending
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute actual fetch
   */
  private async executeFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Invalidate cache for specific URL pattern
   */
  invalidate(pattern: string | RegExp) {
    const keysToDelete: string[] = [];
    const cacheKeys = Array.from(this.cache.keys());

    for (const key of cacheKeys) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      } else {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// Export singleton instance
export const apiCache = new APICache();

/**
 * Cached fetch wrapper
 * 
 * Usage:
 * const data = await cachedFetch('/api/invoices?company_id=123');
 */
export async function cachedFetch<T = any>(
  url: string,
  options?: RequestInit,
  config?: {
    ttl?: number;
    skipCache?: boolean;
  }
): Promise<T> {
  return apiCache.fetch<T>(url, options, config);
}

/**
 * Invalidate cache
 */
export function invalidateCache(pattern: string | RegExp) {
  apiCache.invalidate(pattern);
}

/**
 * Clear all cache
 */
export function clearCache() {
  apiCache.clear();
}
