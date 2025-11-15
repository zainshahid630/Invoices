# Invoice Number Not Picking Up Settings - Troubleshooting

## Issue
The invoice creation form shows an empty or incorrect invoice number instead of using the prefix and counter from Settings.

---

## Quick Fixes

### 1. Check Browser Console
Open the invoice creation page and check the browser console (F12) for these logs:
```
Settings data: { company: {...}, settings: {...} }
Prefix: INV Counter: 1
Generated invoice number: INV-1
```

If you don't see these logs, the settings API call is failing.

### 2. Verify Settings Exist
Go to **Settings** page and check:
- Invoice Prefix field has a value (e.g., `INV`)
- Invoice Counter field has a value (e.g., `1`)
- Click **Save Settings** to ensure they're saved

### 3. Check Settings API
Open browser console and run:
```javascript
fetch('/api/seller/settings?company_id=YOUR_COMPANY_ID')
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected response:
```json
{
  "company": { ... },
  "settings": {
    "invoice_prefix": "INV",
    "invoice_counter": 1,
    ...
  }
}
```

### 4. Refresh the Page
After saving settings:
1. Go back to invoice creation page
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if invoice number appears

---

## Common Issues

### Issue 1: Settings Not Saved
**Symptom:** Invoice number is empty or shows default
**Solution:**
1. Go to Settings page
2. Enter Invoice Prefix (e.g., `INV`)
3. Enter Invoice Counter (e.g., `1`)
4. Click **Save Settings**
5. Wait for success message
6. Refresh invoice creation page

### Issue 2: Settings Table Doesn't Exist
**Symptom:** API returns error about settings table
**Solution:**
Run the database setup SQL to create the settings table.

### Issue 3: No Settings Record for Company
**Symptom:** API returns null settings
**Solution:**
The API should auto-create default settings. If not, manually insert:
```sql
INSERT INTO settings (company_id, invoice_prefix, invoice_counter)
VALUES ('your-company-id', 'INV', 1);
```

### Issue 4: Cache Issue
**Symptom:** Old invoice number format still showing
**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Or open in incognito/private window

---

## Debug Steps

### Step 1: Check Settings in Database
```sql
SELECT * FROM settings WHERE company_id = 'your-company-id';
```

Should return:
```
invoice_prefix | invoice_counter
INV           | 1
```

### Step 2: Check API Response
In browser console:
```javascript
// Replace with your actual company_id
const companyId = 'your-company-id';
fetch(`/api/seller/settings?company_id=${companyId}`)
  .then(r => r.json())
  .then(data => {
    console.log('Settings:', data.settings);
    console.log('Prefix:', data.settings?.invoice_prefix);
    console.log('Counter:', data.settings?.invoice_counter);
  });
```

### Step 3: Check Frontend State
Add this temporarily to invoice creation page:
```javascript
console.log('Form data:', formData);
console.log('Invoice number:', formData.invoice_number);
```

### Step 4: Test Settings Update
1. Go to Settings
2. Change counter to `100`
3. Save
4. Go to invoice creation
5. Check if number shows `PREFIX-100`

---

## Expected Behavior

### Settings Page
- Shows: "Your invoices will be numbered as: **INV-1**"
- Shows: "Next invoice: **INV-1**, then **INV-2**, etc."

### Invoice Creation Page
- Invoice Number field shows: `INV-1` (or your prefix-counter)
- Field is editable
- Placeholder says: "Auto-generated (editable)"

### After Creating Invoice
- Invoice is saved with number `INV-1`
- Counter in settings increments to `2`
- Next invoice will be `INV-2`

---

## Still Not Working?

### Check These:

1. **Company ID**: Ensure you're logged in and company_id is set
2. **API Endpoint**: Check `/api/seller/settings` is accessible
3. **Database**: Verify settings table exists and has data
4. **Browser**: Try different browser or incognito mode
5. **Network**: Check browser Network tab for failed requests

### Manual Fix:

If auto-generation fails, you can:
1. Manually type the invoice number in the form
2. System will still check for duplicates
3. Counter won't auto-increment (you'll need to update settings manually)

---

## Contact Support

If issue persists, provide:
1. Browser console logs
2. Network tab screenshot showing settings API call
3. Settings page screenshot
4. Database query result: `SELECT * FROM settings WHERE company_id = 'your-id'`
