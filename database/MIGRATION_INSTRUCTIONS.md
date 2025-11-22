# Database Migration Instructions

## Error You're Seeing

```
Error creating subscription: {
  code: 'PGRST204',
  message: "Could not find the 'plan_id' column of 'subscriptions' in the schema cache"
}
```

This means the database columns haven't been added yet.

## How to Fix (2 Minutes)

### Option 1: Run Combined Migration (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://dosecswlefagrerrgmsc.supabase.co
   - Login to your account

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste**
   - Open file: `database/RUN_SUBSCRIPTION_MIGRATIONS.sql`
   - Copy ALL the content
   - Paste into Supabase SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for "Success" message

5. **Verify**
   - Scroll down to see the verification queries results
   - You should see `plan_id` in subscriptions table
   - You should see new columns in payments table

### Option 2: Run Individual Migrations

If you prefer to run them separately:

**Step 1: Add plan_id to subscriptions**
```sql
-- Copy content from: database/ADD_PLAN_ID_TO_SUBSCRIPTIONS.sql
-- Paste and run in Supabase SQL Editor
```

**Step 2: Add payment gateway fields**
```sql
-- Copy content from: database/ADD_SUBSCRIPTION_PAYMENT_FIELDS.sql
-- Paste and run in Supabase SQL Editor
```

## What These Migrations Do

### Migration 1: Subscriptions Table
Adds:
- `plan_id` column (VARCHAR) - Stores which plan: basic_monthly, pro_monthly, etc.
- Index for faster lookups
- Default value for existing records

### Migration 2: Payments Table
Adds:
- `subscription_id` column (UUID) - Links payment to subscription
- `payment_status` column (VARCHAR) - pending, completed, failed, refunded
- `gateway_transaction_id` column (VARCHAR) - JazzCash transaction ID
- `gateway_response_code` column (VARCHAR) - Response code from JazzCash
- `gateway_response_message` column (TEXT) - Response message
- `gateway_raw_response` column (JSONB) - Full raw response for debugging
- Indexes for faster lookups

## After Running Migrations

1. **Refresh your app** (no restart needed)
2. **Try subscribing again**
3. **You should see the payment flow work**

## Verification

After running migrations, you can verify with these queries:

```sql
-- Check if plan_id exists in subscriptions
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' AND column_name = 'plan_id';

-- Check if new columns exist in payments
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name IN ('subscription_id', 'payment_status', 'gateway_transaction_id');
```

## Troubleshooting

### "Permission denied" error
- Make sure you're logged in as the database owner
- Or use the service role key

### "Column already exists" error
- This is fine! The migrations use `IF NOT EXISTS`
- It means the column was already added

### Still getting the error after migration
1. Check if migration actually ran (verify queries)
2. Try refreshing the Supabase schema cache
3. Restart your Next.js app: `npm run dev`

## Need Help?

If you're still having issues:
1. Check the Supabase logs
2. Verify you're connected to the correct database
3. Make sure you have the right permissions
