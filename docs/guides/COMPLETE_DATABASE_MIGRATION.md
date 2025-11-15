# 🗄️ Complete Database Migration Guide

## ✅ Required Migrations

Run these queries in your **Supabase SQL Editor** to update your database:

---

## 🚀 **Quick Migration (Copy & Run All)**

Open **Supabase SQL Editor** and run this complete migration:

```sql
-- ============================================
-- COMPLETE DATABASE MIGRATION
-- Adds: po_number and payment_status columns
-- ============================================

-- 1. Add PO Number column
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);

COMMENT ON COLUMN invoices.po_number IS 'Purchase Order number reference';

-- 2. Add Payment Status column
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

COMMENT ON COLUMN invoices.payment_status IS 'Payment status: pending, partial, paid, overdue, cancelled';

-- 3. Add check constraint for payment status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_payment_status_check'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_payment_status_check 
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled'));
  END IF;
END $$;

-- 4. Update existing invoices to have pending payment status
UPDATE invoices 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;
```

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Open Supabase SQL Editor**

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Run the Migration**

1. Copy the complete migration query above
2. Paste it into the SQL Editor
3. Click **Run** (or press `Ctrl+Enter`)
4. Wait for "Success" message

### **Step 3: Verify the Migration**

Run this verification query:

```sql
-- Verify both columns were added
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'invoices' 
  AND column_name IN ('po_number', 'payment_status')
ORDER BY column_name;
```

**Expected Result:**

```
column_name    | data_type        | character_maximum_length | column_default      | is_nullable
---------------|------------------|--------------------------|---------------------|------------
payment_status | character varying| 50                       | 'pending'::varchar  | YES
po_number      | character varying| 100                      | NULL                | YES
```

---

## 🔍 **Individual Migrations** (Optional)

If you prefer to run migrations one at a time:

### **Migration 1: Add PO Number**

```sql
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS po_number VARCHAR(100);

COMMENT ON COLUMN invoices.po_number IS 'Purchase Order number reference';
```

### **Migration 2: Add Payment Status**

```sql
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

COMMENT ON COLUMN invoices.payment_status IS 'Payment status: pending, partial, paid, overdue, cancelled';

-- Add constraint
ALTER TABLE invoices 
ADD CONSTRAINT invoices_payment_status_check 
CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled'));
```

---

## ✅ **Verification Checklist**

After running the migration, verify everything works:

### **1. Check Columns Exist**

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'invoices' 
  AND column_name IN ('po_number', 'payment_status');
```

Should return:
```
column_name
--------------
po_number
payment_status
```

### **2. Check Constraints**

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'invoices' 
  AND constraint_name = 'invoices_payment_status_check';
```

Should return:
```
constraint_name              | constraint_type
-----------------------------|----------------
invoices_payment_status_check| CHECK
```

### **3. Test Insert**

```sql
-- Test creating an invoice with new fields
INSERT INTO invoices (
  company_id,
  invoice_number,
  po_number,
  invoice_date,
  invoice_type,
  subtotal,
  total_amount,
  status,
  payment_status
) VALUES (
  'your-company-id-here',
  'TEST-2025-00001',
  'PO-TEST-001',
  CURRENT_DATE,
  'Sales Tax Invoice',
  1000.00,
  1180.00,
  'draft',
  'pending'
);

-- Verify
SELECT invoice_number, po_number, payment_status 
FROM invoices 
WHERE invoice_number = 'TEST-2025-00001';

-- Clean up
DELETE FROM invoices WHERE invoice_number = 'TEST-2025-00001';
```

### **4. Test in Application**

1. Restart your Next.js app (if running)
2. Go to **Invoices → Create Invoice**
3. Fill in invoice details including PO Number
4. Click **Create Invoice**
5. Verify invoice is created successfully
6. Check invoice detail page shows PO Number

---

## 🔄 **Rollback** (If Needed)

If you need to undo the migration:

```sql
-- Remove payment_status constraint
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_status_check;

-- Remove columns
ALTER TABLE invoices DROP COLUMN IF EXISTS po_number;
ALTER TABLE invoices DROP COLUMN IF EXISTS payment_status;
```

**⚠️ Warning:** This will permanently delete all PO numbers and payment status data!

---

## 📊 **Payment Status Values**

The `payment_status` column accepts these values:

| Status      | Description                                    |
|-------------|------------------------------------------------|
| `pending`   | Payment not yet received (default)             |
| `partial`   | Partial payment received                       |
| `paid`      | Fully paid                                     |
| `overdue`   | Payment overdue                                |
| `cancelled` | Invoice cancelled, no payment expected         |

---

## 🎯 **What Changed**

### **Database Schema**

**Before:**
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  ...
);
```

**After:**
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  po_number VARCHAR(100),                    -- ✨ NEW
  invoice_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  payment_status VARCHAR(50) DEFAULT 'pending', -- ✨ NEW
  ...
  CONSTRAINT invoices_payment_status_check 
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled'))
);
```

### **API Changes**

**Invoice Creation** (`POST /api/seller/invoices`):
- Now accepts `po_number` field
- Automatically sets `payment_status` to 'pending'

**Invoice Response**:
- Includes `po_number` in response
- Includes `payment_status` in response

---

## 🚨 **Common Errors & Solutions**

### **Error 1: Column already exists**

```
ERROR: column "po_number" of relation "invoices" already exists
```

**Solution:** Column is already added! No action needed. The query uses `IF NOT EXISTS` to prevent this.

---

### **Error 2: Constraint already exists**

```
ERROR: constraint "invoices_payment_status_check" for relation "invoices" already exists
```

**Solution:** Constraint is already added! Use the complete migration query which checks for existence first.

---

### **Error 3: Permission denied**

```
ERROR: permission denied for table invoices
```

**Solution:** 
- Make sure you're running in Supabase SQL Editor (has admin access)
- Or use your service role key (not anon key)

---

## 📁 **Migration Files**

All migration files are saved in `database/migrations/`:

1. ✅ `add_po_number_to_invoices.sql` - Adds PO number column
2. ✅ `add_payment_status_to_invoices.sql` - Adds payment status column

---

## 🎉 **Summary**

After running this migration, your invoices table will have:

✅ **po_number** - Store customer purchase order numbers  
✅ **payment_status** - Track payment status separately from invoice status  
✅ **Constraints** - Ensure valid payment status values  
✅ **Defaults** - New invoices automatically get 'pending' payment status  

---

## 🚀 **Next Steps**

1. ✅ Run the migration query
2. ✅ Verify with the verification queries
3. ✅ Test creating an invoice in your app
4. ✅ Confirm PO number and payment status work correctly

**Your database is now fully updated!** 🎊

