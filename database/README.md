# Database Schema Documentation

This directory contains all SQL files for the SaaS Invoice Management System database.

## Files Overview

### 1. `schema.sql`
**Main database schema** - Creates all tables and indexes.

**Tables Created:**
- `super_admins` - Super admin users
- `companies` - Seller/Company accounts
- `subscriptions` - Subscription management
- `users` - Seller users (linked to companies)
- `products` - Product/inventory master
- `stock_history` - Stock movement tracking
- `customers` - Customer master
- `invoices` - Invoice header
- `invoice_items` - Invoice line items
- `payments` - Payment records
- `settings` - Company-specific settings
- `feature_toggles` - Feature access per company

**Run Order:** 1st

### 2. `rls-policies.sql`
**Row Level Security policies** - Ensures multi-tenant data isolation.

**Features:**
- Company-based data isolation
- Role-based access control
- Prevents cross-company data access
- Secure multi-tenant architecture

**Run Order:** 2nd (after schema.sql)

### 3. `functions-triggers.sql`
**Database functions and triggers** - Automates business logic.

**Functions:**
- Auto-update timestamps (`updated_at`)
- Track stock changes automatically
- Auto-generate invoice numbers (INV-2025-00001)
- Update invoice status timestamps
- Reduce stock on invoice verification
- Calculate invoice totals automatically
- Helper functions for stats

**Run Order:** 3rd (after rls-policies.sql)

### 4. `seed-data.sql`
**Test/sample data** - Optional development data.

**Includes:**
- Test super admin
- 2 test companies
- Test users for each company
- Sample products (electronics & groceries)
- Sample customers
- Company settings
- Feature toggles

**Run Order:** 4th (optional, for testing only)

---

## Quick Setup

### Option 1: Run All at Once (Recommended)
Copy and paste this complete SQL in Supabase SQL Editor:

```sql
-- Run all database setup in order
\i schema.sql
\i rls-policies.sql
\i functions-triggers.sql
\i seed-data.sql  -- Optional
```

### Option 2: Run Files Individually
In Supabase SQL Editor, run each file in this order:

1. **schema.sql** - Creates tables
2. **rls-policies.sql** - Sets up security
3. **functions-triggers.sql** - Adds automation
4. **seed-data.sql** - Adds test data (optional)

---

## Database Schema Diagram

```
super_admins
    ↓
companies ←→ subscriptions
    ↓
    ├── users
    ├── products ←→ stock_history
    ├── customers
    ├── invoices ←→ invoice_items
    ├── payments
    ├── settings
    └── feature_toggles
```

---

## Key Features

### Multi-Tenant Isolation
- Each company's data is completely isolated
- Row Level Security (RLS) enforces access control
- Users can only see data from their own company

### Auto-Generated Invoice Numbers
- Format: `PREFIX-YYYY-NNNNN`
- Example: `INV-2025-00001`
- Automatically increments per company
- Customizable prefix per company

### Stock Tracking
- Automatic stock history on every change
- Tracks: quantity, previous/new stock, reason, date
- Links to invoices when stock reduced
- Complete audit trail

### Invoice Automation
- Auto-calculate subtotals and taxes
- Auto-update status timestamps
- Auto-reduce stock on verification
- Trigger-based, no manual intervention needed

---

## Important Notes

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Multi-tenant data isolation
- ✅ Role-based access control
- ⚠️ Change default passwords in seed-data.sql before production!

### Performance
- ✅ Indexes created on all foreign keys
- ✅ Indexes on frequently queried columns
- ✅ Optimized for multi-tenant queries

### Data Integrity
- ✅ Foreign key constraints
- ✅ Cascade deletes where appropriate
- ✅ NOT NULL constraints on required fields
- ✅ Unique constraints on email, invoice numbers

---

## Verification Queries

After running the SQL files, verify everything is set up correctly:

```sql
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

---

## Common Issues & Solutions

### Issue: "relation already exists"
**Solution:** Tables already created. Either:
- Drop existing tables first (⚠️ loses data!)
- Or skip schema.sql and run other files

### Issue: "permission denied"
**Solution:** Make sure you're using the service_role key or running in Supabase SQL Editor

### Issue: RLS blocking queries
**Solution:** 
- Ensure user is authenticated
- Check RLS policies match your auth setup
- For testing, you can temporarily disable RLS:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```

### Issue: Invoice numbers not generating
**Solution:** 
- Ensure functions-triggers.sql was run
- Check settings table has entry for company
- Verify trigger is active:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'generate_invoice_number_trigger';
  ```

---

## Maintenance Queries

### Reset Invoice Counter
```sql
UPDATE settings 
SET invoice_counter = 1 
WHERE company_id = 'your-company-id';
```

### View Stock History for Product
```sql
SELECT * FROM stock_history 
WHERE product_id = 'your-product-id' 
ORDER BY created_at DESC;
```

### Get Company Statistics
```sql
SELECT * FROM get_company_stats('your-company-id');
```

### Get Customer Statistics
```sql
SELECT * FROM get_customer_stats('your-customer-id');
```

---

## Backup & Restore

### Backup
```bash
# From Supabase Dashboard
# Database > Backups > Create Backup
```

### Restore
```bash
# From Supabase Dashboard
# Database > Backups > Restore from backup
```

---

## Next Steps

After setting up the database:

1. ✅ Verify all tables created
2. ✅ Test RLS policies
3. ✅ Review seed data
4. ✅ Update `.env.local` with Supabase credentials
5. ✅ Start building the application!

---

## Support

For issues:
- Check Supabase logs: Dashboard > Logs
- Review error messages carefully
- Ensure all files run in correct order
- Verify Supabase project is active

