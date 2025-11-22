import { useQuery } from '@tanstack/react-query';

interface InitDataResponse {
  customers: any[];
  products: any[];
  nextInvoiceNumber: string;
  defaultHsCode: string;
  defaultSalesTaxRate: number;
  defaultFurtherTaxRate: number;
  invoicePrefix: string;
}

async function fetchInitData(companyId: string): Promise<InitDataResponse> {
  const response = await fetch(
    `/api/seller/invoices/init-data?company_id=${companyId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to load initial data');
  }
  
  return response.json();
}

/**
 * Hook for fetching all initialization data for invoice creation
 * This replaces 3 separate API calls with 1 optimized call
 */
export function useInvoiceInitData(companyId: string) {
  return useQuery({
    queryKey: ['invoice-init-data', companyId],
    queryFn: () => fetchInitData(companyId),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes - reasonable for invoice creation
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
