# Query Performance Optimization Guide

## Current Performance Analysis

### Slow Queries Identified:

1. **Supabase Dashboard Queries** (1400-1600ms)
   - These are internal Supabase operations
   - Run when you open Dashboard → Database → Tables
   - **No action needed** - these don't affect your app

2. **Your Product Insert Query** (7.96ms average, 50ms max)
   - Actually performing well!
   - 19 calls total
   - Can be optimized further with batch inserts

## Optimization Strategies

### 1. Batch Inserts (If Inserting Multiple Products)

**Current (Slow):**
```javascript
// 19 separate INSERT queries
for (const product of products) {
  await supabase.from('products').insert(product);
}
```

**Optimized (Fast):**
```javascript
// 1 batch INSERT query
await supabase.from('products').insert(products);
```

**Performance Gain:** 10-20x faster for bulk operations

### 2. Add Indexes for Frequent Queries

Check if you're querying products frequently by these fields:

```sql
-- If you often search by company_id (you probably do)
CREATE INDEX IF NOT EXISTS idx_products_company_active 
ON products(company_id, is_active) 
WHERE is_active = true;

-- If you search by name
CREATE INDEX IF NOT EXISTS idx_products_name_search 
ON products USING gin(name gin_trgm_ops);
-- Requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- If you filter by low stock
CREATE INDEX IF NOT EXISTS idx_products_low_stock 
ON products(company_id, current_stock) 
WHERE current_stock < 10 AND is_active = true;
```

### 3. Optimize Invoice Queries

If you're experiencing slow invoice queries:

```sql
-- Composite index for common invoice filters
CREATE INDEX IF NOT EXISTS idx_invoices_company_status_date 
ON invoices(company_id, status, invoice_date DESC);

-- For payment status queries
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status 
ON invoices(company_id, payment_status) 
WHERE payment_status IN ('pending', 'partial', 'overdue');
```

### 4. Use Materialized Views for Dashboard Stats

If dashboard loads slowly:

```sql
-- Create materialized view for company stats
CREATE MATERIALIZED VIEW company_stats_mv AS
SELECT 
  company_id,
  COUNT(*) FILTER (WHERE is_active = true) as active_products,
  COUNT(*) FILTER (WHERE current_stock < 10) as low_stock_products,
  SUM(current_stock * unit_price) as inventory_value
FROM products
GROUP BY company_id;

-- Refresh periodically (e.g., every hour)
CREATE INDEX ON company_stats_mv(company_id);

-- Refresh command (run via cron or trigger)
REFRESH MATERIALIZED VIEW CONCURRENTLY company_stats_mv;
```

### 5. Enable Query Plan Caching

Already done with your optimized functions using `STABLE` keyword:
```sql
CREATE OR REPLACE FUNCTION get_invoice_stats_optimized(p_company_id UUID)
LANGUAGE plpgsql
STABLE  -- ✅ This enables query plan caching
```

## Monitoring Query Performance

### Check Slow Queries in Your App

```sql
-- Find your app's slowest queries
SELECT 
  query,
  calls,
  mean_time,
  total_time,
  rows_read / calls as avg_rows_per_call
FROM pg_stat_statements
WHERE rolname = 'service_role'  -- Your app's role
  AND query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 20;
```

### Reset Statistics

```sql
-- Reset pg_stat_statements to start fresh
SELECT pg_stat_statements_reset();
```

## Specific Recommendations for Your App

### 1. Product Operations
```sql
-- Current indexes are good, but add this if you search by name often
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
ON products USING gin(name gin_trgm_ops);
```

### 2. Invoice Operations
```sql
-- Speed up invoice listing
CREATE INDEX IF NOT EXISTS idx_invoices_company_date 
ON invoices(company_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- Speed up invoice stats
CREATE INDEX IF NOT EXISTS idx_invoices_stats 
ON invoices(company_id, status, payment_status) 
INCLUDE (total_amount);
```

### 3. Customer Queries
```sql
-- Speed up customer search
CREATE INDEX IF NOT EXISTS idx_customers_company_active 
ON customers(company_id, is_active) 
WHERE is_active = true;

-- For customer name search
CREATE INDEX IF NOT EXISTS idx_customers_name_search 
ON customers USING gin(name gin_trgm_ops);
```

## Application-Level Optimizations

### 1. Use Select Specific Columns
**Bad:**
```javascript
const { data } = await supabase.from('products').select('*');
```

**Good:**
```javascript
const { data } = await supabase
  .from('products')
  .select('id, name, unit_price, current_stock');
```

### 2. Implement Pagination
**Bad:**
```javascript
const { data } = await supabase.from('invoices').select('*');
```

**Good:**
```javascript
const { data } = await supabase
  .from('invoices')
  .select('*')
  .range(0, 49)  // First 50 records
  .order('invoice_date', { ascending: false });
```

### 3. Use Filters Efficiently
**Bad:**
```javascript
const { data } = await supabase
  .from('products')
  .select('*');
// Then filter in JavaScript
const filtered = data.filter(p => p.company_id === companyId);
```

**Good:**
```javascript
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('company_id', companyId)
  .eq('is_active', true);
```

### 4. Cache Frequently Accessed Data
```javascript
// Use React Query or similar
const { data: products } = useQuery(
  ['products', companyId],
  () => fetchProducts(companyId),
  { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
);
```

## Performance Benchmarks

### Target Response Times:
- Simple SELECT: < 10ms ✅ (You're here)
- Complex JOIN: < 50ms
- Dashboard stats: < 100ms
- Report generation: < 500ms

### Your Current Performance:
- Product INSERT: 7.96ms average ✅ Excellent
- Max INSERT time: 50ms ✅ Good

## Next Steps

1. ✅ RLS is enabled and optimized
2. ✅ Functions have search_path security
3. ⚠️ Consider adding indexes if you notice slow queries
4. ⚠️ Implement pagination for large lists
5. ⚠️ Use materialized views for complex dashboard stats

## When to Optimize

Only optimize if you experience:
- Page load times > 2 seconds
- Query times > 100ms consistently
- User complaints about slowness
- Database CPU > 80%

**Current Status:** Your queries are performing well! No immediate optimization needed.

## Monitoring Tools

### Supabase Dashboard
- Database → Performance
- Shows slow queries automatically
- Suggests indexes

### Application Monitoring
```javascript
// Add timing to your queries
const start = performance.now();
const { data } = await supabase.from('products').select('*');
const duration = performance.now() - start;
console.log(`Query took ${duration}ms`);
```

## Summary

Your current performance is **good**! The slow queries you see are mostly from Supabase's internal dashboard operations, not your application.

**Action Items:**
1. ✅ No immediate action needed
2. Monitor query performance as data grows
3. Add indexes when you notice specific slow queries
4. Implement pagination for large datasets
5. Use batch operations for bulk inserts

**Performance Status:** 🟢 Healthy
