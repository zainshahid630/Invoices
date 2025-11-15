-- ============================================
-- Add default_hs_code column to settings table
-- ============================================

-- Add default_hs_code field to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_hs_code VARCHAR(50);

-- Add comment
COMMENT ON COLUMN settings.default_hs_code IS 'Default HS Code to auto-fill in invoice line items';

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the column was added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'settings' 
-- AND column_name = 'default_hs_code';

-- Check sample data:
-- SELECT id, company_id, default_hs_code 
-- FROM settings 
-- LIMIT 5;
