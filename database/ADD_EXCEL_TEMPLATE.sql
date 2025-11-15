-- ============================================
-- ADD EXCEL TEMPLATE TO INVOICE TEMPLATES
-- ============================================
-- This adds a simple Excel-style template optimized for black and white printing

INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  features
) VALUES (
  'Excel Template',
  'Simple spreadsheet-style design optimized for black and white printing. Clean grid layout perfect for professional documentation.',
  'excel',
  false,
  0.00,
  6,
  '["Excel-style grid layout", "B&W print optimized", "Clean table design", "FBR logo & QR code", "Professional spreadsheet format", "Easy to read"]'::jsonb
)
ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_paid = EXCLUDED.is_paid,
  price = EXCLUDED.price,
  display_order = EXCLUDED.display_order,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Verify the template was added
SELECT 
  id,
  name,
  template_key,
  is_paid,
  price,
  display_order,
  is_active
FROM invoice_templates
WHERE template_key = 'excel';
