import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface InvoiceFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  buyer_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  invoice_date: string;
  created_at: string;
}

interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    draft: number;
    posted: number;
    verified: number;
    totalAmount: number;
    pendingAmount: number;
  };
}

// Fetch invoices with filters
async function fetchInvoices(
  companyId: string,
  filters: InvoiceFilters
): Promise<InvoicesResponse> {
  const params = new URLSearchParams({
    company_id: companyId,
    page: filters.page?.toString() || '1',
    limit: filters.limit?.toString() || '10',
    ...(filters.search && { search: filters.search }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
  });

  const response = await fetch(`/api/seller/invoices?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  
  return response.json();
}

// Fetch single invoice
async function fetchInvoice(invoiceId: string, companyId: string) {
  const response = await fetch(
    `/api/seller/invoices/${invoiceId}?company_id=${companyId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch invoice');
  }
  
  return response.json();
}

// Hook for fetching invoices list
export function useInvoices(companyId: string, filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: ['invoices', companyId, filters],
    queryFn: () => fetchInvoices(companyId, filters),
    enabled: !!companyId,
  });
}

// Hook for fetching single invoice
export function useInvoice(invoiceId: string, companyId: string) {
  return useQuery({
    queryKey: ['invoice', invoiceId, companyId],
    queryFn: () => fetchInvoice(invoiceId, companyId),
    enabled: !!invoiceId && !!companyId,
  });
}

// Hook for creating invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await fetch('/api/seller/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invoice');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate invoices list to refetch
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.company_id] });
    },
  });
}

// Hook for updating invoice
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
    onSuccess: (updatedInvoice, variables) => {
      // Update cache for single invoice
      queryClient.setQueryData(
        ['invoice', variables.id, updatedInvoice.company_id],
        updatedInvoice
      );
      
      // Invalidate invoices list
      queryClient.invalidateQueries({ 
        queryKey: ['invoices', updatedInvoice.company_id] 
      });
    },
  });
}

// Hook for deleting invoice
export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
      const response = await fetch(
        `/api/seller/invoices/${id}?company_id=${companyId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate invoices list
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.companyId] });
    },
  });
}
