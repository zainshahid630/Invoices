-- ============================================
-- COMPLETE DATABASE SETUP
-- SaaS Invoice Management System
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- This combines: schema + RLS + functions + triggers
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: CREATE TABLES
-- ============================================

-- 1. Super Admins
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  address TEXT,
  ntn_number VARCHAR(50),
  gst_number VARCHAR(50),
  fbr_token TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  hs_code VARCHAR(50),
  uom VARCHAR(50),
  unit_price DECIMAL(10, 2) NOT NULL,
  warranty_months INTEGER DEFAULT 0,
  description TEXT,
  current_stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Stock History
CREATE TABLE stock_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  address TEXT,
  ntn_cnic VARCHAR(50),
  gst_number VARCHAR(50),
  province VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  invoice_type VARCHAR(50) NOT NULL,
  scenario VARCHAR(100),
  buyer_name VARCHAR(255),
  buyer_business_name VARCHAR(255),
  buyer_ntn_cnic VARCHAR(50),
  buyer_address TEXT,
  buyer_province VARCHAR(100),
  subtotal DECIMAL(10, 2) NOT NULL,
  sales_tax_rate DECIMAL(5, 2),
  sales_tax_amount DECIMAL(10, 2),
  further_tax_rate DECIMAL(5, 2),
  further_tax_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  fbr_posted_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Invoice Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  item_name VARCHAR(255) NOT NULL,
  hs_code VARCHAR(50),
  uom VARCHAR(50),
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  customer_id UUID REFERENCES customers(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  payment_type VARCHAR(50),
  reference_number VARCHAR(100),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  invoice_prefix VARCHAR(20) DEFAULT 'INV',
  invoice_counter INTEGER DEFAULT 1,
  default_sales_tax_rate DECIMAL(5, 2) DEFAULT 0,
  default_further_tax_rate DECIMAL(5, 2) DEFAULT 0,
  invoice_template TEXT,
  other_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Feature Toggles
CREATE TABLE feature_toggles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, feature_name)
);

-- ============================================
-- PART 2: CREATE INDEXES
-- ============================================
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_stock_history_product ON stock_history(product_id);
CREATE INDEX idx_stock_history_company ON stock_history(company_id);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_customers_active ON customers(is_active);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items(product_id);
CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);

-- ============================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================
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

-- ============================================
-- PART 4: CREATE RLS POLICIES
-- ============================================

-- Companies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE company_id = companies.id));

-- Users
CREATE POLICY "Users can view users from their company"
  ON users FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Products
CREATE POLICY "Users can manage products from their company"
  ON products FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Stock History
CREATE POLICY "Users can view stock history from their company"
  ON stock_history FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Customers
CREATE POLICY "Users can manage customers from their company"
  ON customers FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Invoices
CREATE POLICY "Users can manage invoices from their company"
  ON invoices FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Invoice Items
CREATE POLICY "Users can manage invoice items from their company"
  ON invoice_items FOR ALL
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  ));

-- Payments
CREATE POLICY "Users can manage payments from their company"
  ON payments FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Settings
CREATE POLICY "Users can view settings from their company"
  ON settings FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Feature Toggles
CREATE POLICY "Users can view feature toggles from their company"
  ON feature_toggles FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Subscriptions
CREATE POLICY "Users can view subscriptions from their company"
  ON subscriptions FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- PART 5: CREATE FUNCTIONS
-- ============================================

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Stock change tracking function
CREATE OR REPLACE FUNCTION track_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_stock != NEW.current_stock THEN
    INSERT INTO stock_history (
      product_id, company_id, change_type, quantity,
      previous_stock, new_stock, reason
    ) VALUES (
      NEW.id, NEW.company_id,
      CASE WHEN NEW.current_stock > OLD.current_stock THEN 'in' ELSE 'out' END,
      ABS(NEW.current_stock - OLD.current_stock),
      OLD.current_stock, NEW.current_stock, 'Stock updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate invoice number function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  company_settings RECORD;
  new_invoice_number VARCHAR(50);
  current_year VARCHAR(4);
BEGIN
  SELECT * INTO company_settings FROM settings WHERE company_id = NEW.company_id;

  IF NOT FOUND THEN
    INSERT INTO settings (company_id, invoice_prefix, invoice_counter)
    VALUES (NEW.company_id, 'INV', 1)
    RETURNING * INTO company_settings;
  END IF;

  current_year := TO_CHAR(NEW.invoice_date, 'YYYY');
  new_invoice_number := company_settings.invoice_prefix || '-' ||
                        current_year || '-' ||
                        LPAD(company_settings.invoice_counter::TEXT, 5, '0');

  UPDATE settings
  SET invoice_counter = invoice_counter + 1
  WHERE company_id = NEW.company_id;

  NEW.invoice_number := new_invoice_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 6: CREATE TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER update_super_admins_updated_at BEFORE UPDATE ON super_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_toggles_updated_at BEFORE UPDATE ON feature_toggles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stock tracking trigger
CREATE TRIGGER track_product_stock_changes AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION track_stock_change();

-- Invoice number generation trigger
CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Verify tables created
SELECT 'Tables Created:' as status, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public';

-- Verify RLS enabled
SELECT 'RLS Enabled:' as status, COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;

