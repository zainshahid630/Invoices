-- Add plan_id column to subscriptions table
-- This stores which subscription plan the company is on

-- Step 1: Add plan_id column
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50);

-- Step 2: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);

-- Step 3: Update existing records with default plan
UPDATE subscriptions 
SET plan_id = 'basic_monthly' 
WHERE plan_id IS NULL;

-- Step 4: Add comment
COMMENT ON COLUMN subscriptions.plan_id IS 'Subscription plan identifier (e.g., basic_monthly, pro_monthly, enterprise_monthly)';
