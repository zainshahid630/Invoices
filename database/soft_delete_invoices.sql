-- Add deleted_at column to invoices table for soft delete
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when filtering deleted invoices
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices(deleted_at);

-- Create index for company_id and deleted_at combination
CREATE INDEX IF NOT EXISTS idx_invoices_company_deleted ON invoices(company_id, deleted_at);

