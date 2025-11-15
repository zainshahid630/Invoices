-- Add PO Number field to invoices table
-- Run this migration to add the po_number column

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);

-- Add comment
COMMENT ON COLUMN invoices.po_number IS 'Purchase Order number reference';

