-- Check if subscription exists for a specific company
-- Replace the company_id with your actual company ID

-- Check subscription for specific company
SELECT * FROM subscriptions 
WHERE company_id = 'e20e1628-1f33-4a41-981d-c46b4d48ab8f';

-- Check all subscriptions (to see if any exist)
SELECT 
  s.*,
  c.name as company_name,
  c.business_name
FROM subscriptions s
JOIN companies c ON s.company_id = c.id
ORDER BY s.created_at DESC
LIMIT 10;

-- Check if company exists
SELECT * FROM companies 
WHERE id = 'e20e1628-1f33-4a41-981d-c46b4d48ab8f';

-- Check all recent companies and their subscriptions
SELECT 
  c.id,
  c.name,
  c.business_name,
  c.created_at,
  s.plan_name,
  s.status,
  s.payment_status,
  s.end_date
FROM companies c
LEFT JOIN subscriptions s ON c.company_id = s.company_id
ORDER BY c.created_at DESC
LIMIT 10;
