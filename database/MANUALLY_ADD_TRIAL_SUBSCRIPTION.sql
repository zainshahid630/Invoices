-- Manually add 7-day trial subscription for a company
-- Replace the company_id with your actual company ID

-- Step 1: Check if subscription already exists
SELECT * FROM subscriptions 
WHERE company_id = 'e20e1628-1f33-4a41-981d-c46b4d48ab8f';

-- Step 2: If no subscription exists, insert one
-- Note: If you get error about plan_name column, run ADD_PLAN_NAME_TO_SUBSCRIPTIONS.sql first
INSERT INTO subscriptions (
  company_id,
  start_date,
  end_date,
  status,
  payment_status,
  amount
) VALUES (
  'e20e1628-1f33-4a41-981d-c46b4d48ab8f',  -- Replace with your company_id
  NOW(),
  NOW() + INTERVAL '7 days',
  'active',
  'trial',
  0
);

-- Step 3: Verify the subscription was created
SELECT * FROM subscriptions 
WHERE company_id = 'e20e1628-1f33-4a41-981d-c46b4d48ab8f';

-- Step 4: Add subscriptions for ALL companies that don't have one
-- (Run this to fix all companies missing subscriptions)
-- Note: If you get error about plan_name column, run ADD_PLAN_NAME_TO_SUBSCRIPTIONS.sql first
INSERT INTO subscriptions (
  company_id,
  start_date,
  end_date,
  status,
  payment_status,
  amount
)
SELECT 
  c.id as company_id,
  NOW() as start_date,
  NOW() + INTERVAL '7 days' as end_date,
  'active' as status,
  'trial' as payment_status,
  0 as amount
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
WHERE s.id IS NULL;  -- Only companies without subscriptions

-- Step 5: Verify all companies now have subscriptions
SELECT 
  c.id,
  c.name,
  c.business_name,
  s.plan_name,
  s.status,
  s.payment_status,
  s.end_date
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
ORDER BY c.created_at DESC;
