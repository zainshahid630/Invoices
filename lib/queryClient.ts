import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on reconnect
      refetchOnMount: false, // Don't refetch on component mount if data exists
      retry: 1, // Retry failed requests once
      
      // CRITICAL: Prevent duplicate requests
      // React Query will deduplicate identical requests automatically
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 0, // Don't retry mutations
      networkMode: 'online',
    },
  },
});
