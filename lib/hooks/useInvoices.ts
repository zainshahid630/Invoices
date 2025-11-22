import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  buyer_name: string;
  buyer_business_name: string;
  // ... other fields
}

interface InvoicesParams {
  company_id: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

/**
 * Fetch invoices with React Query
 * Provides automatic caching, deduplication, and refetching
 */
export function useInvoices(params: InvoicesParams) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('company_id', params.company_id);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.search) searchParams.append('search', params.search);

      const response = await fetch(`/api/seller/invoices?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!params.company_id, // Only fetch if company_id exists
  });
}

/**
 * Fetch single invoice by ID
 */
export function useInvoice(invoiceId: string, companyId: string) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await fetch(
        `/api/seller/invoices/${invoiceId}?company_id=${companyId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }
      return response.json();
    },
    enabled: !!invoiceId && !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create invoice mutation
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/seller/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invoice');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch invoices list
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

/**
 * Update invoice mutation
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/seller/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update invoice');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific invoice and list
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

/**
 * Delete invoice mutation
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, company_id }: { id: string; company_id: string }) => {
      const response = await fetch(
        `/api/seller/invoices/${id}?company_id=${company_id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete invoice');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
