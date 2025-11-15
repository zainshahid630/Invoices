# Debug Invoice Number Not Loading

## Step 1: Check Browser Console

Open the invoice creation page and press **F12** to open browser console.

Look for these logs:
```
Settings data: {...}
Prefix: INV.
Counter: 301
Generated invoice number: INV.301
```

**If you DON'T see these logs**, the function is not running or failing.

---

## Step 2: Run This in Browser Console

Copy and paste this into the browser console on the invoice creation page:

```javascript
// Get your company ID from localStorage
const session = JSON.parse(localStorage.getItem('seller_session'));
const companyId = session.company_id;
console.log('Company ID:', companyId);

// Test the settings API
fetch(`/api/seller/settings?company_id=${companyId}`)
  .then(response => {
    console.log('API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Full API Response:', data);
    console.log('Settings Object:', data.settings);
    console.log('Invoice Prefix:', data.settings?.invoice_prefix);
    console.log('Invoice Counter:', data.settings?.invoice_counter);
    
    // Generate the number
    const prefix = data.settings?.invoice_prefix || 'INV';
    const counter = data.settings?.invoice_counter || 1;
    const invoiceNumber = `${prefix}${counter}`;
    console.log('Generated Invoice Number:', invoiceNumber);
  })
  .catch(error => {
    console.error('API Error:', error);
  });
```

---

## Step 3: Check What You See

### Scenario A: API Returns Correct Data
If you see:
```
Invoice Prefix: INV.
Invoice Counter: 301
Generated Invoice Number: INV.301
```

**Problem:** Frontend not updating
**Solution:** 
1. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Try incognito/private window

### Scenario B: API Returns Wrong Data
If you see:
```
Invoice Prefix: INV
Invoice Counter: 1
```

**Problem:** Settings not saved in database
**Solution:**
1. Go to Settings page
2. Enter: Prefix = `INV.`, Counter = `301`
3. Click **Save Settings**
4. Wait for success message
5. Refresh invoice page

### Scenario C: API Returns Null/Undefined
If you see:
```
Settings Object: null
or
Settings Object: undefined
```

**Problem:** No settings record in database
**Solution:** Run this SQL:
```sql
-- Check if settings exist
SELECT * FROM settings WHERE company_id = 'your-company-id';

-- If no results, insert default settings
INSERT INTO settings (company_id, invoice_prefix, invoice_counter)
VALUES ('your-company-id', 'INV.', 301);
```

### Scenario D: API Error
If you see:
```
API Error: ...
or
API Response Status: 404 or 500
```

**Problem:** API endpoint issue
**Solution:** Check server logs

---

## Step 4: Force Update Invoice Number

If the auto-generation still doesn't work, you can manually set it:

```javascript
// Run this in console to manually set the invoice number
const invoiceNumberInput = document.querySelector('input[value*="INV"]');
if (invoiceNumberInput) {
  invoiceNumberInput.value = 'INV.301';
  // Trigger React's onChange
  const event = new Event('input', { bubbles: true });
  invoiceNumberInput.dispatchEvent(event);
}
```

---

## Step 5: Check Database Directly

Run this SQL query:

```sql
-- Get your company's settings
SELECT 
  id,
  company_id,
  invoice_prefix,
  invoice_counter,
  created_at,
  updated_at
FROM settings
WHERE company_id = 'your-company-id';
```

Expected result:
```
invoice_prefix | invoice_counter
INV.          | 301
```

---

## Step 6: Verify Settings Save

1. Go to Settings page
2. Change counter to `999`
3. Click Save
4. Run this in console:
```javascript
fetch('/api/seller/settings?company_id=' + JSON.parse(localStorage.getItem('seller_session')).company_id)
  .then(r => r.json())
  .then(d => console.log('Counter after save:', d.settings?.invoice_counter));
```
5. Should show: `Counter after save: 999`

---

## Common Issues & Fixes

### Issue 1: Old Code Cached
**Symptoms:** Console shows old logs or no logs
**Fix:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache
- Or use incognito window

### Issue 2: Settings Not Saved
**Symptoms:** API returns default values (INV, 1)
**Fix:**
- Go to Settings
- Re-enter your values
- Click Save
- Wait for success toast
- Check database to confirm

### Issue 3: Wrong Company ID
**Symptoms:** API returns 404 or wrong data
**Fix:**
```javascript
// Check your company ID
const session = JSON.parse(localStorage.getItem('seller_session'));
console.log('Your Company ID:', session.company_id);
```

### Issue 4: React State Not Updating
**Symptoms:** Console shows correct number but input field is empty
**Fix:**
- Check if `formData.invoice_number` is set
- Add this to console:
```javascript
// Check React state (if you have React DevTools)
// Or add temporary console.log in the component
```

---

## Still Not Working?

### Last Resort: Manual Entry
1. Type `INV.301` directly in the invoice number field
2. System will still validate and save it
3. But counter won't auto-increment

### Report Issue
Provide these details:
1. Browser console screenshot
2. Network tab showing `/api/seller/settings` request/response
3. Database query result for settings table
4. Settings page screenshot showing your values
