-- ============================================
-- ADD FBR VALIDATION FIELDS
-- ============================================
-- Run this SQL in Supabase SQL Editor to add missing fields for FBR validation

-- Add province field to companies table (for seller province)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS province VARCHAR(100);

-- Add phone and email fields to companies table (for seller contact info)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add buyer_registration_type field to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_registration_type VARCHAR(50) DEFAULT 'Unregistered';

-- Add comment
COMMENT ON COLUMN companies.province IS 'Province where the company/seller is located (e.g., Sindh, Punjab, KPK, Balochistan)';
COMMENT ON COLUMN companies.phone IS 'Company contact phone number';
COMMENT ON COLUMN companies.email IS 'Company contact email address';
COMMENT ON COLUMN invoices.buyer_registration_type IS 'Buyer registration type for FBR (Registered/Unregistered)';

-- Update existing records to have default values
UPDATE companies SET province = 'Sindh' WHERE province IS NULL;
UPDATE companies SET phone = '' WHERE phone IS NULL;
UPDATE companies SET email = '' WHERE email IS NULL;
UPDATE invoices SET buyer_registration_type = 'Unregistered' WHERE buyer_registration_type IS NULL;

