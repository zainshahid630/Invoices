# Default HS Code Feature ✅

## What Was Added

A new **Default HS Code** setting that automatically fills the HS Code field when adding new line items to invoices, saving time and ensuring consistency.

---

## How It Works

### 1. Set Default HS Code in Settings
1. Go to **Settings** page
2. Find "Default HS Code" field under Invoice Settings
3. Enter your most commonly used HS Code (e.g., `7304.3900`)
4. Click **Save Invoice Settings**

### 2. Create Invoice with Auto-Fill
1. Go to **Create New Invoice**
2. When you add line items:
   - First item: HS Code auto-fills with your default
   - Click "+ Add Item": New items also get the default HS Code
3. You can still edit the HS Code for any item if needed

---

## Benefits

✅ **Save Time**: No need to type HS Code repeatedly
✅ **Consistency**: All items use the same HS Code by default
✅ **Flexibility**: Can still override for specific items
✅ **Optional**: Leave blank if you don't want auto-fill

---

## Files Changed

### 1. Settings Page
**File:** `app/seller/settings/page.tsx`

- Added "Default HS Code" input field
- Field appears after Invoice Counter
- Optional field with placeholder example
- Saves to settings table

### 2. Invoice Creation Page
**File:** `app/seller/invoices/new/page.tsx`

- Fetches default HS code from settings
- Auto-fills first item with default HS code
- New items added via "+ Add Item" also get default HS code
- Users can still edit/change HS code per item

### 3. Database Migration
**File:** `database/ADD_DEFAULT_HS_CODE_TO_SETTINGS.sql`

- Adds `default_hs_code` column to settings table
- VARCHAR(50) type
- Optional field (can be null)

---

## Database Setup Required

⚠️ **Important**: Run the SQL migration to add the column!

### Steps:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `database/ADD_DEFAULT_HS_CODE_TO_SETTINGS.sql`
4. Paste and execute
5. Verify with:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'settings' 
   AND column_name = 'default_hs_code';
   ```

---

## Usage Examples

### Example 1: Steel Pipes Company
**Settings:**
- Default HS Code: `7304.3900`

**When Creating Invoice:**
- Item 1: HS Code = `7304.3900` (auto-filled)
- Item 2: HS Code = `7304.3900` (auto-filled)
- Item 3: HS Code = `7304.3900` (auto-filled)

### Example 2: Mixed Products
**Settings:**
- Default HS Code: `7304.3900`

**When Creating Invoice:**
- Item 1: HS Code = `7304.3900` (auto-filled, keep it)
- Item 2: HS Code = `8481.8000` (auto-filled, but manually change it)
- Item 3: HS Code = `7304.3900` (auto-filled, keep it)

### Example 3: No Default
**Settings:**
- Default HS Code: (leave blank)

**When Creating Invoice:**
- Item 1: HS Code = `` (empty, enter manually)
- Item 2: HS Code = `` (empty, enter manually)

---

## Testing

### Test 1: Set Default HS Code
1. Go to Settings
2. Enter Default HS Code: `7304.3900`
3. Click Save
4. Verify success message

### Test 2: Create Invoice
1. Go to Create New Invoice
2. Check first item's HS Code field
3. Should show: `7304.3900`

### Test 3: Add More Items
1. Click "+ Add Item"
2. Check new item's HS Code field
3. Should show: `7304.3900`

### Test 4: Edit HS Code
1. Change HS Code in any item
2. Should be editable
3. Other items keep default value

### Test 5: No Default Set
1. Go to Settings
2. Leave Default HS Code blank
3. Save
4. Create invoice
5. HS Code fields should be empty

---

## Important Notes

### Existing Invoices
- Not affected by this change
- Only new invoices use the default HS code

### Product HS Codes
- If you select a product from dropdown, it uses the product's HS code
- Default HS code only applies to manual item entry

### Editing Invoices
- When editing existing invoices, items keep their original HS codes
- Adding new items to existing invoice will use default HS code

### Per-Item Override
- You can always change the HS code for any specific item
- Default is just a starting point to save time

---

## Common HS Codes (Examples)

| Product Type | HS Code | Description |
|--------------|---------|-------------|
| Steel Pipes | 7304.3900 | Tubes, pipes and hollow profiles |
| Valves | 8481.8000 | Taps, cocks, valves |
| Fittings | 7307.9900 | Tube or pipe fittings |
| Flanges | 7307.9100 | Flanges |
| Gaskets | 8484.1000 | Gaskets and similar joints |

---

**Feature is ready to use after running the database migration!** 🎉
