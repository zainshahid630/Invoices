'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * React Query Provider for the entire application
 * Provides caching, deduplication, and automatic refetching
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance per request
  // This ensures no data leaks between users in SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache data for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Don't refetch on window focus (can be annoying)
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Don't refetch on mount if data exists
            refetchOnMount: false,
            // Retry failed requests once
            retry: 1,
            // Only fetch when online
            networkMode: 'online',
          },
          mutations: {
            // Don't retry mutations
            retry: 0,
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development */}
      {/* Temporarily disabled - uncomment to enable */}
      {/* {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )} */}
    </QueryClientProvider>
  );
}
