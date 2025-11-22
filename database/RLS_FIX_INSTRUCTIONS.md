# RLS Security Fix - Complete Instructions

## Overview
This document provides step-by-step instructions to fix all Row Level Security (RLS) issues detected by Supabase linter.

## Issues Detected
The following tables have RLS policies defined but RLS is not enabled:
- ✅ companies
- ✅ customers
- ✅ feature_toggles
- ✅ invoice_items
- ✅ invoices
- ✅ payments
- ✅ products
- ✅ settings
- ✅ stock_history
- ✅ subscriptions
- ✅ users

The following tables are missing RLS entirely:
- ✅ super_admins
- ✅ company_template_access
- ✅ invoice_templates
- ✅ email_logs

## Solution

### Step 1: Run the Fix Script
Execute the following SQL script in your Supabase SQL Editor:

```bash
database/enable-rls-complete-fix.sql
```

This script will:
1. Enable RLS on all 15 tables
2. Add missing RLS policies for new tables
3. Verify the changes

### Step 2: Verify the Fix
After running the script, check the verification query output. You should see:
- `rls_enabled` = `true` for all tables
- `policy_count` > 0 for all tables with policies

### Step 3: Test Your Application
**IMPORTANT**: After enabling RLS, test all functionality to ensure nothing breaks:

#### Test Checklist:
- [ ] Super Admin Login
- [ ] Company Management (Create, Read, Update)
- [ ] User Management (Create, Read, Update)
- [ ] Product Management (CRUD operations)
- [ ] Customer Management (CRUD operations)
- [ ] Invoice Creation and Management
- [ ] Payment Recording
- [ ] Settings Management
- [ ] Template Selection
- [ ] Email Sending

### Step 4: Monitor for Issues
Watch for these potential issues:
- Users unable to access their own data
- Permission denied errors
- Infinite recursion errors in policies

## How RLS Works in This System

### Service Role vs Authenticated Users
- **Service Role Key**: Bypasses RLS completely (used for super admin operations)
- **Authenticated Users**: Subject to RLS policies (used for company users)

### Current Implementation
Your application uses the service role key for most operations, which means:
- RLS is enabled for security compliance
- But operations using service role key bypass RLS
- This is acceptable for super admin operations
- When you build the seller portal with Supabase Auth, RLS will provide proper isolation

## Rollback Plan
If something breaks after enabling RLS, you can temporarily disable it:

```sql
-- Disable RLS on specific table
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Or run the old fix-rls-policies.sql to disable all
```

## Notes
- RLS policies are already defined in `database/rls-policies.sql`
- The issue was that RLS was disabled in `database/fix-rls-policies.sql`
- This fix re-enables RLS without changing the policies
- Your application should continue to work because it uses service role key

## Security Best Practices
1. ✅ Enable RLS on all public tables
2. ✅ Define policies for each table
3. ✅ Use service role key only for admin operations
4. ✅ Use authenticated user context for seller operations
5. ✅ Regularly audit RLS policies

## Next Steps
After fixing RLS:
1. Run the Supabase linter again to verify all issues are resolved
2. Document any application-level changes needed
3. Plan for proper Supabase Auth integration in seller portal
