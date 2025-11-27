-- ============================================
-- ADD COMMERCIAL LETTERHEAD TEMPLATE
-- ============================================
-- This SQL adds the new Commercial Letterhead template to the database
-- Run this query in your database to make the template available

-- Insert Commercial Letterhead Template (Free)
INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  is_active,
  features
) VALUES (
  'Commercial Letterhead',
  'Professional B2B commercial invoice with green letterhead space. Perfect for manufacturing, wholesale, and export businesses using pre-printed letterhead.',
  'commercial-letterhead',
  false,  -- Set to true if you want to make it a paid template
  0.00,   -- Set price if making it paid (e.g., 499.00)
  6,      -- Display order (adjust based on your needs)
  true,   -- Active by default
  '[
    "Green letterhead area (customizable height)",
    "Commercial Invoice title",
    "8-column table with Unit column",
    "Professional B2B format",
    "Factory address footer",
    "Minimum 8 rows for consistent appearance",
    "Reference number field",
    "Signature area",
    "FBR compliant",
    "Perfect for pre-printed letterhead"
  ]'::jsonb
);

-- Verify the insertion
SELECT 
  id,
  name,
  template_key,
  is_paid,
  price,
  is_active,
  display_order,
  created_at
FROM invoice_templates
WHERE template_key = 'commercial-letterhead';

-- ============================================
-- OPTIONAL: Grant access to specific companies
-- ============================================
-- If you want to grant access to specific companies (for paid templates),
-- uncomment and modify the following query:

/*
INSERT INTO company_template_access (
  company_id,
  template_id,
  granted_by,
  granted_at,
  expires_at,
  is_active
)
SELECT 
  'YOUR_COMPANY_ID_HERE'::uuid,  -- Replace with actual company UUID
  id,
  'YOUR_SUPER_ADMIN_ID_HERE'::uuid,  -- Replace with super admin UUID
  NOW(),
  NULL,  -- NULL for lifetime access, or set a date for expiration
  true
FROM invoice_templates
WHERE template_key = 'commercial-letterhead';
*/

-- ============================================
-- OPTIONAL: Update existing templates display order
-- ============================================
-- If you want to reorder existing templates, uncomment and modify:

/*
UPDATE invoice_templates SET display_order = 1 WHERE template_key = 'modern';
UPDATE invoice_templates SET display_order = 2 WHERE template_key = 'classic';
UPDATE invoice_templates SET display_order = 3 WHERE template_key = 'excel';
UPDATE invoice_templates SET display_order = 4 WHERE template_key = 'letterhead';
UPDATE invoice_templates SET display_order = 5 WHERE template_key = 'dc';
UPDATE invoice_templates SET display_order = 6 WHERE template_key = 'commercial-letterhead';
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all templates
SELECT 
  name,
  template_key,
  is_paid,
  price,
  is_active,
  display_order
FROM invoice_templates
ORDER BY display_order;

-- Count total templates
SELECT COUNT(*) as total_templates FROM invoice_templates WHERE is_active = true;

-- Check if commercial-letterhead exists
SELECT EXISTS(
  SELECT 1 FROM invoice_templates WHERE template_key = 'commercial-letterhead'
) as template_exists;
