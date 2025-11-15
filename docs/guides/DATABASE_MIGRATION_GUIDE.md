# 🗄️ Database Migration Guide - Add PO Number

## Quick Start

### **Easiest Method: Supabase SQL Editor** ⭐

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run This Query**
   ```sql
   -- Add PO Number field to invoices table
   ALTER TABLE invoices 
   ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);
   
   -- Add comment for documentation
   COMMENT ON COLUMN invoices.po_number IS 'Purchase Order number reference';
   ```

4. **Execute**
   - Click **Run** button (or press `Ctrl+Enter`)
   - You should see: "Success. No rows returned"

5. **Verify**
   ```sql
   -- Check if column was added
   SELECT column_name, data_type, character_maximum_length 
   FROM information_schema.columns 
   WHERE table_name = 'invoices' AND column_name = 'po_number';
   ```
   
   Expected result:
   ```
   column_name | data_type        | character_maximum_length
   ------------|------------------|-------------------------
   po_number   | character varying| 100
   ```

---

## Alternative Methods

### **Method 2: Using Migration File**

If you have the migration file saved locally:

```bash
# Navigate to your project directory
cd /Users/zain/Documents/augment-projects/Saas-Invoices

# Run the migration file
psql -h <your-supabase-host> -U postgres -d postgres -f database/migrations/add_po_number_to_invoices.sql
```

**Get your Supabase connection details:**
1. Go to Supabase Dashboard → Settings → Database
2. Copy the connection string
3. Replace `<your-supabase-host>` with your actual host

---

### **Method 3: Using Supabase Client (Programmatic)**

**Note:** This requires creating a custom SQL function first.

#### Step 1: Create SQL Execution Function (One-time setup)

Run this in Supabase SQL Editor:

```sql
-- Create a function to execute raw SQL (admin only)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
```

#### Step 2: Run the Migration Script

```bash
# Install dependencies if needed
npm install @supabase/supabase-js ts-node

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run migration
npx ts-node scripts/migrate-add-po-number.ts
```

---

## Verification Steps

### **1. Check Column Exists**

```sql
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'invoices' AND column_name = 'po_number';
```

Expected output:
```
column_name | data_type        | character_maximum_length | is_nullable
------------|------------------|--------------------------|------------
po_number   | character varying| 100                      | YES
```

### **2. Test Insert**

```sql
-- Test inserting a record with PO number
INSERT INTO invoices (
  company_id,
  invoice_number,
  po_number,
  invoice_date,
  invoice_type,
  subtotal,
  total_amount,
  status
) VALUES (
  'your-company-id-here',
  'TEST-2025-00001',
  'PO-12345',
  CURRENT_DATE,
  'Sales Tax Invoice',
  1000.00,
  1180.00,
  'draft'
);

-- Verify
SELECT invoice_number, po_number FROM invoices WHERE invoice_number = 'TEST-2025-00001';

-- Clean up test data
DELETE FROM invoices WHERE invoice_number = 'TEST-2025-00001';
```

### **3. Check Existing Invoices**

```sql
-- Check how many invoices exist
SELECT COUNT(*) as total_invoices FROM invoices;

-- Check invoices without PO numbers (should be all existing ones)
SELECT COUNT(*) as invoices_without_po 
FROM invoices 
WHERE po_number IS NULL;

-- These numbers should match (all existing invoices will have NULL po_number)
```

---

## Rollback (If Needed)

If you need to remove the column:

```sql
-- Remove the po_number column
ALTER TABLE invoices DROP COLUMN IF EXISTS po_number;
```

**⚠️ Warning:** This will permanently delete all PO number data!

---

## Common Issues & Solutions

### **Issue 1: Permission Denied**

**Error:**
```
ERROR: permission denied for table invoices
```

**Solution:**
- Make sure you're using the **service role key** (not anon key)
- Or run the query in Supabase SQL Editor (which has admin access)

---

### **Issue 2: Column Already Exists**

**Error:**
```
ERROR: column "po_number" of relation "invoices" already exists
```

**Solution:**
- The column is already added! No action needed.
- The query uses `IF NOT EXISTS` to prevent this error, but if you see it, you're good to go.

---

### **Issue 3: Table Not Found**

**Error:**
```
ERROR: relation "invoices" does not exist
```

**Solution:**
- Make sure you're connected to the correct database
- Check if the invoices table exists:
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_name = 'invoices';
  ```
- If it doesn't exist, you need to run the full schema first:
  ```bash
  psql -h <host> -U postgres -d postgres -f database/schema.sql
  ```

---

## Migration Checklist

- [ ] **Backup Database** (optional but recommended)
  ```sql
  -- Export invoices table
  COPY invoices TO '/tmp/invoices_backup.csv' CSV HEADER;
  ```

- [ ] **Run Migration Query**
  ```sql
  ALTER TABLE invoices ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);
  ```

- [ ] **Verify Column Added**
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'invoices' AND column_name = 'po_number';
  ```

- [ ] **Test Insert/Update**
  ```sql
  -- Test with a sample invoice
  UPDATE invoices SET po_number = 'TEST-PO-001' WHERE id = (SELECT id FROM invoices LIMIT 1);
  ```

- [ ] **Deploy Frontend Changes**
  - The frontend code is already updated
  - Just deploy/restart your Next.js app

- [ ] **Test in Application**
  - Create a new invoice with PO number
  - Verify it saves correctly
  - Check invoice detail page shows PO number

---

## Summary

**Recommended Approach:**

1. ✅ **Use Supabase SQL Editor** (Easiest)
2. ✅ **Copy the migration query**
3. ✅ **Run it**
4. ✅ **Verify with SELECT query**
5. ✅ **Test in your app**

**Migration Query (Copy This):**

```sql
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);

COMMENT ON COLUMN invoices.po_number IS 'Purchase Order number reference';
```

That's it! Your database is now ready to store PO numbers. 🎉

---

## Need Help?

If you encounter any issues:

1. Check the error message carefully
2. Verify you're using the correct database
3. Make sure you have admin/service role access
4. Try running in Supabase SQL Editor (has full access)

**The migration is safe:**
- Uses `IF NOT EXISTS` - won't fail if already run
- Adds nullable column - won't affect existing data
- No data loss - existing invoices remain unchanged

