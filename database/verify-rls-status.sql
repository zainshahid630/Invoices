-- ============================================
-- RLS STATUS VERIFICATION SCRIPT
-- ============================================
-- Run this script to check the current RLS status
-- and identify any remaining issues
-- ============================================

-- ============================================
-- CHECK 1: RLS Status for All Tables
-- ============================================
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status,
  (SELECT COUNT(*) 
   FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename = pt.tablename) as policy_count
FROM pg_tables pt
WHERE schemaname = 'public'
  AND tablename IN (
    'super_admins',
    'companies',
    'subscriptions',
    'users',
    'products',
    'stock_history',
    'customers',
    'invoices',
    'invoice_items',
    'payments',
    'settings',
    'feature_toggles',
    'company_template_access',
    'invoice_templates',
    'email_logs'
  )
ORDER BY tablename;

-- ============================================
-- CHECK 2: Tables with Policies but RLS Disabled
-- ============================================
SELECT 
  pt.tablename,
  COUNT(pp.policyname) as policy_count,
  'RLS DISABLED BUT HAS POLICIES' as issue
FROM pg_tables pt
LEFT JOIN pg_policies pp ON pt.tablename = pp.tablename AND pt.schemaname = pp.schemaname
WHERE pt.schemaname = 'public'
  AND pt.rowsecurity = false
  AND pp.policyname IS NOT NULL
GROUP BY pt.tablename
ORDER BY pt.tablename;

-- ============================================
-- CHECK 3: Tables with RLS but No Policies
-- ============================================
SELECT 
  pt.tablename,
  'RLS ENABLED BUT NO POLICIES' as issue
FROM pg_tables pt
WHERE pt.schemaname = 'public'
  AND pt.rowsecurity = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies pp 
    WHERE pp.schemaname = pt.schemaname 
    AND pp.tablename = pt.tablename
  )
ORDER BY pt.tablename;

-- ============================================
-- CHECK 4: List All Active Policies
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- CHECK 5: Summary Report
-- ============================================
WITH rls_summary AS (
  SELECT 
    COUNT(*) FILTER (WHERE rowsecurity = true) as tables_with_rls,
    COUNT(*) FILTER (WHERE rowsecurity = false) as tables_without_rls,
    COUNT(*) as total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'super_admins', 'companies', 'subscriptions', 'users',
      'products', 'stock_history', 'customers', 'invoices',
      'invoice_items', 'payments', 'settings', 'feature_toggles',
      'company_template_access', 'invoice_templates', 'email_logs'
    )
),
policy_summary AS (
  SELECT COUNT(DISTINCT tablename) as tables_with_policies
  FROM pg_policies
  WHERE schemaname = 'public'
)
SELECT 
  rs.total_tables as "Total Tables",
  rs.tables_with_rls as "✅ RLS Enabled",
  rs.tables_without_rls as "❌ RLS Disabled",
  ps.tables_with_policies as "Tables with Policies",
  CASE 
    WHEN rs.tables_without_rls = 0 THEN '✅ ALL TABLES SECURED'
    ELSE '❌ SECURITY ISSUES REMAIN'
  END as "Overall Status"
FROM rls_summary rs, policy_summary ps;

-- ============================================
-- CHECK 6: Expected vs Actual
-- ============================================
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'super_admins',
    'companies',
    'subscriptions',
    'users',
    'products',
    'stock_history',
    'customers',
    'invoices',
    'invoice_items',
    'payments',
    'settings',
    'feature_toggles',
    'company_template_access',
    'invoice_templates',
    'email_logs'
  ]) as table_name
)
SELECT 
  et.table_name,
  COALESCE(pt.rowsecurity, false) as rls_enabled,
  COALESCE((SELECT COUNT(*) FROM pg_policies WHERE tablename = et.table_name AND schemaname = 'public'), 0) as policy_count,
  CASE 
    WHEN pt.tablename IS NULL THEN '⚠️  TABLE DOES NOT EXIST'
    WHEN pt.rowsecurity = false THEN '❌ RLS DISABLED'
    WHEN pt.rowsecurity = true AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = et.table_name AND schemaname = 'public') = 0 THEN '⚠️  RLS ENABLED BUT NO POLICIES'
    ELSE '✅ PROPERLY CONFIGURED'
  END as status
FROM expected_tables et
LEFT JOIN pg_tables pt ON et.table_name = pt.tablename AND pt.schemaname = 'public'
ORDER BY et.table_name;
