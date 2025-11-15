-- ============================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ============================================

-- ============================================
-- 1. AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_super_admins_updated_at 
  BEFORE UPDATE ON super_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_toggles_updated_at 
  BEFORE UPDATE ON feature_toggles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. STOCK CHANGE TRACKING FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION track_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_stock != NEW.current_stock THEN
    INSERT INTO stock_history (
      product_id,
      company_id,
      change_type,
      quantity,
      previous_stock,
      new_stock,
      reason
    ) VALUES (
      NEW.id,
      NEW.company_id,
      CASE 
        WHEN NEW.current_stock > OLD.current_stock THEN 'in'
        ELSE 'out'
      END,
      ABS(NEW.current_stock - OLD.current_stock),
      OLD.current_stock,
      NEW.current_stock,
      'Stock updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply stock tracking trigger
CREATE TRIGGER track_product_stock_changes 
  AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION track_stock_change();

-- ============================================
-- 3. AUTO-GENERATE INVOICE NUMBER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  company_settings RECORD;
  new_invoice_number VARCHAR(50);
  current_year VARCHAR(4);
BEGIN
  -- Get company settings
  SELECT * INTO company_settings FROM settings WHERE company_id = NEW.company_id;
  
  -- If no settings exist, create default
  IF NOT FOUND THEN
    INSERT INTO settings (company_id, invoice_prefix, invoice_counter)
    VALUES (NEW.company_id, 'INV', 1)
    RETURNING * INTO company_settings;
  END IF;
  
  -- Get current year
  current_year := TO_CHAR(NEW.invoice_date, 'YYYY');
  
  -- Generate invoice number: INV-2025-00001
  new_invoice_number := company_settings.invoice_prefix || '-' || 
                        current_year || '-' || 
                        LPAD(company_settings.invoice_counter::TEXT, 5, '0');
  
  -- Update counter
  UPDATE settings 
  SET invoice_counter = invoice_counter + 1 
  WHERE company_id = NEW.company_id;
  
  -- Set the invoice number
  NEW.invoice_number := new_invoice_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply invoice number generation trigger
CREATE TRIGGER generate_invoice_number_trigger 
  BEFORE INSERT ON invoices
  FOR EACH ROW 
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- 4. UPDATE INVOICE STATUS TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_invoice_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update fbr_posted_at when status changes to fbr_posted
  IF NEW.status = 'fbr_posted' AND OLD.status != 'fbr_posted' THEN
    NEW.fbr_posted_at := NOW();
  END IF;
  
  -- Update verified_at when status changes to verified
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    NEW.verified_at := NOW();
  END IF;
  
  -- Update paid_at when status changes to paid
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    NEW.paid_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply invoice status timestamp trigger
CREATE TRIGGER update_invoice_status_timestamps 
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoice_status_timestamp();

-- ============================================
-- 5. REDUCE STOCK ON INVOICE CREATION
-- ============================================
CREATE OR REPLACE FUNCTION reduce_stock_on_invoice()
RETURNS TRIGGER AS $$
DECLARE
  invoice_item RECORD;
BEGIN
  -- Only reduce stock when invoice status changes to verified or paid
  IF NEW.status IN ('verified', 'paid') AND OLD.status NOT IN ('verified', 'paid') THEN
    -- Loop through all invoice items
    FOR invoice_item IN 
      SELECT * FROM invoice_items WHERE invoice_id = NEW.id
    LOOP
      -- Update product stock if product_id exists
      IF invoice_item.product_id IS NOT NULL THEN
        UPDATE products 
        SET current_stock = current_stock - invoice_item.quantity
        WHERE id = invoice_item.product_id;
        
        -- Insert stock history record
        INSERT INTO stock_history (
          product_id,
          company_id,
          change_type,
          quantity,
          previous_stock,
          new_stock,
          reason,
          reference_type,
          reference_id,
          created_by
        )
        SELECT 
          invoice_item.product_id,
          NEW.company_id,
          'out',
          invoice_item.quantity,
          p.current_stock + invoice_item.quantity,
          p.current_stock,
          'Invoice: ' || NEW.invoice_number,
          'invoice',
          NEW.id,
          NEW.created_by
        FROM products p
        WHERE p.id = invoice_item.product_id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply stock reduction trigger
CREATE TRIGGER reduce_stock_on_invoice_trigger 
  AFTER UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION reduce_stock_on_invoice();

-- ============================================
-- 6. CALCULATE INVOICE TOTALS
-- ============================================
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  invoice_record RECORD;
  items_subtotal DECIMAL(10, 2);
BEGIN
  -- Get the invoice
  SELECT * INTO invoice_record FROM invoices WHERE id = NEW.invoice_id;
  
  -- Calculate subtotal from all items
  SELECT COALESCE(SUM(line_total), 0) INTO items_subtotal
  FROM invoice_items
  WHERE invoice_id = NEW.invoice_id;
  
  -- Update invoice totals
  UPDATE invoices
  SET 
    subtotal = items_subtotal,
    sales_tax_amount = items_subtotal * (COALESCE(sales_tax_rate, 0) / 100),
    further_tax_amount = items_subtotal * (COALESCE(further_tax_rate, 0) / 100),
    total_amount = items_subtotal + 
                   (items_subtotal * (COALESCE(sales_tax_rate, 0) / 100)) +
                   (items_subtotal * (COALESCE(further_tax_rate, 0) / 100))
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply invoice totals calculation trigger
CREATE TRIGGER calculate_invoice_totals_on_insert 
  AFTER INSERT ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

CREATE TRIGGER calculate_invoice_totals_on_update 
  AFTER UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

CREATE TRIGGER calculate_invoice_totals_on_delete 
  AFTER DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- ============================================
-- 7. HELPER FUNCTION: GET COMPANY STATS
-- ============================================
CREATE OR REPLACE FUNCTION get_company_stats(p_company_id UUID)
RETURNS TABLE (
  total_customers INTEGER,
  total_products INTEGER,
  total_invoices INTEGER,
  total_revenue DECIMAL(10, 2),
  pending_amount DECIMAL(10, 2),
  low_stock_products INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM customers WHERE company_id = p_company_id AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM products WHERE company_id = p_company_id AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM invoices WHERE company_id = p_company_id),
    (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE company_id = p_company_id AND status = 'paid'),
    (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE company_id = p_company_id AND status IN ('verified', 'fbr_posted') AND status != 'paid'),
    (SELECT COUNT(*)::INTEGER FROM products WHERE company_id = p_company_id AND current_stock < 10 AND is_active = true);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. HELPER FUNCTION: GET CUSTOMER STATS
-- ============================================
CREATE OR REPLACE FUNCTION get_customer_stats(p_customer_id UUID)
RETURNS TABLE (
  total_invoices INTEGER,
  total_business DECIMAL(10, 2),
  pending_payments DECIMAL(10, 2),
  last_invoice_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER,
    COALESCE(SUM(total_amount), 0),
    COALESCE(SUM(CASE WHEN status != 'paid' THEN total_amount ELSE 0 END), 0),
    MAX(invoice_date)
  FROM invoices
  WHERE customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

