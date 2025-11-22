# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Failed to fetch customers" Error

**Symptoms:**
- 500 error on `/api/seller/invoices/init-data`
- Error message: "Failed to fetch customers"

**Solutions:**

1. **Check Server Console**
   - Look at your terminal where `npm run dev` is running
   - You should see detailed error logs with the actual database error

2. **Verify Supabase Connection**
   ```bash
   # Check your .env.local file has these variables:
   NEXT_PUBLIC_SUPABASE_URL=your-url
   SUPABASE_SERVICE_ROLE_KEY=your-key
   ```

3. **Check Database Permissions**
   - Go to Supabase Dashboard → Authentication → Policies
   - Ensure service_role has access to customers, products, settings tables

4. **Verify Tables Exist**
   - Go to Supabase Dashboard → Table Editor
   - Confirm these tables exist:
     - customers
     - products
     - settings
     - invoices

### Issue: Page Still Shows 3 API Calls

**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check Network tab - should see only `/init-data` call

### Issue: Skeleton Loaders Not Showing

**Solution:**
- Verify import path is correct: `@/app/components/LoadingStates`
- Check if LoadingStates.tsx exists in app/components/
- Clear Next.js cache: `rm -rf .next && npm run dev`

### Issue: Invoice Number Still Slow

**Solution:**
- Run the database indexes (see SAFE_indexes_step_by_step.sql)
- Check if you have thousands of invoices (may need pagination)
- Verify the optimized function is being used

### Issue: Database Index Errors

**Symptoms:**
- Error: "relation does not exist"
- Error: "permission denied"

**Solutions:**

1. **Run indexes one at a time**
   - Use `database/indexes/SAFE_indexes_step_by_step.sql`
   - Copy and paste each CREATE INDEX statement individually

2. **Check schema**
   - Indexes should use `public.table_name`
   - Example: `CREATE INDEX ... ON public.invoices(...)`

3. **Skip failed indexes**
   - If an index fails, it's okay to skip it
   - The most important one is `idx_invoices_company_date`

### Issue: Stats Function Not Working

**Symptoms:**
- Stats still slow
- Error in console about RPC function

**Solution:**
- The code has a fallback - stats will still work
- To fix: Run `database/functions/get_invoice_stats_optimized.sql` in Supabase SQL Editor
- Grant permissions if needed

## Debugging Steps

### 1. Check API Endpoint Directly

```bash
# Test the init-data endpoint
curl "http://localhost:3000/api/seller/invoices/init-data?company_id=YOUR_COMPANY_ID"
```

Expected response:
```json
{
  "customers": [...],
  "products": [...],
  "nextInvoiceNumber": "INV123",
  "defaultHsCode": "...",
  "defaultSalesTaxRate": 18,
  "defaultFurtherTaxRate": 0,
  "invoicePrefix": "INV"
}
```

### 2. Check Server Logs

Look for these in your terminal:
```
✅ All initial data loaded in single request
```

Or error messages like:
```
Error fetching customers: { message: "...", details: "..." }
```

### 3. Check Browser Console

Open DevTools → Console, look for:
- Network errors
- JavaScript errors
- API response data

### 4. Check Network Tab

Open DevTools → Network:
- Should see 1 call to `init-data`
- Status should be 200 (not 500)
- Response should have customers, products, etc.

## Performance Verification

### Before Fixes:
```
Network Tab:
- /api/seller/customers (500ms)
- /api/seller/products (400ms)
- /api/seller/invoices/next-number (300ms)
Total: ~1200ms + overhead = 1.5-2s
```

### After Fixes:
```
Network Tab:
- /api/seller/invoices/init-data (600ms)
Total: ~600ms = 0.6-0.8s
```

## Still Having Issues?

1. **Check Supabase Status**
   - Visit status.supabase.com
   - Ensure no outages

2. **Verify Environment Variables**
   ```bash
   # In your terminal
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

3. **Check Database Logs**
   - Supabase Dashboard → Logs → Database
   - Look for query errors

4. **Test Individual Queries**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM customers WHERE company_id = 'your-id' LIMIT 5;
   SELECT * FROM products WHERE company_id = 'your-id' LIMIT 5;
   SELECT * FROM settings WHERE company_id = 'your-id';
   ```

5. **Restart Development Server**
   ```bash
   # Stop the server (Ctrl+C)
   # Clear cache
   rm -rf .next
   # Restart
   npm run dev
   ```

## Getting Help

If you're still stuck:

1. Check the server console for detailed error messages
2. Check the browser console for client-side errors
3. Verify all files were created correctly
4. Ensure Supabase credentials are correct
5. Test the API endpoint directly with curl

## Quick Fixes Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Supabase credentials are set in `.env.local`
- [ ] Tables exist in Supabase (customers, products, settings, invoices)
- [ ] Browser cache is cleared
- [ ] No errors in server console
- [ ] No errors in browser console
- [ ] Network tab shows init-data call
- [ ] init-data returns 200 status (not 500)
