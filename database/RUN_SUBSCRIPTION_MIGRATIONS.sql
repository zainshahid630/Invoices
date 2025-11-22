-- ============================================
-- SUBSCRIPTION FEATURE MIGRATIONS
-- Run this script in Supabase SQL Editor
-- ============================================

-- MIGRATION 1: Add plan_id to subscriptions table
-- ============================================
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);

UPDATE subscriptions 
SET plan_id = 'basic_monthly' 
WHERE plan_id IS NULL;

COMMENT ON COLUMN subscriptions.plan_id IS 'Subscription plan identifier (e.g., basic_monthly, pro_monthly, enterprise_monthly)';

-- MIGRATION 2: Add payment gateway fields to payments table
-- ============================================
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS gateway_response_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS gateway_response_message TEXT,
ADD COLUMN IF NOT EXISTS gateway_raw_response JSONB;

CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference_number ON payments(reference_number);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

COMMENT ON COLUMN payments.subscription_id IS 'Links payment to a subscription if applicable';
COMMENT ON COLUMN payments.payment_status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN payments.gateway_transaction_id IS 'Transaction ID from payment gateway (e.g., JazzCash)';
COMMENT ON COLUMN payments.gateway_response_code IS 'Response code from payment gateway';
COMMENT ON COLUMN payments.gateway_response_message IS 'Response message from payment gateway';
COMMENT ON COLUMN payments.gateway_raw_response IS 'Full raw response from payment gateway in JSON format';

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify the migrations worked
-- ============================================

-- Check subscriptions table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Check payments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('subscriptions', 'payments')
ORDER BY tablename, indexname;
