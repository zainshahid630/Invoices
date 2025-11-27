-- Migration: Add DC Template to invoice templates
-- Date: 2024-11-24
-- Description: Add DC Template option to the invoice_templates table

-- Insert DC Template if it doesn't exist
INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  features,
  is_active
) VALUES (
  'DC Template',
  'Professional template with orange accents, ideal for delivery challans and sales tax invoices. Features prominent DC number display.',
  'dc',
  false,
  0.00,
  6,
  '["Orange accent bars", "DC number display", "Professional layout", "FBR logo & QR code", "Sales tax format"]'::jsonb,
  true
)
ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  features = EXCLUDED.features;

-- Update existing templates if they don't exist
INSERT INTO invoice_templates (name, description, template_key, is_paid, price, display_order, is_active)
VALUES 
  ('Modern Template', 'Clean and modern design with a professional look', 'modern', false, 0.00, 1, true),
  ('Excel Template', 'Spreadsheet-style layout similar to Excel', 'excel', false, 0.00, 2, true),
  ('Classic Template', 'Traditional invoice layout', 'classic', false, 0.00, 3, true),
  ('Letterhead Template', 'Template with letterhead space at top', 'letterhead', false, 0.00, 4, true)
ON CONFLICT (template_key) DO NOTHING;

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  invoice_template VARCHAR(100) DEFAULT 'modern',
  invoice_prefix VARCHAR(20) DEFAULT 'INV',
  invoice_counter INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Add comment
COMMENT ON TABLE invoice_templates IS 'Available invoice templates for the system';
COMMENT ON COLUMN settings.invoice_template IS 'Selected invoice template name (references invoice_templates.name)';
