/**
 * Request Deduplication Utility
 * 
 * Prevents duplicate API calls by caching in-flight requests
 * and returning the same promise for identical requests.
 * 
 * This solves the React 18 Strict Mode double-render issue
 * and prevents unnecessary duplicate API calls.
 */

interface CacheEntry {
  promise: Promise<any>;
  timestamp: number;
  abortController: AbortController;
}

class RequestDeduplicator {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 1000; // 1 second

  /**
   * Generate cache key from request parameters
   */
  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup() {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Deduplicated fetch request
   */
  async fetch<T = any>(
    url: string,
    options?: RequestInit,
    config?: {
      skipDeduplication?: boolean;
      cacheDuration?: number;
    }
  ): Promise<T> {
    // Skip deduplication if requested (for mutations)
    if (config?.skipDeduplication || options?.method === 'POST' || options?.method === 'PUT' || options?.method === 'DELETE') {
      return this.executeFetch(url, options);
    }

    const cacheKey = this.getCacheKey(url, options);
    const cached = this.cache.get(cacheKey);

    // Return cached promise if still valid
    if (cached) {
      const age = Date.now() - cached.timestamp;
      const maxAge = config?.cacheDuration || this.CACHE_DURATION;

      if (age < maxAge) {
        console.log(`🔄 Returning cached request: ${url}`);
        return cached.promise;
      } else {
        // Abort old request
        cached.abortController.abort();
        this.cache.delete(cacheKey);
      }
    }

    // Create new request
    const abortController = new AbortController();
    const promise = this.executeFetch<T>(url, {
      ...options,
      signal: abortController.signal,
    });

    // Cache the promise
    this.cache.set(cacheKey, {
      promise,
      timestamp: Date.now(),
      abortController,
    });

    // Clean up after request completes
    promise
      .then(() => {
        setTimeout(() => this.cache.delete(cacheKey), this.CACHE_DURATION);
      })
      .catch(() => {
        this.cache.delete(cacheKey);
      });

    // Periodic cleanup
    this.cleanup();

    return promise;
  }

  /**
   * Execute actual fetch request
   */
  private async executeFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Clear all cached requests
   */
  clearCache() {
    // Abort all in-flight requests
    Array.from(this.cache.values()).forEach((entry) => {
      entry.abortController.abort();
    });
    this.cache.clear();
  }

  /**
   * Clear specific request from cache
   */
  clearRequest(url: string, options?: RequestInit) {
    const cacheKey = this.getCacheKey(url, options);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.abortController.abort();
      this.cache.delete(cacheKey);
    }
  }
}

// Export singleton instance
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Deduplicated fetch wrapper
 * 
 * Usage:
 * const data = await deduplicatedFetch('/api/invoices?company_id=123');
 */
export async function deduplicatedFetch<T = any>(
  url: string,
  options?: RequestInit,
  config?: {
    skipDeduplication?: boolean;
    cacheDuration?: number;
  }
): Promise<T> {
  return requestDeduplicator.fetch<T>(url, options, config);
}

/**
 * Clear request cache
 */
export function clearRequestCache(url?: string, options?: RequestInit) {
  if (url) {
    requestDeduplicator.clearRequest(url, options);
  } else {
    requestDeduplicator.clearCache();
  }
}
