-- Quick check of current RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
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
