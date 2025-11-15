-- STEP 1: Create invoice_templates table
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_key VARCHAR(100) UNIQUE NOT NULL,
  preview_image_url TEXT,
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Create company_template_access table
CREATE TABLE company_template_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES invoice_templates(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES super_admins(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(company_id, template_id)
);

