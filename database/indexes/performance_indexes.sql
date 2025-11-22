-- PERFORMANCE INDEXES FOR INVOICEFBR
-- Run these in Supabase SQL Editor to dramatically improve query performance
-- Expected improvement: 3-5x faster queries

-- NOTE: Run these ONE AT A TIME if you encounter errors
-- Some indexes may already exist or tables may be in different schema

-- ============================================
-- INVOICES TABLE INDEXES
-- ============================================

-- Index for company_id + invoice_date (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_invoices_company_date 
ON public.invoices(company_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- Index for company_id + status (for filtering by status)
CREATE INDEX IF NOT EXISTS idx_invoices_company_status 
ON public.invoices(company_id, status) 
WHERE deleted_at IS NULL;

-- Index for company_id + payment_status (for payment filtering)
CREATE INDEX IF NOT EXISTS idx_invoices_company_payment 
ON public.invoices(company_id, payment_status) 
WHERE deleted_at IS NULL;

-- Index for invoice_number search (exact match)
CREATE INDEX IF NOT EXISTS idx_invoices_number 
ON public.invoices(company_id, invoice_number) 
WHERE deleted_at IS NULL;

-- Index for invoice_number pattern matching (LIKE queries)
CREATE INDEX IF NOT EXISTS idx_invoices_number_pattern 
ON public.invoices(company_id, invoice_number text_pattern_ops) 
WHERE deleted_at IS NULL;

-- Composite index for common list query
CREATE INDEX IF NOT EXISTS idx_invoices_list 
ON public.invoices(company_id, deleted_at, created_at DESC);

-- ============================================
-- CUSTOMERS TABLE INDEXES
-- ============================================

-- Index for company_id + is_active
CREATE INDEX IF NOT EXISTS idx_customers_company_active 
ON public.customers(company_id, is_active);

-- Index for NTN/CNIC lookup
CREATE INDEX IF NOT EXISTS idx_customers_ntn 
ON public.customers(company_id, ntn_cnic) 
WHERE ntn_cnic IS NOT NULL;

-- Full-text search index for customer names
CREATE INDEX IF NOT EXISTS idx_customers_search 
ON public.customers USING gin(
  to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(business_name, '') || ' ' || 
    COALESCE(ntn_cnic, '')
  )
);

-- Index for customer name sorting
CREATE INDEX IF NOT EXISTS idx_customers_name 
ON public.customers(company_id, name);

-- ============================================
-- PRODUCTS TABLE INDEXES
-- ============================================

-- Index for company_id (basic lookup)
CREATE INDEX IF NOT EXISTS idx_products_company 
ON public.products(company_id);

-- Index for product name search
CREATE INDEX IF NOT EXISTS idx_products_name 
ON public.products(company_id, name);

-- Index for HS code lookup
CREATE INDEX IF NOT EXISTS idx_products_hs_code 
ON public.products(company_id, hs_code) 
WHERE hs_code IS NOT NULL;

-- Full-text search for products
CREATE INDEX IF NOT EXISTS idx_products_search 
ON public.products USING gin(
  to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(hs_code, '') || ' ' || 
    COALESCE(description, '')
  )
);

-- ============================================
-- INVOICE_ITEMS TABLE INDEXES
-- ============================================

-- Index for invoice_id (for fetching items)
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice 
ON public.invoice_items(invoice_id);

-- Index for product_id (for stock tracking)
CREATE INDEX IF NOT EXISTS idx_invoice_items_product 
ON public.invoice_items(product_id) 
WHERE product_id IS NOT NULL;

-- ============================================
-- PAYMENTS TABLE INDEXES (if table exists)
-- ============================================

-- Index for invoice_id
CREATE INDEX IF NOT EXISTS idx_payments_invoice 
ON public.payments(invoice_id);

-- Index for customer_id
CREATE INDEX IF NOT EXISTS idx_payments_customer 
ON public.payments(customer_id);

-- Index for company_id + payment_date
CREATE INDEX IF NOT EXISTS idx_payments_company_date 
ON public.payments(company_id, payment_date DESC);

-- ============================================
-- SETTINGS TABLE INDEXES
-- ============================================

-- Index for company_id (should be unique anyway)
CREATE INDEX IF NOT EXISTS idx_settings_company 
ON public.settings(company_id);

-- ============================================
-- VERIFY INDEXES
-- ============================================

-- Run this to see all indexes on invoices table:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'invoices';

-- Run this to see index usage statistics:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- ============================================
-- MAINTENANCE
-- ============================================

-- Analyze tables to update statistics (run periodically)
ANALYZE public.invoices;
ANALYZE public.customers;
ANALYZE public.products;
ANALYZE public.invoice_items;
-- ANALYZE public.payments; -- Uncomment if payments table exists

-- Vacuum tables to reclaim space (run periodically)
-- VACUUM ANALYZE invoices;
-- VACUUM ANALYZE customers;
-- VACUUM ANALYZE products;

COMMENT ON INDEX idx_invoices_company_date IS 'Optimizes invoice list queries by company and date';
COMMENT ON INDEX idx_customers_search IS 'Enables fast full-text search on customer names';
COMMENT ON INDEX idx_products_search IS 'Enables fast full-text search on product names';
