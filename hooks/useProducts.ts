import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
  id: string;
  company_id: string;
  name: string;
  hs_code: string | null;
  uom: string;
  unit_price: number;
  current_stock: number;
  description: string | null;
  created_at: string;
}

// Fetch all products
async function fetchProducts(companyId: string): Promise<Product[]> {
  const response = await fetch(`/api/seller/products?company_id=${companyId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}

// Fetch single product
async function fetchProduct(productId: string, companyId: string): Promise<Product> {
  const response = await fetch(
    `/api/seller/products/${productId}?company_id=${companyId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return response.json();
}

// Hook for fetching products list
export function useProducts(companyId: string) {
  return useQuery({
    queryKey: ['products', companyId],
    queryFn: () => fetchProducts(companyId),
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes - products don't change often
  });
}

// Hook for fetching single product
export function useProduct(productId: string, companyId: string) {
  return useQuery({
    queryKey: ['product', productId, companyId],
    queryFn: () => fetchProduct(productId, companyId),
    enabled: !!productId && !!companyId,
  });
}

// Hook for creating product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products', variables.company_id] });
    },
  });
}

// Hook for updating product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
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
    onSuccess: (updatedProduct, variables) => {
      // Update cache for single product
      queryClient.setQueryData(
        ['product', variables.id, updatedProduct.company_id],
        updatedProduct
      );
      
      // Invalidate products list
      queryClient.invalidateQueries({ 
        queryKey: ['products', updatedProduct.company_id] 
      });
    },
  });
}

// Hook for deleting product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
      const response = await fetch(
        `/api/seller/products/${id}?company_id=${companyId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products', variables.companyId] });
    },
  });
}
