# 🚀 Manual Deployment Steps

## Server Details:
- **IP:** 157.173.121.26
- **User:** root
- **Password:** 0939d6Bd@
- **Path:** /var/www/inovices

---

## Option 1: Automated Deployment (Recommended)

Run this from your local machine:

```bash
./deploy-performance-fixes.sh
```

It will:
1. Connect to your server
2. Create backup
3. Upload optimized files
4. Rebuild Next.js
5. Restart PM2

---

## Option 2: Manual Deployment

### Step 1: Connect to Server

```bash
ssh root@157.173.121.26
# Password: 0939d6Bd@
```

### Step 2: Create Backup

```bash
cd /var/www/inovices
cp -r . ../inovices-backup-$(date +%Y%m%d-%H%M%S)
```

### Step 3: Upload Files

From your **local machine**, open a new terminal and run:

```bash
# Upload middleware.ts
scp middleware.ts root@157.173.121.26:/var/www/inovices/

# Upload lib/supabase-server.ts
scp lib/supabase-server.ts root@157.173.121.26:/var/www/inovices/lib/

# Upload app/api/stats/fbr-invoices/route.ts
scp app/api/stats/fbr-invoices/route.ts root@157.173.121.26:/var/www/inovices/app/api/stats/fbr-invoices/

# Upload ecosystem.config.js
scp ecosystem.config.js root@157.173.121.26:/var/www/inovices/
```

### Step 4: Rebuild on Server

Back in your **SSH session**:

```bash
cd /var/www/inovices

# Rebuild Next.js
npm run build

# Restart PM2
pm2 delete invoicefbr
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
pm2 logs invoicefbr --lines 20
```

### Step 5: Verify Deployment

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test stats caching (run twice)
time curl http://localhost:3001/api/stats/fbr-invoices
time curl http://localhost:3001/api/stats/fbr-invoices  # Should be much faster!

# Test rate limiting
for i in {1..65}; do 
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/health
done
```

Expected results:
- First stats call: ~500-1000ms
- Second stats call: ~5-50ms (cached!)
- Rate limit: First 60 = 200, then 429

---

## Step 6: Add Database Indexes

1. Go to **Supabase Dashboard**: https://supabase.com
2. Select your project
3. Click **SQL Editor**
4. Copy and paste this:

```sql
-- Critical indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_status 
ON invoices(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at 
ON invoices(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_company_id 
ON invoices(company_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_company_id 
ON products(company_id);

CREATE INDEX IF NOT EXISTS idx_customers_company_id 
ON customers(company_id);

-- Update statistics
ANALYZE invoices;
ANALYZE companies;
ANALYZE products;
ANALYZE customers;
```

5. Click **Run**
6. Wait for completion (30-60 seconds)

---

## Step 7: Run Load Test

From your **local machine**:

```bash
artillery run load-test-simple.yml
```

Expected improvements:
- ✅ Error rate: 68% → <5%
- ✅ Timeout errors: 4,359 → <100
- ✅ Response time (p95): 5-6s → 1-2s
- ✅ Capacity: 15-20 req/sec → 50-100 req/sec

---

## Monitoring

### Check PM2 Status
```bash
pm2 status
pm2 monit
pm2 logs invoicefbr --lines 100
```

### Check System Resources
```bash
htop
free -h
df -h
```

### Check Application
```bash
# Health check
curl http://localhost:3001/api/health

# Stats (should see caching)
curl http://localhost:3001/api/stats/fbr-invoices
```

---

## Troubleshooting

### If build fails:
```bash
cd /var/www/inovices
npm install
npm run build
```

### If PM2 won't start:
```bash
pm2 logs invoicefbr --err
pm2 delete invoicefbr
pm2 start ecosystem.config.js
```

### If still getting errors:
```bash
# Rollback to backup
pm2 stop invoicefbr
cd /var/www
rm -rf inovices
mv inovices-backup-YYYYMMDD-HHMMSS inovices
cd inovices
pm2 start ecosystem.config.js
```

---

## Quick Commands Reference

```bash
# Connect to server
ssh root@157.173.121.26

# Navigate to project
cd /var/www/inovices

# Check PM2
pm2 status
pm2 logs invoicefbr
pm2 monit

# Restart PM2
pm2 restart invoicefbr

# Rebuild
npm run build
pm2 restart invoicefbr

# Check health
curl http://localhost:3001/api/health

# View logs
tail -f logs/pm2-out.log
tail -f logs/pm2-error.log
```

---

## Success Checklist

- [ ] Connected to server
- [ ] Backup created
- [ ] Files uploaded
- [ ] Build successful
- [ ] PM2 restarted
- [ ] Health check passes
- [ ] Stats caching works (2nd call faster)
- [ ] Rate limiting works (429 after 60 requests)
- [ ] Database indexes added
- [ ] Load test shows improvement
- [ ] No errors in logs
- [ ] Site working normally

---

## Expected Results

### Before:
- Capacity: 15-20 req/sec
- Error rate: 68%
- Response time: 5-6s

### After:
- Capacity: 50-100 req/sec (3-5x improvement)
- Error rate: <5%
- Response time: 1-2s (60% faster)

🎉 **Your site will be 3-5x faster!**
