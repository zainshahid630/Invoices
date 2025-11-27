-- Migration: Add FBR identifier preference to settings
-- Date: 2024-11-24
-- Description: Adds a field to choose between NTN or CNIC for FBR invoice posting

-- Add FBR identifier type preference to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS fbr_identifier_type VARCHAR(10) DEFAULT 'NTN';

-- Update all existing companies to use NTN as default
UPDATE settings 
SET fbr_identifier_type = 'NTN' 
WHERE fbr_identifier_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN settings.fbr_identifier_type IS 'Identifier type to use for FBR posting: NTN or CNIC';

-- Add check constraint to ensure only valid values
ALTER TABLE settings 
ADD CONSTRAINT check_fbr_identifier_type 
CHECK (fbr_identifier_type IN ('NTN', 'CNIC'));
