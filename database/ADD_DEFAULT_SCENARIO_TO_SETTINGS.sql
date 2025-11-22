-- ============================================
-- Add default_scenario and default_uom fields to settings table
-- ============================================

-- Add default_scenario field to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_scenario VARCHAR(10) DEFAULT 'SN002';

-- Add default_uom field to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_uom VARCHAR(50) DEFAULT 'Numbers, pieces, units';

-- Add comments
COMMENT ON COLUMN settings.default_scenario IS 'Default FBR scenario for new invoices (e.g., SN001, SN002)';
COMMENT ON COLUMN settings.default_uom IS 'Default Unit of Measurement for first item in new invoices';

-- Update existing settings to have default values
UPDATE settings 
SET default_scenario = 'SN002' 
WHERE default_scenario IS NULL OR default_scenario = '';

UPDATE settings 
SET default_uom = 'Numbers, pieces, units' 
WHERE default_uom IS NULL OR default_uom = '';

-- Create indexes for faster filtering (optional)
CREATE INDEX IF NOT EXISTS idx_settings_default_scenario ON settings(default_scenario);
CREATE INDEX IF NOT EXISTS idx_settings_default_uom ON settings(default_uom);

-- ============================================
-- Verification Query
-- ============================================
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'settings' 
-- AND column_name = 'default_scenario';

-- Check sample data:
-- SELECT company_id, default_scenario, default_sales_tax_rate
-- FROM settings 
-- LIMIT 5;
