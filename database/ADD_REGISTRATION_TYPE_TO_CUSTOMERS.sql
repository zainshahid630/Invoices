-- ============================================
-- Add registration_type column to customers table
-- ============================================

-- Add registration_type field to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS registration_type VARCHAR(50) DEFAULT 'Unregistered';

-- Add comment
COMMENT ON COLUMN customers.registration_type IS 'Customer registration type for FBR (Registered/Unregistered)';

-- Update existing customers to have default registration_type
UPDATE customers 
SET registration_type = 'Unregistered' 
WHERE registration_type IS NULL OR registration_type = '';

-- Create index on customers registration_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_customers_registration_type ON customers(registration_type);

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the column was added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'customers' 
-- AND column_name = 'registration_type';

-- Check sample data:
-- SELECT id, name, registration_type 
-- FROM customers 
-- LIMIT 5;
