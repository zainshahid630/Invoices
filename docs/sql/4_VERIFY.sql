-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('invoice_templates', 'company_template_access');

-- View all templates
SELECT * FROM invoice_templates ORDER BY display_order;

-- Count templates
SELECT 
  COUNT(*) as total_templates,
  SUM(CASE WHEN is_paid = false THEN 1 ELSE 0 END) as free_templates,
  SUM(CASE WHEN is_paid = true THEN 1 ELSE 0 END) as paid_templates
FROM invoice_templates;

