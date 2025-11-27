-- ============================================
-- Database Performance Optimization Indexes
-- InvoiceFBR Performance Tuning
-- ============================================

-- Run these in your Supabase SQL Editor
-- These indexes will dramatically improve query performance

-- ============================================
-- INVOICES TABLE INDEXES
-- ============================================

-- Index for invoice status queries (used in stats API)
-- This is critical for the homepage stats
CREATE INDEX IF NOT EXISTS idx_invoices_status 
ON invoices(status) 
WHERE deleted_at IS NULL;

-- Index for deleted_at checks (used in almost all queries)
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at 
ON invoices(deleted_at) 
WHERE deleted_at IS NULL;

-- Index for company-specific queries
CREATE INDEX IF NOT EXISTS idx_invoices_company_id 
ON invoices(company_id) 
WHERE deleted_at IS NULL;

-- Composite index for common dashboard queries
-- Covers: company_id + status + ordering by date
CREATE INDEX IF NOT EXISTS idx_invoices_company_status_date 
ON invoices(company_id, status, created_at DESC) 
WHERE deleted_at IS NULL;

-- Index for invoice number lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number 
ON invoices(invoice_number);

-- Index for FBR reference lookups
CREATE INDEX IF NOT EXISTS idx_invoices_fbr_reference 
ON invoices(fbr_reference_number) 
WHERE fbr_reference_number IS NOT NULL;

-- ============================================
-- PRODUCTS TABLE INDEXES
-- ============================================

-- Index for company products
CREATE INDEX IF NOT EXISTS idx_products_company_id 
ON products(company_id);

-- Index for product name searches
CREATE INDEX IF NOT EXISTS idx_products_name 
ON products(name);

-- Composite index for active products by company
CREATE INDEX IF NOT EXISTS idx_products_company_active 
ON products(company_id, is_active);

-- ============================================
-- CUSTOMERS TABLE INDEXES
-- ============================================

-- Index for company customers
CREATE INDEX IF NOT EXISTS idx_customers_company_id 
ON customers(company_id);

-- Index for customer name searches
CREATE INDEX IF NOT EXISTS idx_customers_name 
ON customers(name);

-- Index for NTN lookups
CREATE INDEX IF NOT EXISTS idx_customers_ntn 
ON customers(ntn_number) 
WHERE ntn_number IS NOT NULL;

-- ============================================
-- COMPANIES TABLE INDEXES
-- ============================================

-- Index for active companies
CREATE INDEX IF NOT EXISTS idx_companies_is_active 
ON companies(is_active);

-- Index for NTN lookups
CREATE INDEX IF NOT EXISTS idx_companies_ntn 
ON companies(ntn_number) 
WHERE ntn_number IS NOT NULL;

-- ============================================
-- PAYMENTS TABLE INDEXES
-- ============================================

-- Index for company payments
CREATE INDEX IF NOT EXISTS idx_payments_company_id 
ON payments(company_id);

-- Index for payment status
CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status);

-- Composite index for company payment history
CREATE INDEX IF NOT EXISTS idx_payments_company_date 
ON payments(company_id, created_at DESC);

-- ============================================
-- SUBSCRIPTIONS TABLE INDEXES
-- ============================================

-- Index for company subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id 
ON subscriptions(company_id);

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
ON subscriptions(status);

-- Composite index for active company subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_status 
ON subscriptions(company_id, status, end_date DESC);

-- ============================================
-- USERS TABLE INDEXES
-- ============================================

-- Index for company users
CREATE INDEX IF NOT EXISTS idx_users_company_id 
ON users(company_id) 
WHERE is_active = true;

-- Index for email lookups (login)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- ============================================
-- ANALYZE TABLES
-- ============================================
-- Update statistics for query planner

ANALYZE invoices;
ANALYZE companies;
ANALYZE products;
ANALYZE customers;
ANALYZE payments;
ANALYZE subscriptions;
ANALYZE users;

-- ============================================
-- VERIFY INDEXES
-- ============================================
-- Run this to see all indexes on a table

-- SELECT 
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND tablename IN ('invoices', 'companies', 'products', 'customers', 'payments', 'subscriptions', 'users')
-- ORDER BY tablename, indexname;

-- ============================================
-- PERFORMANCE MONITORING
-- ============================================
-- Check slow queries (run periodically)

-- SELECT 
--     query,
--     calls,
--     total_time,
--     mean_time,
--     max_time
-- FROM pg_stat_statements
-- WHERE query NOT LIKE '%pg_stat_statements%'
-- ORDER BY mean_time DESC
-- LIMIT 20;

-- ============================================
-- NOTES
-- ============================================
-- 1. These indexes will improve read performance significantly
-- 2. They may slightly slow down writes (inserts/updates)
-- 3. Monitor index usage with pg_stat_user_indexes
-- 4. Drop unused indexes if needed
-- 5. Run ANALYZE periodically to update statistics
-- 6. Consider VACUUM ANALYZE for maintenance

-- Expected improvements:
-- - Stats API: 10-50x faster
-- - Dashboard queries: 5-20x faster
-- - Search operations: 10-100x faster
-- - Overall database load: 60-80% reduction
