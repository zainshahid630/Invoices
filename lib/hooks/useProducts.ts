import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  hs_code?: string;
  uom?: string;
  unit_price: number;
  current_stock: number;
  is_active: boolean;
}

/**
 * Fetch products with React Query
 */
export function useProducts(companyId: string) {
  return useQuery({
    queryKey: ['products', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/seller/products?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create product mutation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Update product mutation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/seller/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
