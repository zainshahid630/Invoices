# 🚀 Quick Fix Guide - 5 Minutes

## The Problem
- 25+ RLS security warnings in Supabase
- Tables have policies but RLS is disabled
- Some policies are incorrect ("ALL" instead of specific operations)

## The Solution (3 Steps)

### Step 1: Open Supabase SQL Editor
Go to your Supabase project → SQL Editor

### Step 2: Run the Fix Script
Copy and paste the entire contents of:
```
database/fix-policies-properly.sql
```

Click "Run" or press Cmd/Ctrl + Enter

### Step 3: Check the Output
At the end of the script, you'll see a verification table showing:
- All 15 tables with `rls_enabled = true`
- Policy counts for each table

## Expected Results

```
tablename                  | rls_enabled | policy_count
---------------------------+-------------+-------------
companies                  | t           | 1
company_template_access    | t           | 1
customers                  | t           | 4
email_logs                 | t           | 2
feature_toggles            | t           | 1
invoice_items              | t           | 4
invoice_templates          | t           | 1
invoices                   | t           | 4
payments                   | t           | 4
products                   | t           | 4
settings                   | t           | 3
stock_history              | t           | 2
subscriptions              | t           | 1
super_admins               | t           | 2
users                      | t           | 3
```

## Test Your App
After running the fix, test these key features:
- ✅ Login
- ✅ Create invoice
- ✅ View customers
- ✅ Add products
- ✅ Record payment

## If Something Breaks
Run this rollback (unlikely needed):
```sql
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggles DISABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_template_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;
```

## Why This is Safe
Your app uses the service role key which bypasses RLS. This fix only adds security compliance without affecting functionality.

## Done! 🎉
Run the Supabase linter again - you should see 0 RLS warnings.

---

**Time Required:** 5 minutes
**Risk Level:** Very Low
**Rollback Available:** Yes
**Testing Required:** Basic smoke test
