-- SAFE PERFORMANCE INDEXES - RUN ONE AT A TIME
-- Copy and paste each section individually into Supabase SQL Editor
-- If any index fails, skip it and continue with the next one

-- ============================================
-- STEP 1: Most Important Invoice Indexes
-- ============================================

-- This is the MOST important index - run this first
CREATE INDEX IF NOT EXISTS idx_invoices_company_date 
ON public.invoices(company_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- ============================================
-- STEP 2: Invoice Status Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_company_status 
ON public.invoices(company_id, status) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_company_payment 
ON public.invoices(company_id, payment_status) 
WHERE deleted_at IS NULL;

-- ============================================
-- STEP 3: Invoice Number Search
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_number 
ON public.invoices(company_id, invoice_number) 
WHERE deleted_at IS NULL;

-- For LIKE queries (e.g., searching invoice numbers)
CREATE INDEX IF NOT EXISTS idx_invoices_number_pattern 
ON public.invoices(company_id, invoice_number text_pattern_ops) 
WHERE deleted_at IS NULL;

-- ============================================
-- STEP 4: Customer Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_company_active 
ON public.customers(company_id, is_active);

CREATE INDEX IF NOT EXISTS idx_customers_name 
ON public.customers(company_id, name);

CREATE INDEX IF NOT EXISTS idx_customers_ntn 
ON public.customers(company_id, ntn_cnic) 
WHERE ntn_cnic IS NOT NULL;

-- ============================================
-- STEP 5: Product Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_company 
ON public.products(company_id);

CREATE INDEX IF NOT EXISTS idx_products_name 
ON public.products(company_id, name);

-- ============================================
-- STEP 6: Invoice Items Index
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice 
ON public.invoice_items(invoice_id);

-- ============================================
-- STEP 7: Settings Index
-- ============================================

CREATE INDEX IF NOT EXISTS idx_settings_company 
ON public.settings(company_id);

-- ============================================
-- STEP 8: Analyze Tables (Update Statistics)
-- ============================================

ANALYZE public.invoices;
ANALYZE public.customers;
ANALYZE public.products;
ANALYZE public.invoice_items;
ANALYZE public.settings;

-- ============================================
-- VERIFICATION
-- ============================================

-- Run this to see all indexes created:
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('invoices', 'customers', 'products', 'invoice_items', 'settings')
ORDER BY tablename, indexname;
