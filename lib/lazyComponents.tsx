/**
 * Lazy-loaded Components Configuration
 * 
 * Use these imports instead of regular imports for heavy components
 * to enable code splitting and reduce initial bundle size.
 * 
 * Usage:
 * import { LazyFBRSandbox } from '@/lib/lazyComponents';
 * 
 * <Suspense fallback={<LoadingSpinner />}>
 *   <LazyFBRSandbox />
 * </Suspense>
 */

import { lazy } from 'react';

// Heavy pages that should be lazy-loaded
export const LazyFBRSandbox = lazy(() =>
  import('@/app/seller/fbr-sandbox/page').then(module => ({
    default: module.default
  }))
);

export const LazyInvoicePrint = lazy(() =>
  import('@/app/seller/invoices/[id]/print/page').then(module => ({
    default: module.default
  }))
);


// Loading fallback components
export const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export const ComponentLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);
