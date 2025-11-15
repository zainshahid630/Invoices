-- Add payment_status field to invoices table (OPTIONAL)
-- This is separate from the invoice status and tracks payment specifically
-- Run this migration if you want to track payment status separately

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Add comment
COMMENT ON COLUMN invoices.payment_status IS 'Payment status: pending, partial, paid, overdue';

-- Add check constraint for valid payment statuses
ALTER TABLE invoices 
ADD CONSTRAINT invoices_payment_status_check 
CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled'));

