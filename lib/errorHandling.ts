/**
 * Centralized Error Handling Utilities
 * 
 * Provides consistent error handling, retry logic, and user-friendly messages
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * API call with automatic retry and timeout
 */
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  config: {
    retries?: number;
    timeout?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    timeout = 15000,
    retryDelay = 1000,
  } = config;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new AuthenticationError(errorData.error || 'Authentication required');
        }
        
        if (response.status === 403) {
          throw new AuthorizationError(errorData.error || 'Permission denied');
        }
        
        if (response.status === 400) {
          throw new ValidationError(
            errorData.error || 'Validation failed',
            errorData.details
          );
        }

        throw new AppError(
          errorData.error || `Request failed with status ${response.status}`,
          errorData.code,
          response.status,
          errorData.details
        );
      }

      return await response.json();
    } catch (error: any) {
      lastError = error;

      // Don't retry on validation or auth errors
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }

      // Don't retry if it's the last attempt
      if (attempt === retries - 1) {
        break;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));

      console.log(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
    }
  }

  // All retries failed
  if (lastError) {
    if (lastError.name === 'AbortError') {
      throw new NetworkError('Request timeout');
    }
    throw lastError;
  }

  throw new NetworkError('Request failed');
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.name === 'AbortError') {
      return 'Request timeout. Please try again.';
    }
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Log error for monitoring
 */
export function logError(error: unknown, context?: string) {
  const errorInfo = {
    message: getErrorMessage(error),
    context,
    timestamp: new Date().toISOString(),
    ...(error instanceof AppError && {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    }),
  };

  console.error('Error:', errorInfo);

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, LogRocket, etc.
    // sendToMonitoring(errorInfo);
  }
}

/**
 * Async error boundary wrapper
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const message = getErrorMessage(error);
    logError(error, context);
    return { data: null, error: message };
  }
}
