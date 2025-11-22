-- ============================================
-- COMPLETE RLS FIX SCRIPT
-- ============================================
-- This script enables Row Level Security on all tables
-- and ensures proper policies are in place
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================

-- Core tables
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

-- Additional tables
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_template_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: CREATE RLS POLICIES FOR NEW TABLES
-- ============================================

-- SUPER ADMINS POLICIES
-- Super admins can only see their own record
CREATE POLICY "Super admins can view their own record"
  ON super_admins FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Super admins can update their own record"
  ON super_admins FOR UPDATE
  USING (id = auth.uid());

-- INVOICE TEMPLATES POLICIES
-- All authenticated users can view active templates
CREATE POLICY "Anyone can view active invoice templates"
  ON invoice_templates FOR SELECT
  USING (is_active = true);

-- Only super admins can manage templates (handled at application level with service role)

-- COMPANY TEMPLATE ACCESS POLICIES
-- Users can view template access for their company
CREATE POLICY "Users can view template access for their company"
  ON company_template_access FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- EMAIL LOGS POLICIES
-- Users can view email logs for their company
CREATE POLICY "Users can view email logs from their company"
  ON email_logs FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert email logs for their company"
  ON email_logs FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- STEP 3: VERIFICATION QUERY
-- ============================================
-- Run this to verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) 
   FROM pg_policies 
   WHERE schemaname = pt.schemaname 
   AND tablename = pt.tablename) as policy_count
FROM pg_tables pt
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- ============================================
-- STEP 4: LIST ALL POLICIES
-- ============================================
-- Run this to see all active policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
