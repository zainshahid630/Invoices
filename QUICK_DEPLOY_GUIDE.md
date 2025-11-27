# ⚡ Quick Deploy Guide - InvoiceFBR

## 🎯 Most Common Deployment (90% of cases)

### 1. Upload Files (Local Machine)

```bash
cd ~/Documents/augment-projects/Saas-Invoices

# Upload changed files
scp file1.tsx file2.ts root@157.173.121.26:/var/www/inovices/path/to/
```

### 2. Deploy (Server)

```bash
ssh root@157.173.121.26
cd /var/www/inovices
npm run build && pm2 restart invoicefbr
```

### 3. Verify

```bash
pm2 status
curl http://localhost:3001/api/health
```

**Done!** ✅

---

## 📝 Copy-Paste Commands

### Deploy Single File:

```bash
# Local
scp components/MyComponent.tsx root@157.173.121.26:/var/www/inovices/components/

# Server
ssh root@157.173.121.26 "cd /var/www/inovices && npm run build && pm2 restart invoicefbr"
```

### Deploy Multiple Files:

```bash
# Local
scp file1.ts file2.tsx file3.ts root@157.173.121.26:/var/www/inovices/

# Server
ssh root@157.173.121.26 "cd /var/www/inovices && npm run build && pm2 restart invoicefbr"
```

### One-Line Deploy:

```bash
scp your-file.ts root@157.173.121.26:/var/www/inovices/path/ && ssh root@157.173.121.26 "cd /var/www/inovices && npm run build && pm2 restart invoicefbr && pm2 status"
```

---

## 🔑 Server Info

```
IP: 157.173.121.26
User: root
Password: 0939d6Bd@
Path: /var/www/inovices
```

---

## ✅ Verification Checklist

After every deployment:

```bash
# 1. Check PM2
pm2 status
# All should show "online"

# 2. Check logs
pm2 logs invoicefbr --lines 20
# No errors

# 3. Test health
curl http://localhost:3001/api/health
# Returns: {"status":"healthy"}

# 4. Test website
curl -I https://invoicefbr.com
# Returns: HTTP/2 200
```

---

## 🚨 If Something Breaks

```bash
# Rollback
ssh root@157.173.121.26
pm2 stop invoicefbr
cd /var/www
rm -rf inovices
cp -r backups/inovices-backup-LATEST inovices
cd inovices
pm2 start ecosystem.config.js
```

---

## 📞 Quick Help

- Logs: `pm2 logs invoicefbr`
- Status: `pm2 status`
- Restart: `pm2 restart invoicefbr`
- Monitor: `pm2 monit`

---

**That's it! Keep it simple.** 🚀
