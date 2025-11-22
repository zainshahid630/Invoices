-- ============================================
-- FIX RLS POLICIES PROPERLY
-- ============================================
-- This script:
-- 1. Ensures RLS is enabled on all tables
-- 2. Drops incorrect "ALL" policies
-- 3. Applies correct granular policies from rls-policies.sql
-- ============================================

-- ============================================
-- STEP 1: ENSURE RLS IS ENABLED
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_template_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: DROP INCORRECT "ALL" POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view customers from their company" ON customers;
DROP POLICY IF EXISTS "Users can view feature toggles from their company" ON feature_toggles;
DROP POLICY IF EXISTS "Users can view invoice items from their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can view invoices from their company" ON invoices;
DROP POLICY IF EXISTS "Users can view payments from their company" ON payments;
DROP POLICY IF EXISTS "Users can view products from their company" ON products;
DROP POLICY IF EXISTS "Users can view settings from their company" ON settings;
DROP POLICY IF EXISTS "Users can view stock history from their company" ON stock_history;

-- ============================================
-- STEP 3: APPLY CORRECT GRANULAR POLICIES
-- ============================================

-- USERS POLICIES (add missing ones)
CREATE POLICY "Users can update users from their company"
  ON users FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert users in their company"
  ON users FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PRODUCTS POLICIES
CREATE POLICY "Users can view products from their company"
  ON products FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert products in their company"
  ON products FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update products from their company"
  ON products FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete products from their company"
  ON products FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- STOCK HISTORY POLICIES
CREATE POLICY "Users can view stock history from their company"
  ON stock_history FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert stock history in their company"
  ON stock_history FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- CUSTOMERS POLICIES
CREATE POLICY "Users can view customers from their company"
  ON customers FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert customers in their company"
  ON customers FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update customers from their company"
  ON customers FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete customers from their company"
  ON customers FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- INVOICES POLICIES
CREATE POLICY "Users can view invoices from their company"
  ON invoices FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert invoices in their company"
  ON invoices FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update invoices from their company"
  ON invoices FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete invoices from their company"
  ON invoices FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- INVOICE ITEMS POLICIES
CREATE POLICY "Users can view invoice items from their company"
  ON invoice_items FOR SELECT
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert invoice items in their company"
  ON invoice_items FOR INSERT
  WITH CHECK (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can update invoice items from their company"
  ON invoice_items FOR UPDATE
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete invoice items from their company"
  ON invoice_items FOR DELETE
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  ));

-- PAYMENTS POLICIES
CREATE POLICY "Users can view payments from their company"
  ON payments FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert payments in their company"
  ON payments FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update payments from their company"
  ON payments FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete payments from their company"
  ON payments FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- SETTINGS POLICIES
CREATE POLICY "Users can view settings from their company"
  ON settings FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can update settings for their company"
  ON settings FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings for their company"
  ON settings FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- FEATURE TOGGLES POLICIES
CREATE POLICY "Users can view feature toggles from their company"
  ON feature_toggles FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = pt.tablename AND schemaname = 'public') as policy_count
FROM pg_tables pt
WHERE schemaname = 'public'
  AND tablename IN (
    'super_admins', 'companies', 'subscriptions', 'users',
    'products', 'stock_history', 'customers', 'invoices',
    'invoice_items', 'payments', 'settings', 'feature_toggles',
    'company_template_access', 'invoice_templates', 'email_logs'
  )
ORDER BY tablename;
