-- =====================================================
-- ADD LETTERHEAD TEMPLATE TO INVOICE_TEMPLATES TABLE
-- =====================================================
-- This script adds the new "Letterhead" template option
-- for invoices that will be printed on pre-printed letterhead paper
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Insert the new Letterhead template
INSERT INTO public.invoice_templates (
  id,
  name,
  description,
  template_key,
  is_active,
  preview_image_url,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Letterhead',
  'Professional template designed for pre-printed letterhead paper. Leaves space at top for company header.',
  'letterhead',
  true,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the template was added
SELECT * FROM public.invoice_templates WHERE template_key = 'letterhead';

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. This template is designed for businesses that use
--    pre-printed letterhead paper with company branding
--
-- 2. The template leaves 120mm space at the top for
--    the pre-printed header
--
-- 3. To use this template, add ?template=letterhead
--    to the print URL:
--    /seller/invoices/[id]/print?template=letterhead
--
-- 4. Features:
--    - Space for pre-printed letterhead (120mm)
--    - Clean table layout matching the sample
--    - Buyer information section
--    - Detailed item breakdown with taxes
--    - Summary section with signature line
--
-- =====================================================
