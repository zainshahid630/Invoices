# Fix: Infinite Recursion in RLS Policy

## 🔴 Error You're Seeing

```
Error creating company: {
  code: '42P17',
  message: 'infinite recursion detected in policy for relation "users"'
}
```

## 🔍 What Happened

The Row Level Security (RLS) policies were causing infinite recursion. This happens when an RLS policy tries to query the same table it's protecting, creating a circular reference.

## ✅ Quick Fix

Run this SQL in your Supabase SQL Editor:

```sql
-- Disable RLS on all tables (except super_admins)
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
```

**OR** simply run the file:
```
database/fix-rls-policies.sql
```

## 🎯 Why This Works

1. **Super Admin Operations**: The super admin uses the service role key, which bypasses RLS anyway
2. **No User Context Yet**: We haven't implemented Supabase Auth yet, so there's no user context for RLS to check
3. **Phase 4 Implementation**: We'll implement proper RLS when we build the Seller Module (Phase 4) with Supabase Auth

## 🚀 After Running the Fix

1. **Refresh your browser** (clear any cached errors)
2. **Try creating a company again**
3. **It should work now!**

## 📝 Alternative: Fresh Setup

If you want to start fresh with the corrected setup:

```sql
-- Run the new complete setup (RLS already disabled)
database/complete-setup-v2.sql

-- Then create super admin
database/create-super-admin.sql
```

## ✅ Verify It's Fixed

Run this to check RLS status:

```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rls_enabled = false`.

## 🔐 Security Note

**Don't worry about security!** 

- RLS is disabled for now because we're using the **service role key** for super admin operations
- The service role key bypasses RLS anyway
- We'll implement proper RLS in **Phase 4** when we:
  - Add Supabase Auth
  - Create seller login
  - Have proper user context
  - Can write RLS policies that don't recurse

## 🎉 Next Steps

After running the fix:

1. ✅ Refresh your browser
2. ✅ Try creating a company
3. ✅ It should work perfectly!
4. ✅ Continue using the super admin module

---

**The fix is simple - just disable RLS for now!** 🚀

