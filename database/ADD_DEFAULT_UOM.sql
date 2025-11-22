-- Quick Fix: Add default_uom to settings table
-- Copy and paste this into Supabase SQL Editor

-- Add column
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS default_uom VARCHAR(50) DEFAULT 'Numbers, pieces, units';

-- Update existing records
UPDATE settings 
SET default_uom = 'Numbers, pieces, units' 
WHERE default_uom IS NULL OR default_uom = '';

-- Verify
SELECT company_id, default_uom FROM settings;
