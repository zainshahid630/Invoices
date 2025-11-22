-- ============================================
-- FIX FUNCTION SEARCH PATH SECURITY
-- ============================================
-- This script adds SECURITY DEFINER and SET search_path
-- to all functions to prevent search_path injection attacks
-- ============================================

-- ============================================
-- 1. AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. STOCK CHANGE TRACKING FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION track_stock_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================
-- 3. AUTO-GENERATE INVOICE NUMBER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================
-- 4. GET INVOICE STATS OPTIMIZED FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_invoice_stats_optimized(p_company_id UUID)
RETURNS TABLE (
  total BIGINT,
  draft BIGINT,
  posted BIGINT,
  verified BIGINT,
  total_amount NUMERIC,
  pending_amount NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft,
    COUNT(*) FILTER (WHERE status = 'fbr_posted')::BIGINT as posted,
    COUNT(*) FILTER (WHERE status = 'verified')::BIGINT as verified,
    COALESCE(SUM(total_amount), 0) as total_amount,
    COALESCE(SUM(total_amount) FILTER (WHERE payment_status IN ('pending', 'partial')), 0) as pending_amount
  FROM invoices
  WHERE company_id = p_company_id 
    AND deleted_at IS NULL;
END;
$$;

-- ============================================
-- 5. UPDATE INVOICE STATUS TIMESTAMP (BONUS)
-- ============================================
CREATE OR REPLACE FUNCTION update_invoice_status_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================
-- 6. REDUCE STOCK ON INVOICE (BONUS)
-- ============================================
CREATE OR REPLACE FUNCTION reduce_stock_on_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================
-- 7. CALCULATE INVOICE TOTALS (BONUS)
-- ============================================
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================
-- 8. GET COMPANY STATS (BONUS)
-- ============================================
CREATE OR REPLACE FUNCTION get_company_stats(p_company_id UUID)
RETURNS TABLE (
  total_customers INTEGER,
  total_products INTEGER,
  total_invoices INTEGER,
  total_revenue DECIMAL(10, 2),
  pending_amount DECIMAL(10, 2),
  low_stock_products INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================
-- 9. GET CUSTOMER STATS (BONUS)
-- ============================================
CREATE OR REPLACE FUNCTION get_customer_stats(p_customer_id UUID)
RETURNS TABLE (
  total_invoices INTEGER,
  total_business DECIMAL(10, 2),
  pending_payments DECIMAL(10, 2),
  last_invoice_date DATE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  p.proname as function_name,
  CASE 
    WHEN p.prosecdef THEN '✅ SECURITY DEFINER'
    ELSE '❌ NOT SECURE'
  END as security,
  CASE 
    WHEN pg_get_function_identity_arguments(p.oid) = '' THEN 'trigger'
    ELSE 'callable'
  END as type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_updated_at_column',
    'track_stock_change',
    'generate_invoice_number',
    'get_invoice_stats_optimized',
    'update_invoice_status_timestamp',
    'reduce_stock_on_invoice',
    'calculate_invoice_totals',
    'get_company_stats',
    'get_customer_stats'
  )
ORDER BY p.proname;
