-- ============================================
-- FBR VALIDATION MIGRATION
-- ============================================
-- Run this SQL in Supabase SQL Editor to add all required fields for FBR validation
-- Copy and paste this entire file into Supabase SQL Editor and execute

-- ============================================
-- 1. ADD FIELDS TO COMPANIES TABLE
-- ============================================

-- Add province field to companies table (for seller province)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS province VARCHAR(100);

-- Add phone field to companies table (for seller contact)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Add email field to companies table (for seller contact)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add comments to new columns
COMMENT ON COLUMN companies.province IS 'Province where the company/seller is located (e.g., Sindh, Punjab, KPK, Balochistan)';
COMMENT ON COLUMN companies.phone IS 'Company contact phone number';
COMMENT ON COLUMN companies.email IS 'Company contact email address';

-- ============================================
-- 2. ADD FIELDS TO INVOICES TABLE
-- ============================================



-- Add buyer_registration_type field to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_registration_type VARCHAR(50) DEFAULT 'Unregistered';

-- Add comment
COMMENT ON COLUMN invoices.buyer_registration_type IS 'Buyer registration type for FBR (Registered/Unregistered)';

-- ============================================
-- 3. UPDATE EXISTING RECORDS WITH DEFAULT VALUES
-- ============================================

-- Update existing companies to have default province (Sindh)
UPDATE companies 
SET province = 'Sindh' 
WHERE province IS NULL OR province = '';

-- Update existing companies to have empty phone if null
UPDATE companies 
SET phone = '' 
WHERE phone IS NULL;

-- Update existing companies to have empty email if null
UPDATE companies 
SET email = '' 
WHERE email IS NULL;

-- Update existing invoices to have default buyer_registration_type
UPDATE invoices 
SET buyer_registration_type = 'Unregistered' 
WHERE buyer_registration_type IS NULL OR buyer_registration_type = '';

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Create index on companies province for faster filtering
CREATE INDEX IF NOT EXISTS idx_companies_province ON companies(province);

-- Create index on invoices buyer_registration_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_registration_type ON invoices(buyer_registration_type);

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================
-- Run these queries after migration to verify the changes

-- Verify companies table structure
-- SELECT column_name, data_type, character_maximum_length, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'companies'
-- AND column_name IN ('province', 'phone', 'email')
-- ORDER BY column_name;

-- Verify invoices table structure
-- SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'invoices'
-- AND column_name = 'buyer_registration_type';

-- Check updated companies data
-- SELECT id, name, province, phone, email
-- FROM companies
-- LIMIT 5;

-- Check updated invoices data
-- SELECT id, invoice_number, buyer_registration_type
-- FROM invoices
-- LIMIT 5;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All fields required for FBR validation have been added successfully!

