# 🧹 Server Cleanup & Fresh Setup Guide

## Server Details:
- **IP:** 157.173.121.26
- **User:** root
- **Password:** 0939d6Bd@
- **Path:** /var/www/inovices

---

## 🎯 What We'll Do:

1. ✅ Stop all PM2 processes
2. ✅ Backup current installation
3. ✅ Clean up old files and artifacts
4. ✅ Fresh npm install
5. ✅ Rebuild application
6. ✅ Deploy optimized code
7. ✅ Configure PM2 properly
8. ✅ Add database indexes
9. ✅ Test everything

---

## 📋 Pre-Cleanup Checklist

Before starting, let's see what's on your server:

```bash
# Connect to server
ssh root@157.173.121.26

# Check current status
cd /var/www/inovices
pm2 status
du -sh .
du -sh node_modules .next
ls -lh *.zip *.pdf 2>/dev/null
```

---

## 🚀 Option 1: Automated Cleanup (Recommended)

### Step 1: Upload Cleanup Script

From your **local machine**:

```bash
# Upload the cleanup script
scp server-fresh-setup.sh root@157.173.121.26:/var/www/inovices/

# Make it executable
ssh root@157.173.121.26 "chmod +x /var/www/inovices/server-fresh-setup.sh"
```

### Step 2: Run Cleanup Script

```bash
# Connect to server
ssh root@157.173.121.26

# Run the script
cd /var/www/inovices
./server-fresh-setup.sh
```

The script will:
- Stop all PM2 processes
- Create backup
- Clean up old files
- Fresh install dependencies
- Rebuild application
- Start PM2

---

## 🔧 Option 2: Manual Cleanup (Step-by-Step)

### Step 1: Connect to Server

```bash
ssh root@157.173.121.26
# Password: 0939d6Bd@
```

### Step 2: Check Current State

```bash
cd /var/www/inovices

# Check PM2 status
pm2 status

# Check disk usage
du -sh .
du -sh node_modules .next

# Check for old files
ls -lh *.zip *.pdf 2>/dev/null
find . -name ".DS_Store" | wc -l
```

### Step 3: Stop PM2

```bash
# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Save PM2 state
pm2 save --force

# Verify
pm2 status
```

### Step 4: Create Backup

```bash
# Create backup directory
mkdir -p /var/www/backups

# Backup current installation
cp -r /var/www/inovices /var/www/backups/inovices-backup-$(date +%Y%m%d-%H%M%S)

# Verify backup
ls -lh /var/www/backups/
```

### Step 5: Clean Up Old Files

```bash
cd /var/www/inovices

# Remove build artifacts
rm -rf .next
rm -rf node_modules

# Remove old files
rm -f *.zip
rm -f *.pdf
rm -f referrence.pdf

# Remove .DS_Store files
find . -name ".DS_Store" -delete

# Clean logs
rm -f logs/*.log
pm2 flush

# Remove test artifacts
rm -rf test-results
rm -rf playwright-report

# Check size now
du -sh .
```

### Step 6: Upload Optimized Files

From your **local machine**, open a new terminal:

```bash
# Upload optimized files
scp middleware.ts root@157.173.121.26:/var/www/inovices/
scp lib/supabase-server.ts root@157.173.121.26:/var/www/inovices/lib/
scp app/api/stats/fbr-invoices/route.ts root@157.173.121.26:/var/www/inovices/app/api/stats/fbr-invoices/
scp ecosystem.config.js root@157.173.121.26:/var/www/inovices/
scp .gitignore root@157.173.121.26:/var/www/inovices/
```

### Step 7: Fresh Install

Back on the **server**:

```bash
cd /var/www/inovices

# Fresh npm install
npm install --production

# Check for errors
echo $?  # Should be 0
```

### Step 8: Build Application

```bash
# Build Next.js
npm run build

# Verify build
ls -lh .next/
```

### Step 9: Start PM2

```bash
# Start with new config
pm2 start ecosystem.config.js

# Save PM2 state
pm2 save

# Check status
pm2 status

# View logs
pm2 logs invoicefbr --lines 20
```

### Step 10: Verify Everything Works

```bash
# Health check
curl http://localhost:3001/api/health

# Stats API (test caching)
time curl http://localhost:3001/api/stats/fbr-invoices
time curl http://localhost:3001/api/stats/fbr-invoices  # Should be faster!

# Rate limiting test
for i in {1..65}; do 
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/health
done
# First 60 should be 200, then 429

# Check PM2
pm2 monit
```

---

## 📊 Step 11: Add Database Indexes

1. Go to **Supabase Dashboard**: https://supabase.com
2. Select your project
3. Click **SQL Editor**
4. Run this SQL:

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

---

## 🧪 Step 12: Load Test

From your **local machine**:

```bash
artillery run load-test-simple.yml
```

Expected results:
- ✅ Error rate: <5% (was 68%)
- ✅ Timeout errors: <100 (was 4,359)
- ✅ Response time p95: <2s (was 5-6s)
- ✅ Capacity: 50-100 req/sec (was 15-20)

---

## 📈 Monitoring Setup

### Install PM2 Log Rotation

```bash
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Create Monitoring Script

```bash
cat > /var/www/inovices/monitor.sh << 'EOF'
#!/bin/bash
echo "=== InvoiceFBR Health Check ==="
echo "Time: $(date)"
echo ""
echo "PM2 Status:"
pm2 list
echo ""
echo "Memory:"
free -h
echo ""
echo "Disk:"
df -h /var/www
echo ""
echo "Health:"
curl -s http://localhost:3001/api/health | jq .
EOF

chmod +x /var/www/inovices/monitor.sh
```

### Setup Cron Job

```bash
# Edit crontab
crontab -e

# Add this line (runs every 5 minutes)
*/5 * * * * /var/www/inovices/monitor.sh >> /var/www/inovices/logs/monitor.log 2>&1
```

---

## 🔍 What to Check After Cleanup

### Server Resources:

```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU usage
top -bn1 | head -20

# Network
netstat -tulpn | grep :3001
```

### Application:

```bash
# PM2 status
pm2 status

# Logs
pm2 logs invoicefbr --lines 50

# Health
curl http://localhost:3001/api/health

# Stats caching
curl http://localhost:3001/api/stats/fbr-invoices
```

### Expected Sizes After Cleanup:

```
/var/www/inovices/
├── node_modules: ~730MB (necessary)
├── .next: ~230MB (build)
├── source code: ~40MB
└── Total: ~1GB (down from potentially 2-3GB)
```

---

## 🚨 Troubleshooting

### If PM2 won't start:

```bash
# Check logs
pm2 logs invoicefbr --err

# Try manual start
cd /var/www/inovices
npm run start:prod

# Check port
netstat -tulpn | grep :3001
```

### If build fails:

```bash
# Check Node version
node -v  # Should be 18+

# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### If health check fails:

```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs invoicefbr --lines 100

# Check port
curl http://localhost:3001/api/health

# Check from outside
curl http://157.173.121.26/api/health
```

### Rollback if needed:

```bash
# Stop current
pm2 stop all
pm2 delete all

# Restore backup
cd /var/www
rm -rf inovices
cp -r backups/inovices-backup-YYYYMMDD-HHMMSS inovices

# Restart
cd inovices
pm2 start ecosystem.config.js
pm2 save
```

---

## ✅ Success Checklist

After cleanup, verify:

- [ ] PM2 shows all instances online
- [ ] Health check returns 200
- [ ] Stats API caching works (2nd call faster)
- [ ] Rate limiting works (429 after 60 requests)
- [ ] No errors in PM2 logs
- [ ] Memory usage stable
- [ ] Disk space freed up
- [ ] Load test shows improvement
- [ ] Website loads normally
- [ ] All features working

---

## 📊 Before vs After

### Before Cleanup:
```
Disk: 2-3GB
Old files: 64MB+ in zips
Build artifacts: Scattered
PM2: Possibly misconfigured
Performance: 15-20 req/sec
Errors: 68% at load
```

### After Cleanup:
```
Disk: ~1GB (clean)
Old files: Archived/removed
Build artifacts: Clean .next folder
PM2: Optimized config
Performance: 50-100 req/sec
Errors: <5% at load
```

---

## 🎉 Final Steps

1. ✅ Test your website: https://invoicefbr.com
2. ✅ Check all features work
3. ✅ Monitor for 24 hours
4. ✅ Run load test again
5. ✅ Set up monitoring alerts

---

## 📞 Need Help?

If something goes wrong:
1. Check PM2 logs: `pm2 logs invoicefbr`
2. Check system logs: `tail -f /var/log/syslog`
3. Restore backup if needed
4. Contact support

---

**Your server will be clean, optimized, and 3-5x faster! 🚀**
