# Apply Database Performance Indexes

## Instructions

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project
   - Navigate to SQL Editor

2. **Run the Index Script**
   - Copy the contents of `database/indexes/performance_indexes.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Indexes Were Created**
   Run this query to check:
   ```sql
   SELECT 
     schemaname,
     tablename, 
     indexname,
     indexdef
   FROM pg_indexes 
   WHERE schemaname = 'public'
     AND tablename IN ('invoices', 'customers', 'products', 'invoice_items', 'payments')
   ORDER BY tablename, indexname;
   ```

4. **Check Index Usage (After a Few Days)**
   ```sql
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan as scans,
     idx_tup_read as tuples_read,
     idx_tup_fetch as tuples_fetched
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan DESC;
   ```

## Expected Results

After applying indexes, you should see:
- ✅ Query times reduced by 3-5x
- ✅ Faster invoice list loading
- ✅ Faster customer/product searches
- ✅ Better performance under load

## Troubleshooting

If you get "index already exists" errors:
- This is normal if indexes were partially applied before
- Continue with remaining indexes
- Use `CREATE INDEX IF NOT EXISTS` (already in the script)

If queries are still slow:
- Check if indexes are being used: `EXPLAIN ANALYZE SELECT ...`
- Ensure `deleted_at IS NULL` is in your WHERE clauses
- Consider adding more specific indexes for your query patterns

## Maintenance

Run these periodically (monthly):
```sql
-- Update statistics
ANALYZE public.invoices;
ANALYZE public.customers;
ANALYZE public.products;

-- Reclaim space
VACUUM ANALYZE public.invoices;
VACUUM ANALYZE public.customers;
VACUUM ANALYZE public.products;
```
