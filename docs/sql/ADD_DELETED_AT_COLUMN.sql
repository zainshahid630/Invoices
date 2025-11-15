-- ============================================
-- ADD SOFT DELETE COLUMN TO INVOICES TABLE
-- ============================================
-- Copy and paste this into Supabase SQL Editor and click RUN

-- Add deleted_at column to invoices table
ALTER TABLE invoices ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when filtering deleted invoices
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);

-- Create index for company_id and deleted_at combination
CREATE INDEX idx_invoices_company_deleted ON invoices(company_id, deleted_at);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invoices' AND column_name = 'deleted_at';

