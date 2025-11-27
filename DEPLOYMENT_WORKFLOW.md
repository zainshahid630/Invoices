# 🚀 InvoiceFBR Deployment Workflow

Complete guide for deploying code changes to production server.

---

## 📋 Server Information

```
Server IP: 157.173.121.26
User: root
Password: 0939d6Bd@
Project Path: /var/www/inovices
Domain: invoicefbr.com
```

---

## 🔄 Standard Deployment Process

### Option 1: Quick Deploy (Single File Changes)

#### On Your Local Machine:

```bash
# Navigate to project
cd ~/Documents/augment-projects/Saas-Invoices

# Upload a single file
scp path/to/file.ts root@157.173.121.26:/var/www/inovices/path/to/file.ts

# Example: Upload a component
scp components/InvoiceForm.tsx root@157.173.121.26:/var/www/inovices/components/

# Example: Upload an API route
scp app/api/seller/invoices/route.ts root@157.173.121.26:/var/www/inovices/app/api/seller/invoices/
```

#### On Server:

```bash
# Connect to server
ssh root@157.173.121.26

# Navigate to project
cd /var/www/inovices

# Rebuild Next.js
npm run build

# Restart PM2
pm2 restart invoicefbr

# Check status
pm2 status
pm2 logs invoicefbr --lines 20
```

---

### Option 2: Multiple Files Deploy

#### On Your Local Machine:

```bash
# Upload multiple files at once
scp file1.ts file2.tsx file3.ts root@157.173.121.26:/var/www/inovices/

# Upload entire folder
scp -r components/new-feature root@157.173.121.26:/var/www/inovices/components/

# Upload multiple specific files
scp \
  middleware.ts \
  lib/supabase-server.ts \
  ecosystem.config.js \
  root@157.173.121.26:/var/www/inovices/
```

#### On Server:

```bash
ssh root@157.173.121.26
cd /var/www/inovices
npm run build
pm2 restart invoicefbr
```

---

### Option 3: Full Deployment (Major Changes)

#### On Your Local Machine:

```bash
# Create deployment package (excludes node_modules, .next)
cd ~/Documents/augment-projects/Saas-Invoices

zip -r deployment-$(date +%Y%m%d-%H%M).zip \
  app \
  components \
  contexts \
  database \
  hooks \
  lib \
  public \
  scripts \
  middleware.ts \
  ecosystem.config.js \
  package.json \
  package-lock.json \
  next.config.js \
  tsconfig.json \
  tailwind.config.ts \
  postcss.config.js \
  .gitignore \
  -x "*.DS_Store" "node_modules/*" ".next/*" "*.log"

# Upload to server
scp deployment-*.zip root@157.173.121.26:/root/
```

#### On Server:

```bash
ssh root@157.173.121.26

# Stop services
pm2 stop invoicefbr

# Backup current version
cp -r /var/www/inovices /var/www/backups/inovices-backup-$(date +%Y%m%d-%H%M%S)

# Extract new version
cd /var/www/inovices
unzip -o /root/deployment-*.zip

# Install dependencies (if package.json changed)
npm install

# Build
npm run build

# Restart
pm2 restart invoicefbr
pm2 save

# Verify
pm2 status
curl http://localhost:3001/api/health
```

---

## 🔧 Common Deployment Scenarios

### Scenario 1: Update a React Component

```bash
# Local
scp components/InvoiceForm.tsx root@157.173.121.26:/var/www/inovices/components/

# Server
ssh root@157.173.121.26
cd /var/www/inovices
npm run build
pm2 restart invoicefbr
```

### Scenario 2: Update an API Route

```bash
# Local
scp app/api/seller/invoices/route.ts root@157.173.121.26:/var/www/inovices/app/api/seller/invoices/

# Server
ssh root@157.173.121.26
cd /var/www/inovices
npm run build
pm2 restart invoicefbr
```

### Scenario 3: Update Middleware or Config

```bash
# Local
scp middleware.ts root@157.173.121.26:/var/www/inovices/
scp next.config.js root@157.173.121.26:/var/www/inovices/

# Server
ssh root@157.173.121.26
cd /var/www/inovices
npm run build
pm2 delete invoicefbr
pm2 start ecosystem.config.js
pm2 save
```

### Scenario 4: Update Nginx Configuration

```bash
# Local
scp nginx-invoicefbr.conf root@157.173.121.26:/etc/nginx/sites-available/invoicefbr.conf

# Server
ssh root@157.173.121.26
nginx -t
systemctl reload nginx
```

### Scenario 5: Add New Dependencies

```bash
# Local - Update package.json first, then:
scp package.json root@157.173.121.26:/var/www/inovices/

# Server
ssh root@157.173.121.26
cd /var/www/inovices
npm install
npm run build
pm2 restart invoicefbr
```

---

## 📝 Pre-Deployment Checklist

Before deploying, always:

- [ ] Test locally: `npm run build`
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Check for linting errors: `npm run lint`
- [ ] Test the feature locally
- [ ] Commit changes to git (optional but recommended)

---

## ✅ Post-Deployment Verification

After deploying, always verify:

```bash
# On Server
ssh root@157.173.121.26

# 1. Check PM2 status
pm2 status
# All instances should show "online"

# 2. Check logs for errors
pm2 logs invoicefbr --lines 50
# Should not show any errors

# 3. Test health endpoint
curl http://localhost:3001/api/health
# Should return: {"status":"healthy","database":"connected"}

# 4. Test the website
curl -I https://invoicefbr.com
# Should return: HTTP/2 200

# 5. Check Nginx
systemctl status nginx
# Should show: active (running)

# 6. Monitor for 5 minutes
pm2 monit
# Watch for any crashes or high memory usage
```

---

## 🚨 Rollback Procedure

If deployment fails:

```bash
# On Server
ssh root@157.173.121.26

# Stop current version
pm2 stop invoicefbr

# Restore from backup
cd /var/www
rm -rf inovices
cp -r backups/inovices-backup-YYYYMMDD-HHMMSS inovices

# Restart
cd inovices
pm2 start ecosystem.config.js
pm2 save

# Verify
pm2 status
curl http://localhost:3001/api/health
```

---

## 🔐 SSH Key Setup (Optional - No Password Needed)

### One-Time Setup:

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
# Press Enter for all prompts (use default location)

# Copy key to server
ssh-copy-id root@157.173.121.26
# Enter password one last time

# Test - should not ask for password
ssh root@157.173.121.26
```

Now you can deploy without entering password every time!

---

## 📦 Automated Deployment Script

Create this script on your local machine:

```bash
# Save as: deploy.sh
#!/bin/bash

echo "🚀 Deploying to InvoiceFBR Production..."

# Build locally first
echo "📦 Building locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Local build failed! Fix errors before deploying."
    exit 1
fi

echo "✅ Local build successful"

# Ask for confirmation
read -p "Deploy to production? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Upload changed files
echo "📤 Uploading files..."
scp -r \
  app \
  components \
  lib \
  middleware.ts \
  root@157.173.121.26:/var/www/inovices/

# Deploy on server
echo "🔧 Deploying on server..."
ssh root@157.173.121.26 << 'ENDSSH'
cd /var/www/inovices
npm run build
pm2 restart invoicefbr
pm2 status
ENDSSH

echo "✅ Deployment complete!"
echo "🔍 Verify at: https://invoicefbr.com"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Use it:
```bash
./deploy.sh
```

---

## 🎯 Quick Reference Commands

### Local Machine:

```bash
# Upload single file
scp file.ts root@157.173.121.26:/var/www/inovices/path/to/file.ts

# Upload folder
scp -r folder root@157.173.121.26:/var/www/inovices/

# Connect to server
ssh root@157.173.121.26
```

### On Server:

```bash
# Navigate to project
cd /var/www/inovices

# Build
npm run build

# Restart
pm2 restart invoicefbr

# Check status
pm2 status

# View logs
pm2 logs invoicefbr --lines 50

# Monitor
pm2 monit

# Health check
curl http://localhost:3001/api/health
```

---

## 📊 Monitoring After Deployment

```bash
# Check monitoring logs
tail -f /var/www/inovices/logs/monitor.log

# Check for alerts
tail -f /var/www/inovices/logs/alerts.log

# Check metrics
tail /var/www/inovices/logs/metrics.log

# Check PM2 logs
pm2 logs invoicefbr --lines 100

# Check Nginx logs
tail -f /var/log/nginx/invoicefbr-access.log
tail -f /var/log/nginx/invoicefbr-error.log
```

---

## 🆘 Troubleshooting

### Build Fails:

```bash
# Check for errors
npm run build

# Clear cache and rebuild
rm -rf .next
npm run build
```

### PM2 Won't Start:

```bash
# Check logs
pm2 logs invoicefbr --err

# Delete and restart
pm2 delete invoicefbr
pm2 start ecosystem.config.js
pm2 save
```

### Website Shows Old Version:

```bash
# Clear Next.js cache
rm -rf .next
npm run build
pm2 restart invoicefbr

# Clear browser cache
# Press Ctrl+Shift+R (hard refresh)
```

### 502 Bad Gateway:

```bash
# Check if PM2 is running
pm2 status

# Check if port is listening
netstat -tulpn | grep :3001

# Restart everything
pm2 restart invoicefbr
systemctl reload nginx
```

---

## 📞 Support

If you need help:
- Check logs: `pm2 logs invoicefbr`
- Check monitoring: `tail -f /var/www/inovices/logs/monitor.log`
- Check health: `curl http://localhost:3001/api/health`
- Email alerts: Check zainshahid630@gmail.com

---

## 🎓 Best Practices

1. ✅ **Always test locally first**
2. ✅ **Deploy during low-traffic hours**
3. ✅ **Create backups before major changes**
4. ✅ **Monitor for 5-10 minutes after deployment**
5. ✅ **Keep deployment logs**
6. ✅ **Use git for version control**
7. ✅ **Document what you deployed**
8. ✅ **Test the website after deployment**

---

**Happy Deploying! 🚀**
