import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Customer {
  id: string;
  name: string;
  business_name?: string;
  ntn_cnic?: string;
  address?: string;
  province?: string;
  is_active: boolean;
}

/**
 * Fetch customers with React Query
 */
export function useCustomers(companyId: string) {
  return useQuery({
    queryKey: ['customers', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/seller/customers?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes - customers don't change often
  });
}

/**
 * Create customer mutation
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/seller/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create customer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

/**
 * Update customer mutation
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/seller/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update customer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
