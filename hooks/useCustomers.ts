import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Customer {
  id: string;
  company_id: string;
  name: string;
  business_name: string | null;
  ntn_cnic: string | null;
  gst_number: string | null;
  address: string | null;
  province: string | null;
  registration_type: string;
  is_active: boolean;
  created_at: string;
}

// Fetch all customers
async function fetchCustomers(companyId: string): Promise<Customer[]> {
  const response = await fetch(`/api/seller/customers?company_id=${companyId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  
  return response.json();
}

// Fetch single customer
async function fetchCustomer(customerId: string, companyId: string): Promise<Customer> {
  const response = await fetch(
    `/api/seller/customers/${customerId}?company_id=${companyId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch customer');
  }
  
  return response.json();
}

// Hook for fetching customers list
export function useCustomers(companyId: string) {
  return useQuery({
    queryKey: ['customers', companyId],
    queryFn: () => fetchCustomers(companyId),
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes - customers don't change often
  });
}

// Hook for fetching single customer
export function useCustomer(customerId: string, companyId: string) {
  return useQuery({
    queryKey: ['customer', customerId, companyId],
    queryFn: () => fetchCustomer(customerId, companyId),
    enabled: !!customerId && !!companyId,
  });
}

// Hook for creating customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: Partial<Customer>) => {
      const response = await fetch('/api/seller/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create customer');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: ['customers', variables.company_id] });
    },
  });
}

// Hook for updating customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
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
    onSuccess: (updatedCustomer, variables) => {
      // Update cache for single customer
      queryClient.setQueryData(
        ['customer', variables.id, updatedCustomer.company_id],
        updatedCustomer
      );
      
      // Invalidate customers list
      queryClient.invalidateQueries({ 
        queryKey: ['customers', updatedCustomer.company_id] 
      });
    },
  });
}

// Hook for deleting customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
      const response = await fetch(
        `/api/seller/customers/${id}?company_id=${companyId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: ['customers', variables.companyId] });
    },
  });
}
