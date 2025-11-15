# Customer Registration Type Feature Added ✅

## What Was Added

A new **Registration Type** field has been added to the customer creation form, allowing you to specify whether a buyer is **Registered** or **Unregistered** with FBR.

---

## Changes Made

### 1. Database Migration
**File:** `database/ADD_REGISTRATION_TYPE_TO_CUSTOMERS.sql`

- Added `registration_type` column to the `customers` table
- Default value: `'Unregistered'`
- Created index for faster filtering
- All existing customers will be set to 'Unregistered' by default

**To apply this migration:**
```sql
-- Run this in your Supabase SQL Editor
-- Copy and paste the contents of: database/ADD_REGISTRATION_TYPE_TO_CUSTOMERS.sql
```

### 2. Customer Creation Form
**File:** `app/seller/customers/new/page.tsx`

- Added Registration Type dropdown field (Required)
- Options: Registered / Unregistered
- Default selection: Unregistered
- Field appears before the Province field

### 3. Customer Edit Form
**File:** `app/seller/customers/[id]/edit/page.tsx`

- Added Registration Type dropdown field (Required)
- Options: Registered / Unregistered
- Default selection: Unregistered (if not set)
- Field appears before the Province field

### 4. API Updates
**Files Updated:**
- `app/api/seller/customers/route.ts` (POST method)
- `app/api/seller/customers/[id]/route.ts` (PATCH method)

Both endpoints now accept and save the `registration_type` field.

### 5. TypeScript Interfaces
**Files Updated:**
- `app/seller/customers/page.tsx` - Customer interface
- `app/seller/customers/[id]/edit/page.tsx` - Customer interface

Both interfaces now include `registration_type: string`

---

## How to Use

### Creating a New Customer

1. Go to **Customers** page
2. Click **+ Add Customer**
3. Fill in customer details
4. Select **Registration Type**:
   - **Registered**: Customer is registered with FBR (has NTN)
   - **Unregistered**: Customer is not registered with FBR
5. Click **Create Customer**

### Editing an Existing Customer

1. Go to **Customers** page
2. Click **Edit** on any customer
3. Update customer details including **Registration Type**
4. Click **Save Changes**

### Field Details

- **Required Field**: Yes (marked with red asterisk *)
- **Default Value**: Unregistered
- **Options**: 
  - Registered
  - Unregistered
- **Help Text**: "Select whether the buyer is registered with FBR or not"

---

## Database Setup Required

⚠️ **Important**: You must run the SQL migration before using this feature!

### Steps:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `database/ADD_REGISTRATION_TYPE_TO_CUSTOMERS.sql`
4. Paste and execute
5. Verify with:
   ```sql
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'customers' 
   AND column_name = 'registration_type';
   ```

---

## Benefits

✅ **FBR Compliance**: Properly categorize customers for FBR reporting
✅ **Better Tracking**: Know which customers are registered vs unregistered
✅ **Invoice Accuracy**: Can be used to populate buyer registration type in invoices
✅ **Filtering**: Index added for fast filtering by registration type

---

## Next Steps (Optional)

If you want to display the registration type in the customers list:

1. Add a column to the table in `app/seller/customers/page.tsx`
2. Display the `customer.registration_type` value
3. Add filter buttons for Registered/Unregistered

---

## Testing

1. Run the SQL migration
2. Create a new customer with Registration Type = "Registered"
3. Create another customer with Registration Type = "Unregistered"
4. Verify both customers are saved correctly in the database
5. Check that existing customers have default value "Unregistered"

---

---

## Invoice Integration ✅

The registration_type field is now fully integrated with invoices:

### Invoice Creation (`app/seller/invoices/new/page.tsx`)
- When selecting a customer, their registration_type is automatically populated
- For manual buyer entry, you can select Registered/Unregistered
- The field is saved to the invoice as `buyer_registration_type`
- Default value: Unregistered

### Invoice Editing (`app/seller/invoices/[id]/edit/page.tsx`)
- Registration Type field added to buyer details section
- Works for both "Select Customer" and "Manual Entry" modes
- When selecting a customer, their registration_type auto-populates
- For manual entry, can be changed between Registered/Unregistered
- Field is required and updates `buyer_registration_type` in the invoice

### Invoice API (`app/api/seller/invoices/route.ts`)
- POST endpoint saves `buyer_registration_type` to invoices table
- When auto-creating customers from manual entry, registration_type is saved
- PUT endpoint updates `buyer_registration_type` when editing invoices

### Database Fields
- **customers.registration_type** - Stored in customers table
- **invoices.buyer_registration_type** - Stored in invoices table (already exists from FBR migration)

### FBR Integration
**Files Updated:**
- `app/api/seller/invoices/[id]/validate-fbr/route.ts` - Uses `buyer_registration_type` from invoice
- `app/api/seller/invoices/[id]/post-fbr/route.ts` - Uses `buyer_registration_type` from invoice

Both FBR endpoints now correctly send the buyer's registration type in the payload:
```json
{
  "buyerRegistrationType": "Registered" // or "Unregistered"
}
```

---

**Feature is ready to use after running the database migration!** 🎉
