import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  pendingInvoices: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats(companyId: string) {
  return useQuery({
    queryKey: ['dashboard-stats', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/seller/dashboard/stats?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json() as Promise<DashboardStats>;
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch recent activity
 */
export function useRecentActivity(companyId: string) {
  return useQuery({
    queryKey: ['recent-activity', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/seller/dashboard/activity?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }
      return response.json() as Promise<Activity[]>;
    },
    enabled: !!companyId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
