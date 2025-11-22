-- Add JazzCash payment gateway support
-- Run this migration to add JazzCash payment tracking

-- Add new columns to payments table for JazzCash integration
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gateway_response_code VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gateway_response_message TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gateway_raw_response JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'completed';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_gateway_txn ON payments(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments(payment_gateway);

-- Add comment
COMMENT ON COLUMN payments.payment_gateway IS 'Payment gateway used: jazzcash, stripe, manual, etc.';
COMMENT ON COLUMN payments.gateway_transaction_id IS 'Transaction ID from payment gateway';
COMMENT ON COLUMN payments.payment_status IS 'Payment status: pending, completed, failed, refunded';
