-- ============================================
-- ADD 20 RANDOM TEST COMPANIES
-- ============================================
-- Run this SQL in Supabase SQL Editor to add 20 test companies
-- Each company will have:
-- - Random business details
-- - Active subscription
-- - Default settings
-- - Enabled features
-- ============================================

-- Insert 20 test companies
INSERT INTO companies (
  name,
  business_name,
  ntn,
  strn,
  address,
  city,
  province,
  phone,
  email,
  logo_url,
  is_active
) VALUES
  ('Tech Solutions Ltd', 'Tech Solutions Private Limited', '1234567-8', 'STRN-001', '123 Main Street, Block A', 'Karachi', 'Sindh', '+92-21-1234567', 'info@techsolutions.pk', NULL, true),
  ('Global Traders', 'Global Traders International', '2345678-9', 'STRN-002', '456 Commerce Avenue', 'Lahore', 'Punjab', '+92-42-2345678', 'contact@globaltraders.pk', NULL, true),
  ('Prime Industries', 'Prime Industries (Pvt) Ltd', '3456789-0', 'STRN-003', '789 Industrial Zone', 'Faisalabad', 'Punjab', '+92-41-3456789', 'sales@primeindustries.pk', NULL, true),
  ('Metro Enterprises', 'Metro Enterprises Corporation', '4567890-1', 'STRN-004', '321 Business District', 'Islamabad', 'Islamabad Capital Territory', '+92-51-4567890', 'info@metroenterprises.pk', NULL, true),
  ('Sunrise Trading Co', 'Sunrise Trading Company', '5678901-2', 'STRN-005', '654 Market Road', 'Rawalpindi', 'Punjab', '+92-51-5678901', 'contact@sunrisetrading.pk', NULL, true),
  ('Elite Textiles', 'Elite Textiles Manufacturing', '6789012-3', 'STRN-006', '987 Textile Mills Area', 'Multan', 'Punjab', '+92-61-6789012', 'sales@elitetextiles.pk', NULL, true),
  ('Ocean Logistics', 'Ocean Logistics Services', '7890123-4', 'STRN-007', '147 Port Area', 'Karachi', 'Sindh', '+92-21-7890123', 'info@oceanlogistics.pk', NULL, true),
  ('Smart Electronics', 'Smart Electronics & Appliances', '8901234-5', 'STRN-008', '258 Electronics Market', 'Lahore', 'Punjab', '+92-42-8901234', 'support@smartelectronics.pk', NULL, true),
  ('Green Agro Farms', 'Green Agro Farms Limited', '9012345-6', 'STRN-009', '369 Agricultural Zone', 'Sahiwal', 'Punjab', '+92-40-9012345', 'info@greenagro.pk', NULL, true),
  ('Royal Builders', 'Royal Builders & Developers', '0123456-7', 'STRN-010', '741 Construction Site', 'Peshawar', 'Khyber Pakhtunkhwa', '+92-91-0123456', 'contact@royalbuilders.pk', NULL, true),
  ('Diamond Jewelers', 'Diamond Jewelers International', '1234560-8', 'STRN-011', '852 Jewelry Market', 'Karachi', 'Sindh', '+92-21-1234560', 'sales@diamondjewelers.pk', NULL, true),
  ('Fast Food Chain', 'Fast Food Chain Pakistan', '2345601-9', 'STRN-012', '963 Food Street', 'Lahore', 'Punjab', '+92-42-2345601', 'franchise@fastfoodchain.pk', NULL, true),
  ('Medical Supplies Co', 'Medical Supplies Corporation', '3456012-0', 'STRN-013', '159 Hospital Road', 'Islamabad', 'Islamabad Capital Territory', '+92-51-3456012', 'orders@medicalsupplies.pk', NULL, true),
  ('Auto Parts Hub', 'Auto Parts Hub (Pvt) Ltd', '4560123-1', 'STRN-014', '357 Auto Market', 'Gujranwala', 'Punjab', '+92-55-4560123', 'info@autopartshub.pk', NULL, true),
  ('Fashion Boutique', 'Fashion Boutique & Accessories', '5601234-2', 'STRN-015', '468 Fashion Avenue', 'Karachi', 'Sindh', '+92-21-5601234', 'style@fashionboutique.pk', NULL, true),
  ('Power Energy Ltd', 'Power Energy Solutions Limited', '6012345-3', 'STRN-016', '579 Energy Sector', 'Quetta', 'Balochistan', '+92-81-6012345', 'info@powerenergy.pk', NULL, true),
  ('Book Publishers', 'Book Publishers & Distributors', '7012345-4', 'STRN-017', '680 Publishing House', 'Lahore', 'Punjab', '+92-42-7012345', 'publish@bookpublishers.pk', NULL, true),
  ('Furniture Mart', 'Furniture Mart & Interiors', '8012345-5', 'STRN-018', '791 Furniture Plaza', 'Sialkot', 'Punjab', '+92-52-8012345', 'sales@furnituremart.pk', NULL, true),
  ('Chemical Industries', 'Chemical Industries Pakistan', '9012345-6', 'STRN-019', '802 Industrial Estate', 'Karachi', 'Sindh', '+92-21-9012345', 'info@chemicalindustries.pk', NULL, true),
  ('Sports Goods Export', 'Sports Goods Export House', '0123456-7', 'STRN-020', '913 Sports Complex', 'Sialkot', 'Punjab', '+92-52-0123456', 'export@sportsgoodsexport.pk', NULL, true);

-- Get the IDs of the newly inserted companies
DO $$
DECLARE
  company_record RECORD;
  subscription_start DATE := CURRENT_DATE;
  subscription_end DATE := CURRENT_DATE + INTERVAL '1 year';
BEGIN
  -- Loop through all companies that don't have subscriptions yet
  FOR company_record IN 
    SELECT c.id, c.name 
    FROM companies c
    LEFT JOIN subscriptions s ON c.id = s.company_id
    WHERE s.id IS NULL
    ORDER BY c.created_at DESC
    LIMIT 20
  LOOP
    -- Insert subscription for each company
    INSERT INTO subscriptions (
      company_id,
      plan_name,
      start_date,
      end_date,
      amount,
      status,
      payment_status
    ) VALUES (
      company_record.id,
      'Professional',
      subscription_start,
      subscription_end,
      15000.00,
      'active',
      'paid'
    );

    -- Insert default settings for each company
    INSERT INTO settings (
      company_id,
      invoice_prefix,
      invoice_counter,
      default_sales_tax_rate,
      default_further_tax_rate,
      default_currency,
      fbr_pos_id,
      fbr_token
    ) VALUES (
      company_record.id,
      'INV',
      1,
      18.0,
      0.0,
      'PKR',
      NULL,
      NULL
    )
    ON CONFLICT (company_id) DO NOTHING;

    -- Insert feature toggles for each company
    INSERT INTO feature_toggles (company_id, feature_name, is_enabled)
    VALUES
      (company_record.id, 'inventory_management', true),
      (company_record.id, 'customer_management', true),
      (company_record.id, 'invoice_creation', true),
      (company_record.id, 'fbr_integration', true),
      (company_record.id, 'payment_tracking', true),
      (company_record.id, 'reports', true)
    ON CONFLICT (company_id, feature_name) DO NOTHING;

    RAISE NOTICE 'Created subscription and settings for company: %', company_record.name;
  END LOOP;
END $$;

-- Verify the results
SELECT 
  c.name,
  c.business_name,
  c.city,
  c.province,
  c.is_active,
  s.plan_name,
  s.status as subscription_status,
  s.end_date
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
ORDER BY c.created_at DESC
LIMIT 20;

-- Summary
SELECT 
  COUNT(*) as total_companies,
  SUM(CASE WHEN c.is_active = true THEN 1 ELSE 0 END) as active_companies,
  SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as active_subscriptions
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id;

