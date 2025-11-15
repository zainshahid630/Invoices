-- Add plan_name column to subscriptions table
-- This column stores the subscription plan type (Trial, Starter, Professional, etc.)

-- Step 1: Check current subscriptions table structure
-- Run this first to see what columns exist
-- \d subscriptions

-- Step 2: Add plan_name column if it doesn't exist
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50) DEFAULT 'Trial';

-- Step 3: Update existing subscriptions to have a plan_name
-- Set all existing subscriptions to 'Trial' if they don't have a plan_name
UPDATE subscriptions 
SET plan_name = 'Trial' 
WHERE plan_name IS NULL;

-- Step 4: Verify the column was added
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

-- Step 5: Check all subscriptions
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 10;
