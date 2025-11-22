-- Add FBR-related fields to invoices table if they don't exist

-- Add fbr_invoice_number column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'fbr_invoice_number'
    ) THEN
        ALTER TABLE invoices ADD COLUMN fbr_invoice_number VARCHAR(255);
        CREATE INDEX idx_invoices_fbr_invoice_number ON invoices(fbr_invoice_number);
    END IF;
END $$;

-- Add verified_at column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN verified_at TIMESTAMP;
    END IF;
END $$;

-- Add fbr_response column to store full FBR API response
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'fbr_response'
    ) THEN
        ALTER TABLE invoices ADD COLUMN fbr_response JSONB;
    END IF;
END $$;

-- Update existing verified invoices to have verified_at timestamp if null
UPDATE invoices 
SET verified_at = updated_at 
WHERE status = 'verified' AND verified_at IS NULL;

-- Add comment to explain the fields
COMMENT ON COLUMN invoices.fbr_invoice_number IS 'FBR-assigned invoice number after validation';
COMMENT ON COLUMN invoices.verified_at IS 'Timestamp when invoice was verified with FBR';
COMMENT ON COLUMN invoices.fbr_response IS 'Full JSON response from FBR API for audit trail';
