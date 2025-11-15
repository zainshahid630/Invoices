-- ============================================
-- SEED DATA FOR TESTING
-- ============================================
-- Note: This is optional test data for development
-- DO NOT use in production without changing passwords!
-- ============================================

-- ============================================
-- 1. INSERT TEST SUPER ADMIN
-- ============================================
-- Password: admin123 (you should hash this properly in production)
-- For now, this is a placeholder hash
INSERT INTO super_admins (email, password_hash, name) VALUES
('admin@saas-invoices.com', '$2a$10$rKZLvXZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', 'Super Admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. INSERT TEST COMPANIES
-- ============================================
INSERT INTO companies (id, name, business_name, address, ntn_number, gst_number, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'ABC Electronics', 'ABC Electronics Pvt Ltd', '123 Main Street, Karachi, Sindh', '1234567-8', 'GST-123456', true),
('22222222-2222-2222-2222-222222222222', 'XYZ Traders', 'XYZ Trading Company', '456 Business Avenue, Lahore, Punjab', '9876543-2', 'GST-987654', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. INSERT TEST SUBSCRIPTIONS
-- ============================================
INSERT INTO subscriptions (company_id, start_date, end_date, amount, status, payment_status) VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 12000.00, 'active', 'paid'),
('22222222-2222-2222-2222-222222222222', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 6000.00, 'active', 'paid')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. INSERT TEST USERS
-- ============================================
-- Password: seller123 (placeholder hash)
INSERT INTO users (id, company_id, email, password_hash, name, role, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin@abc-electronics.com', '$2a$10$rKZLvXZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', 'Ahmed Khan', 'admin', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'user@abc-electronics.com', '$2a$10$rKZLvXZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', 'Sara Ali', 'user', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'admin@xyz-traders.com', '$2a$10$rKZLvXZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', 'Hassan Ahmed', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 5. INSERT COMPANY SETTINGS
-- ============================================
INSERT INTO settings (company_id, invoice_prefix, invoice_counter, default_sales_tax_rate, default_further_tax_rate) VALUES
('11111111-1111-1111-1111-111111111111', 'INV', 1, 18.00, 1.00),
('22222222-2222-2222-2222-222222222222', 'XYZ', 1, 18.00, 0.00)
ON CONFLICT (company_id) DO NOTHING;

-- ============================================
-- 6. INSERT TEST PRODUCTS (ABC Electronics)
-- ============================================
INSERT INTO products (company_id, name, hs_code, uom, unit_price, warranty_months, description, current_stock, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'LED TV 43 Inch', '8528.72', 'PCS', 45000.00, 12, 'Full HD LED Television 43 inch', 25, true),
('11111111-1111-1111-1111-111111111111', 'Washing Machine 7KG', '8450.11', 'PCS', 35000.00, 24, 'Automatic Washing Machine 7KG capacity', 15, true),
('11111111-1111-1111-1111-111111111111', 'Refrigerator 14CFT', '8418.10', 'PCS', 55000.00, 12, 'Double Door Refrigerator 14 cubic feet', 10, true),
('11111111-1111-1111-1111-111111111111', 'Air Conditioner 1.5 Ton', '8415.10', 'PCS', 65000.00, 18, 'Split Type AC 1.5 Ton', 8, true),
('11111111-1111-1111-1111-111111111111', 'Microwave Oven', '8516.50', 'PCS', 12000.00, 6, '20L Microwave Oven', 30, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. INSERT TEST PRODUCTS (XYZ Traders)
-- ============================================
INSERT INTO products (company_id, name, hs_code, uom, unit_price, warranty_months, description, current_stock, is_active) VALUES
('22222222-2222-2222-2222-222222222222', 'Rice Basmati 5KG', '1006.30', 'BAG', 850.00, 0, 'Premium Basmati Rice 5KG', 500, true),
('22222222-2222-2222-2222-222222222222', 'Cooking Oil 5L', '1512.19', 'BTL', 1200.00, 0, 'Refined Cooking Oil 5 Liters', 300, true),
('22222222-2222-2222-2222-222222222222', 'Sugar 50KG', '1701.99', 'BAG', 4500.00, 0, 'White Sugar 50KG bag', 200, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. INSERT TEST CUSTOMERS (ABC Electronics)
-- ============================================
INSERT INTO customers (company_id, name, business_name, address, ntn_cnic, gst_number, province, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Ali Raza', 'Ali Electronics Shop', 'Shop 45, Saddar, Karachi', '42101-1234567-1', 'GST-111222', 'Sindh', true),
('11111111-1111-1111-1111-111111111111', 'Fatima Traders', 'Fatima Home Appliances', 'Plaza 12, Gulshan, Karachi', '3520123456789', 'GST-333444', 'Sindh', true),
('11111111-1111-1111-1111-111111111111', 'Bilal Store', 'Bilal General Store', 'Main Bazar, Hyderabad', '42201-9876543-2', NULL, 'Sindh', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. INSERT TEST CUSTOMERS (XYZ Traders)
-- ============================================
INSERT INTO customers (company_id, name, business_name, address, ntn_cnic, gst_number, province, is_active) VALUES
('22222222-2222-2222-2222-222222222222', 'Kareem Wholesale', 'Kareem Wholesale Mart', 'Anarkali Bazar, Lahore', '3310123456789', 'GST-555666', 'Punjab', true),
('22222222-2222-2222-2222-222222222222', 'Sana Retail', 'Sana Retail Store', 'Model Town, Lahore', '35202-7654321-8', NULL, 'Punjab', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. INSERT FEATURE TOGGLES
-- ============================================
INSERT INTO feature_toggles (company_id, feature_name, is_enabled) VALUES
('11111111-1111-1111-1111-111111111111', 'inventory_management', true),
('11111111-1111-1111-1111-111111111111', 'customer_management', true),
('11111111-1111-1111-1111-111111111111', 'invoice_creation', true),
('11111111-1111-1111-1111-111111111111', 'fbr_integration', true),
('11111111-1111-1111-1111-111111111111', 'payment_tracking', true),
('22222222-2222-2222-2222-222222222222', 'inventory_management', true),
('22222222-2222-2222-2222-222222222222', 'customer_management', true),
('22222222-2222-2222-2222-222222222222', 'invoice_creation', true),
('22222222-2222-2222-2222-222222222222', 'fbr_integration', false),
('22222222-2222-2222-2222-222222222222', 'payment_tracking', true)
ON CONFLICT (company_id, feature_name) DO NOTHING;

-- ============================================
-- 11. VERIFICATION QUERIES
-- ============================================

-- Check companies
SELECT 'Companies Created:' as info, COUNT(*) as count FROM companies;

-- Check users
SELECT 'Users Created:' as info, COUNT(*) as count FROM users;

-- Check products
SELECT 'Products Created:' as info, COUNT(*) as count FROM products;

-- Check customers
SELECT 'Customers Created:' as info, COUNT(*) as count FROM customers;

-- Check settings
SELECT 'Settings Created:' as info, COUNT(*) as count FROM settings;

-- Check feature toggles
SELECT 'Feature Toggles Created:' as info, COUNT(*) as count FROM feature_toggles;

-- Display all companies with their user count
SELECT 
  c.name as company_name,
  c.business_name,
  COUNT(u.id) as user_count,
  c.is_active
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
GROUP BY c.id, c.name, c.business_name, c.is_active;

-- Display products by company
SELECT 
  c.name as company_name,
  COUNT(p.id) as product_count,
  SUM(p.current_stock) as total_stock
FROM companies c
LEFT JOIN products p ON c.id = p.company_id
GROUP BY c.id, c.name;

-- Display customers by company
SELECT 
  c.name as company_name,
  COUNT(cu.id) as customer_count
FROM companies c
LEFT JOIN customers cu ON c.id = cu.company_id
GROUP BY c.id, c.name;

