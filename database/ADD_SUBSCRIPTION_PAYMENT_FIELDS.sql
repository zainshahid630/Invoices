-- Add subscription and payment gateway fields to payments table
-- This allows tracking subscription payments and JazzCash transaction details

-- Step 1: Add subscription_id column
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Step 2: Add payment gateway fields
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS gateway_response_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS gateway_response_message TEXT,
ADD COLUMN IF NOT EXISTS gateway_raw_response JSONB;

-- Step 3: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference_number ON payments(reference_number);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Step 4: Add comment
COMMENT ON COLUMN payments.subscription_id IS 'Links payment to a subscription if applicable';
COMMENT ON COLUMN payments.payment_status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN payments.gateway_transaction_id IS 'Transaction ID from payment gateway (e.g., JazzCash)';
COMMENT ON COLUMN payments.gateway_response_code IS 'Response code from payment gateway';
COMMENT ON COLUMN payments.gateway_response_message IS 'Response message from payment gateway';
COMMENT ON COLUMN payments.gateway_raw_response IS 'Full raw response from payment gateway in JSON format';
