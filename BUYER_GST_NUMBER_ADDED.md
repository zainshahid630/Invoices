# Buyer GST Number Feature Added ✅

## What Was Added

A new **Buyer GST Number** field has been added to invoices, allowing you to capture and store the buyer's GST number for both customer selection and manual entry.

---

## Changes Made

### 1. Database Migration
**File:** `database/ADD_BUYER_GST_TO_INVOICES.sql`

- Added `buyer_gst_number` column to the `invoices` table
- Created index for faster searching
- Optional field (can be null)

**To apply this migration:**
```sql
-- Run this in your Supabase SQL Editor
-- Copy and paste the contents of: database/ADD_BUYER_GST_TO_INVOICES.sql
```

### 2. Invoice Creation Form
**File:** `app/seller/invoices/new/page.tsx`

- Added GST Number field in buyer details section
- Field appears between NTN/CNIC and Registration Type
- Works for both "Select Customer" and "Manual Entry" modes
- When selecting a customer, their GST number auto-populates
- Optional field

### 3. Invoice Edit Form
**File:** `app/seller/invoices/[id]/edit/page.tsx`

- Added GST Number field in buyer details section
- Field appears between NTN/CNIC and Registration Type
- Works for both "Select Customer" and "Manual Entry" modes
- When selecting a customer, their GST number auto-populates
- Optional field

### 4. API Updates
**Files Updated:**
- `app/api/seller/invoices/route.ts` (POST method)
- `app/api/seller/invoices/[id]/route.ts` (GET, PUT methods)

All endpoints now handle the `buyer_gst_number` field:
- **POST**: Saves buyer_gst_number to invoice
- **GET**: Returns buyer_gst_number from invoice and customer.gst_number from linked customer
- **PUT**: Updates buyer_gst_number when editing invoice

### 5. Customer Data in GET API
**File:** `app/api/seller/invoices/[id]/route.ts`

The GET endpoint now includes additional customer fields:
- `gst_number`
- `registration_type`

This ensures that when a customer is linked to an invoice, their complete information is available.

---

## Database Fields

### Customers Table
- `customers.gst_number` - Already exists

### Invoices Table
- `invoices.buyer_gst_number` - NEW field (needs migration)

---

## How to Use

### Creating a New Invoice

1. Go to **Invoices** → **Create New Invoice**
2. In Buyer Details section:
   - **Select Customer**: GST number auto-fills from customer record
   - **Manual Entry**: Enter GST number manually (optional)
3. GST number is saved with the invoice

### Editing an Invoice

1. Go to **Invoices** → Click **Edit** on a draft invoice
2. In Buyer Details section:
   - GST number field is editable
   - Can be updated for both customer-linked and manual invoices
3. Click **Save Changes**

---

## Field Details

- **Field Name**: GST Number
- **Location**: Buyer Details section (between NTN/CNIC and Registration Type)
- **Required**: No (optional)
- **Behavior**: 
  - Disabled when customer is selected (auto-populated)
  - Editable in manual entry mode
- **Database**: Stored in `invoices.buyer_gst_number`

---

## Benefits

✅ **Complete Buyer Information**: Capture all buyer tax identifiers (NTN, GST)
✅ **Customer Integration**: Auto-populate from customer records
✅ **Manual Flexibility**: Enter GST for one-time buyers
✅ **FBR Ready**: GST number available for FBR reporting if needed
✅ **Searchable**: Indexed for fast searching

---

## Database Setup Required

⚠️ **Important**: You must run the SQL migration before using this feature!

### Steps:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `database/ADD_BUYER_GST_TO_INVOICES.sql`
4. Paste and execute
5. Verify with:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'invoices' 
   AND column_name = 'buyer_gst_number';
   ```

---

## Complete Data Flow

1. **Customer Record** → `customers.gst_number`
2. **Invoice Creation** → Copy to `invoices.buyer_gst_number`
3. **Invoice GET API** → Returns both invoice and customer GST numbers
4. **Invoice Edit** → Update `invoices.buyer_gst_number`

---

**Feature is ready to use after running the database migration!** 🎉
