# Database Reference - Quick Lookup

## 📋 All SQL Files Saved for Reference

All database SQL files are saved in the `database/` directory. Use these files to check and fix any DB-level issues that may arise during development.

---

## 📂 File Structure

```
database/
├── complete-setup.sql          # 👈 MAIN FILE - Run this first!
├── schema.sql                  # Tables only
├── rls-policies.sql           # Security policies only
├── functions-triggers.sql     # Functions & triggers only
├── seed-data.sql              # Test data (optional)
└── README.md                  # Database documentation
```

---

## 🚀 Quick Setup

### Option 1: One-File Setup (Recommended)
Run `database/complete-setup.sql` in Supabase SQL Editor.

**Includes:**
- ✅ All 12 tables
- ✅ All indexes
- ✅ Row Level Security
- ✅ RLS policies
- ✅ All functions
- ✅ All triggers

### Option 2: Individual Files
Run in this order:
1. `schema.sql`
2. `rls-policies.sql`
3. `functions-triggers.sql`
4. `seed-data.sql` (optional)

---

## 📊 Database Tables (12 Total)

### Core Tables
1. **super_admins** - Super admin users
2. **companies** - Seller/Company accounts
3. **subscriptions** - Subscription management
4. **users** - Seller users (linked to companies)

### Business Tables
5. **products** - Product/inventory master
6. **stock_history** - Stock movement tracking
7. **customers** - Customer master
8. **invoices** - Invoice header
9. **invoice_items** - Invoice line items
10. **payments** - Payment records

### Configuration Tables
11. **settings** - Company-specific settings
12. **feature_toggles** - Feature access per company

---

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Enabled on all tables
- ✅ Multi-tenant data isolation
- ✅ Company-based access control
- ✅ Users can only see their company's data

### Policies
- Companies: View own company only
- Users: View users from own company
- Products: Full CRUD for own company
- Customers: Full CRUD for own company
- Invoices: Full CRUD for own company
- Payments: Full CRUD for own company

---

## ⚙️ Automated Features

### 1. Auto-Generated Invoice Numbers
**Format:** `PREFIX-YYYY-NNNNN`
**Example:** `INV-2025-00001`

**How it works:**
- Trigger: `generate_invoice_number_trigger`
- Function: `generate_invoice_number()`
- Runs: Before INSERT on invoices
- Customizable prefix per company

### 2. Stock Tracking
**Automatic stock history on every change**

**Tracks:**
- Previous stock level
- New stock level
- Quantity changed
- Change type (in/out/adjustment)
- Reason
- Date & time
- Who made the change

**How it works:**
- Trigger: `track_product_stock_changes`
- Function: `track_stock_change()`
- Runs: After UPDATE on products

### 3. Auto-Update Timestamps
**Automatically updates `updated_at` field**

**Applied to:**
- super_admins
- companies
- subscriptions
- users
- products
- customers
- invoices
- settings
- feature_toggles

**How it works:**
- Trigger: `update_[table]_updated_at`
- Function: `update_updated_at_column()`
- Runs: Before UPDATE on each table

---

## 🔍 Common Queries

### Check if tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check RLS status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Check triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### Check functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

### View stock history for a product
```sql
SELECT * FROM stock_history 
WHERE product_id = 'your-product-id' 
ORDER BY created_at DESC;
```

### Get company statistics
```sql
SELECT 
  (SELECT COUNT(*) FROM customers WHERE company_id = 'your-company-id'),
  (SELECT COUNT(*) FROM products WHERE company_id = 'your-company-id'),
  (SELECT COUNT(*) FROM invoices WHERE company_id = 'your-company-id');
```

---

## 🛠️ Troubleshooting

### Issue: Tables already exist
**Cause:** SQL already run
**Solution:** Skip schema.sql or drop tables first

### Issue: RLS blocking queries
**Cause:** User not authenticated or wrong company
**Solution:** 
- Ensure user is authenticated
- Check user's company_id matches data
- For testing, temporarily disable RLS:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```

### Issue: Invoice numbers not generating
**Cause:** Trigger not created or settings missing
**Solution:**
1. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger 
   WHERE tgname = 'generate_invoice_number_trigger';
   ```
2. Check settings table:
   ```sql
   SELECT * FROM settings WHERE company_id = 'your-company-id';
   ```

### Issue: Stock history not recording
**Cause:** Trigger not created
**Solution:**
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'track_product_stock_changes';
```

---

## 📝 Maintenance

### Reset invoice counter
```sql
UPDATE settings 
SET invoice_counter = 1 
WHERE company_id = 'your-company-id';
```

### Manually add stock history
```sql
INSERT INTO stock_history (
  product_id, company_id, change_type, 
  quantity, previous_stock, new_stock, reason
) VALUES (
  'product-id', 'company-id', 'in',
  100, 50, 150, 'Manual adjustment'
);
```

### Update product stock
```sql
UPDATE products 
SET current_stock = 100 
WHERE id = 'product-id';
-- Stock history will be created automatically!
```

---

## 🔗 Related Files

- **Complete Setup**: `database/complete-setup.sql`
- **Individual Files**: `database/schema.sql`, `rls-policies.sql`, `functions-triggers.sql`
- **Test Data**: `database/seed-data.sql`
- **Full Documentation**: `database/README.md`
- **Setup Guide**: `SETUP_GUIDE.md`
- **Quick Start**: `QUICK_START.md`

---

## ✅ Verification Checklist

After running the SQL:

- [ ] 12 tables created
- [ ] All indexes created
- [ ] RLS enabled on all tables
- [ ] RLS policies created
- [ ] Triggers created (9 total)
- [ ] Functions created (3 total)
- [ ] Test data loaded (if using seed-data.sql)

Run verification queries above to confirm!

---

## 💡 Tips

1. **Always use complete-setup.sql** for fresh setup
2. **Keep these files** for reference during development
3. **Check triggers** if automation isn't working
4. **Review RLS policies** if access is denied
5. **Use seed-data.sql** for testing only

---

## 🎯 Key Points to Remember

1. **Multi-Tenant**: All data is isolated by company_id
2. **Auto-Invoice Numbers**: Generated automatically on insert
3. **Stock Tracking**: Automatic history on every stock change
4. **RLS Enabled**: Security enforced at database level
5. **Timestamps**: Auto-updated on every change

---

**This reference is saved for checking and fixing any DB-level issues during development!**

