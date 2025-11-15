-- ============================================
-- INVOICE TEMPLATES TABLE
-- ============================================
-- This table stores invoice templates that can be used by sellers
-- Super Admin can add new templates and mark them as paid/free

CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'modern', 'classic', 'minimal', 'corporate'
  preview_image_url TEXT, -- URL to template preview image
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  features JSONB, -- JSON array of template features
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMPANY TEMPLATE ACCESS TABLE
-- ============================================
-- This table tracks which companies have access to which paid templates

CREATE TABLE company_template_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES invoice_templates(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES super_admins(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for lifetime access
  is_active BOOLEAN DEFAULT true,
  UNIQUE(company_id, template_id)
);

-- ============================================
-- INSERT DEFAULT TEMPLATES
-- ============================================

-- Modern Template (Free)
INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  features
) VALUES (
  'Modern Template',
  'Clean, contemporary design with blue gradient header. Perfect for tech companies and startups.',
  'modern',
  false,
  0.00,
  1,
  '["Blue gradient header", "Modern typography", "Clean minimal design", "FBR logo & QR code", "Professional layout"]'::jsonb
);

-- Classic Template (Free)
INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  features
) VALUES (
  'Classic Template',
  'Traditional, formal design with bold borders. Ideal for traditional businesses and law firms.',
  'classic',
  false,
  0.00,
  2,
  '["Bold borders", "Serif typography", "Formal structured layout", "FBR logo & QR code", "Alternating row colors"]'::jsonb
);

-- Minimal Template (Paid)
INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  features
) VALUES (
  'Minimal Template',
  'Ultra-clean minimalist design with maximum white space. For premium brands.',
  'minimal',
  true,
  499.00,
  3,
  '["Minimalist design", "Maximum white space", "Premium typography", "FBR logo & QR code", "Elegant layout"]'::jsonb
);

-- Corporate Template (Paid)
INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  features
) VALUES (
  'Corporate Template',
  'Professional corporate design with company branding. Perfect for large enterprises.',
  'corporate',
  true,
  799.00,
  4,
  '["Corporate branding", "Custom color schemes", "Logo integration", "FBR logo & QR code", "Multi-page support"]'::jsonb
);

-- Creative Template (Paid)
INSERT INTO invoice_templates (
  name,
  description,
  template_key,
  is_paid,
  price,
  display_order,
  features
) VALUES (
  'Creative Template',
  'Bold, creative design with vibrant colors. Ideal for creative agencies and designers.',
  'creative',
  true,
  599.00,
  5,
  '["Vibrant colors", "Creative layout", "Modern design", "FBR logo & QR code", "Unique styling"]'::jsonb
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_invoice_templates_active ON invoice_templates(is_active);
CREATE INDEX idx_invoice_templates_paid ON invoice_templates(is_paid);
CREATE INDEX idx_company_template_access_company ON company_template_access(company_id);
CREATE INDEX idx_company_template_access_template ON company_template_access(template_id);

