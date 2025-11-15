-- ============================================
-- Add buyer_gst_number column to invoices table
-- ============================================

-- Add buyer_gst_number field to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_gst_number VARCHAR(50);

-- Add comment
COMMENT ON COLUMN invoices.buyer_gst_number IS 'Buyer GST number for invoice (can be from customer or manual entry)';

-- Create index on invoices buyer_gst_number for faster searching
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_gst_number ON invoices(buyer_gst_number);

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the column was added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'invoices' 
-- AND column_name = 'buyer_gst_number';

-- Check sample data:
-- SELECT id, invoice_number, buyer_name, buyer_gst_number 
-- FROM invoices 
-- LIMIT 5;
