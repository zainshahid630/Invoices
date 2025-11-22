-- ============================================
-- Add phone field to customers table
-- ============================================

-- Add phone field to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add comment
COMMENT ON COLUMN customers.phone IS 'Customer phone number for contact and WhatsApp';

-- Create index on customers phone for faster searching
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ============================================
-- Verification Query
-- ============================================
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'customers' 
-- AND column_name = 'phone';
