/**
 * Fetch with automatic retry on network failures
 * Handles transient network errors, timeouts, and server errors
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
  onRetry: () => {},
};

/**
 * Check if error is retryable (network errors, timeouts, 5xx errors)
 */
function isRetryableError(error: any, response?: Response): boolean {
  // Network errors (no response)
  if (!response) {
    return true;
  }

  // Server errors (5xx)
  if (response.status >= 500 && response.status < 600) {
    return true;
  }

  // Rate limiting (429)
  if (response.status === 429) {
    return true;
  }

  // Timeout errors
  if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry and timeout
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const config = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      // Make request
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If response is ok or not retryable, return it
      if (response.ok || !isRetryableError(null, response)) {
        return response;
      }

      // Store error for potential retry
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

      // If this is the last attempt, return the response
      if (attempt === config.maxRetries) {
        return response;
      }

      // Retry
      config.onRetry(attempt + 1, lastError);
      await sleep(config.retryDelay * (attempt + 1)); // Exponential backoff

    } catch (error: any) {
      lastError = error;

      // If this is the last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Retry
      config.onRetry(attempt + 1, error);
      await sleep(config.retryDelay * (attempt + 1)); // Exponential backoff
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error('Request failed after retries');
}

/**
 * Fetch JSON with automatic retry
 */
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options, retryOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

/**
 * POST JSON with automatic retry
 */
export async function postJsonWithRetry<T = any>(
  url: string,
  data: any,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return fetchJsonWithRetry<T>(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    retryOptions
  );
}

/**
 * GET JSON with automatic retry
 */
export async function getJsonWithRetry<T = any>(
  url: string,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return fetchJsonWithRetry<T>(url, { method: 'GET' }, retryOptions);
}

/**
 * Create a retry callback that logs to console
 */
export function createRetryLogger(operationName: string = 'Request') {
  return (attempt: number, error: Error) => {
    console.log(`${operationName} - Retry attempt ${attempt}:`, error.message);
  };
}
