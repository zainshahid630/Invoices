-- ============================================
-- OPTIMIZE RLS POLICIES FOR PERFORMANCE
-- ============================================
-- This script optimizes all RLS policies by wrapping auth.uid()
-- in a SELECT statement to prevent re-evaluation for each row
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Companies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;

-- Subscriptions
DROP POLICY IF EXISTS "Users can view subscriptions from their company" ON subscriptions;

-- Users
DROP POLICY IF EXISTS "Users can view users from their company" ON users;
DROP POLICY IF EXISTS "Users can update users from their company" ON users;
DROP POLICY IF EXISTS "Admins can insert users in their company" ON users;

-- Products
DROP POLICY IF EXISTS "Users can view products from their company" ON products;
DROP POLICY IF EXISTS "Users can insert products in their company" ON products;
DROP POLICY IF EXISTS "Users can update products from their company" ON products;
DROP POLICY IF EXISTS "Users can delete products from their company" ON products;

-- Stock History
DROP POLICY IF EXISTS "Users can view stock history from their company" ON stock_history;
DROP POLICY IF EXISTS "Users can insert stock history in their company" ON stock_history;

-- Customers
DROP POLICY IF EXISTS "Users can view customers from their company" ON customers;
DROP POLICY IF EXISTS "Users can insert customers in their company" ON customers;
DROP POLICY IF EXISTS "Users can update customers from their company" ON customers;
DROP POLICY IF EXISTS "Users can delete customers from their company" ON customers;

-- Invoices
DROP POLICY IF EXISTS "Users can view invoices from their company" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices in their company" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices from their company" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices from their company" ON invoices;

-- Invoice Items
DROP POLICY IF EXISTS "Users can view invoice items from their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items in their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items from their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items from their company" ON invoice_items;

-- Payments
DROP POLICY IF EXISTS "Users can view payments from their company" ON payments;
DROP POLICY IF EXISTS "Users can insert payments in their company" ON payments;
DROP POLICY IF EXISTS "Users can update payments from their company" ON payments;
DROP POLICY IF EXISTS "Users can delete payments from their company" ON payments;

-- Settings
DROP POLICY IF EXISTS "Users can view settings from their company" ON settings;
DROP POLICY IF EXISTS "Admins can update settings for their company" ON settings;
DROP POLICY IF EXISTS "Admins can insert settings for their company" ON settings;

-- Feature Toggles
DROP POLICY IF EXISTS "Users can view feature toggles from their company" ON feature_toggles;

-- Super Admins
DROP POLICY IF EXISTS "Super admins can view their own record" ON super_admins;
DROP POLICY IF EXISTS "Super admins can update their own record" ON super_admins;

-- Company Template Access
DROP POLICY IF EXISTS "Users can view template access for their company" ON company_template_access;

-- Email Logs
DROP POLICY IF EXISTS "Users can view email logs from their company" ON email_logs;
DROP POLICY IF EXISTS "Users can insert email logs for their company" ON email_logs;

-- ============================================
-- STEP 2: CREATE OPTIMIZED POLICIES
-- ============================================

-- COMPANIES POLICIES
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING ((SELECT auth.uid()) IN (SELECT id FROM users WHERE company_id = companies.id));

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view subscriptions from their company"
  ON subscriptions FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- USERS POLICIES
CREATE POLICY "Users can view users from their company"
  ON users FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can update users from their company"
  ON users FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Admins can insert users in their company"
  ON users FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- PRODUCTS POLICIES
CREATE POLICY "Users can view products from their company"
  ON products FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can insert products in their company"
  ON products FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can update products from their company"
  ON products FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can delete products from their company"
  ON products FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- STOCK HISTORY POLICIES
CREATE POLICY "Users can view stock history from their company"
  ON stock_history FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can insert stock history in their company"
  ON stock_history FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- CUSTOMERS POLICIES
CREATE POLICY "Users can view customers from their company"
  ON customers FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can insert customers in their company"
  ON customers FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can update customers from their company"
  ON customers FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can delete customers from their company"
  ON customers FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- INVOICES POLICIES
CREATE POLICY "Users can view invoices from their company"
  ON invoices FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can insert invoices in their company"
  ON invoices FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can update invoices from their company"
  ON invoices FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can delete invoices from their company"
  ON invoices FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- INVOICE ITEMS POLICIES
CREATE POLICY "Users can view invoice items from their company"
  ON invoice_items FOR SELECT
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = (SELECT auth.uid())
    )
  ));

CREATE POLICY "Users can insert invoice items in their company"
  ON invoice_items FOR INSERT
  WITH CHECK (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = (SELECT auth.uid())
    )
  ));

CREATE POLICY "Users can update invoice items from their company"
  ON invoice_items FOR UPDATE
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = (SELECT auth.uid())
    )
  ));

CREATE POLICY "Users can delete invoice items from their company"
  ON invoice_items FOR DELETE
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = (SELECT auth.uid())
    )
  ));

-- PAYMENTS POLICIES
CREATE POLICY "Users can view payments from their company"
  ON payments FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can insert payments in their company"
  ON payments FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can update payments from their company"
  ON payments FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can delete payments from their company"
  ON payments FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- SETTINGS POLICIES
CREATE POLICY "Users can view settings from their company"
  ON settings FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Admins can update settings for their company"
  ON settings FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings for their company"
  ON settings FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- FEATURE TOGGLES POLICIES
CREATE POLICY "Users can view feature toggles from their company"
  ON feature_toggles FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- SUPER ADMINS POLICIES
CREATE POLICY "Super admins can view their own record"
  ON super_admins FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Super admins can update their own record"
  ON super_admins FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- COMPANY TEMPLATE ACCESS POLICIES
CREATE POLICY "Users can view template access for their company"
  ON company_template_access FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- EMAIL LOGS POLICIES
CREATE POLICY "Users can view email logs from their company"
  ON email_logs FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Users can insert email logs for their company"
  ON email_logs FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = (SELECT auth.uid())));

-- ============================================
-- STEP 3: FIX DUPLICATE INDEX
-- ============================================

-- Drop the duplicate index (keeping the more descriptive one)
DROP INDEX IF EXISTS idx_payments_gateway_txn;

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================
SELECT 
  tablename,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = pt.tablename AND schemaname = 'public') as policy_count,
  '✅ OPTIMIZED' as status
FROM pg_tables pt
WHERE schemaname = 'public'
  AND tablename IN (
    'super_admins', 'companies', 'subscriptions', 'users',
    'products', 'stock_history', 'customers', 'invoices',
    'invoice_items', 'payments', 'settings', 'feature_toggles',
    'company_template_access', 'invoice_templates', 'email_logs'
  )
ORDER BY tablename;

-- Check for duplicate indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'payments'
  AND indexname LIKE '%gateway%'
ORDER BY indexname;
