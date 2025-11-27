-- Migration: Add sale_type column to invoice_items table
-- Date: 2024-11-24
-- Description: Add sale_type column to store transaction type for each invoice item

-- Add sale_type column to invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS sale_type VARCHAR(255) DEFAULT 'Goods at standard rate (default)';

-- Add comment to the column
COMMENT ON COLUMN invoice_items.sale_type IS 'FBR transaction type for the item (e.g., Goods at standard rate, Zero rated, Exempt, etc.)';

-- Update existing records to have default sale_type
UPDATE invoice_items 
SET sale_type = 'Goods at standard rate (default)' 
WHERE sale_type IS NULL;
