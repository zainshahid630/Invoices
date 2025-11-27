# 🌐 Nginx Fresh Setup Guide for InvoiceFBR

## Server Details:
- **IP:** 157.173.121.26
- **User:** root
- **Domain:** invoicefbr.com

---

## 🎯 What This Setup Does:

1. ✅ **Load Balancing** - Distributes traffic across PM2 instances
2. ✅ **Rate Limiting** - Protects against abuse (60 req/min for API)
3. ✅ **Caching** - Caches static assets and API responses
4. ✅ **SSL/HTTPS** - Secure connections
5. ✅ **Compression** - Gzip for faster loading
6. ✅ **Security Headers** - XSS, CSRF protection
7. ✅ **Optimized Performance** - Connection pooling, keepalive

---

## 🚀 Quick Setup (Automated)

### Step 1: Upload Files

From your **local machine**:

```bash
# Upload nginx config
scp nginx-invoicefbr.conf root@157.173.121.26:/root/

# Upload setup script
scp setup-nginx.sh root@157.173.121.26:/root/
```

### Step 2: Run Setup Script

```bash
# Connect to server
ssh root@157.173.121.26

# Make script executable
chmod +x /root/setup-nginx.sh

# Run setup
cd /root
sudo ./setup-nginx.sh
```

The script will:
- Stop current nginx
- Backup existing config
- Install new optimized config
- Create cache directories
- Test and start nginx

---

## 🔧 Manual Setup (Step-by-Step)

### Step 1: Connect to Server

```bash
ssh root@157.173.121.26
```

### Step 2: Stop Current Nginx

```bash
# Stop nginx
sudo systemctl stop nginx

# Check status
sudo systemctl status nginx
```

### Step 3: Backup Existing Configuration

```bash
# Create backup directory
sudo mkdir -p /etc/nginx/backup-$(date +%Y%m%d)

# Backup current config
sudo cp -r /etc/nginx/sites-available /etc/nginx/backup-$(date +%Y%m%d)/
sudo cp -r /etc/nginx/sites-enabled /etc/nginx/backup-$(date +%Y%m%d)/
sudo cp /etc/nginx/nginx.conf /etc/nginx/backup-$(date +%Y%m%d)/

# Verify backup
ls -lh /etc/nginx/backup-*/
```

### Step 4: Remove Old Configuration

```bash
# Remove old site configs
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/invoicefbr*
sudo rm -f /etc/nginx/sites-available/default
```

### Step 5: Install New Configuration

```bash
# Copy new config (upload from local first)
sudo cp /root/nginx-invoicefbr.conf /etc/nginx/sites-available/invoicefbr.conf

# Create symlink
sudo ln -s /etc/nginx/sites-available/invoicefbr.conf /etc/nginx/sites-enabled/

# Verify
ls -lh /etc/nginx/sites-enabled/
```

### Step 6: Create Required Directories

```bash
# Cache directory
sudo mkdir -p /var/cache/nginx/invoicefbr
sudo chown -R www-data:www-data /var/cache/nginx/invoicefbr
sudo chmod -R 755 /var/cache/nginx/invoicefbr

# Certbot directory (for SSL)
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot

# Log directory
sudo mkdir -p /var/log/nginx
sudo chown -R www-data:www-data /var/log/nginx
```

### Step 7: Test Configuration

```bash
# Test nginx config
sudo nginx -t

# Should see:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 8: Start Nginx

```bash
# Start nginx
sudo systemctl start nginx

# Enable on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Check if listening
sudo netstat -tulpn | grep nginx
```

---

## 🔒 SSL Certificate Setup

### Option 1: Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d invoicefbr.com -d www.invoicefbr.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended)

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron
sudo crontab -e
# Add this line:
0 0 * * * certbot renew --quiet
```

### Option 2: Using Existing Certificate

If you already have SSL certificates:

```bash
# Copy certificates to Let's Encrypt directory
sudo mkdir -p /etc/letsencrypt/live/invoicefbr.com/
sudo cp your-fullchain.pem /etc/letsencrypt/live/invoicefbr.com/fullchain.pem
sudo cp your-privkey.pem /etc/letsencrypt/live/invoicefbr.com/privkey.pem

# Set permissions
sudo chmod 644 /etc/letsencrypt/live/invoicefbr.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/invoicefbr.com/privkey.pem

# Reload nginx
sudo systemctl reload nginx
```

### Option 3: Temporary Self-Signed (Testing Only)

```bash
# Generate self-signed certificate
sudo mkdir -p /etc/letsencrypt/live/invoicefbr.com/
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/invoicefbr.com/privkey.pem \
  -out /etc/letsencrypt/live/invoicefbr.com/fullchain.pem \
  -subj "/CN=invoicefbr.com"

# Reload nginx
sudo systemctl reload nginx
```

---

## 🔄 Update PM2 Configuration

Your nginx is configured for 4 PM2 instances on ports 3001-3004.

Update your `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'invoicefbr',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/inovices',
      instances: 4,  // Match nginx upstream
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // ... rest of config
    },
  ],
};
```

Restart PM2:

```bash
cd /var/www/inovices
pm2 delete invoicefbr
pm2 start ecosystem.config.js
pm2 save
```

---

## ✅ Verification

### Test Nginx

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://invoicefbr.com

# Test HTTPS
curl -I https://invoicefbr.com

# Test health endpoint
curl https://invoicefbr.com/api/health

# Test from outside
curl -I http://157.173.121.26
```

### Check Logs

```bash
# Access log
sudo tail -f /var/log/nginx/invoicefbr-access.log

# Error log
sudo tail -f /var/log/nginx/invoicefbr-error.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Test Caching

```bash
# First request (cache MISS)
curl -I https://invoicefbr.com/api/stats/fbr-invoices
# Look for: X-Cache-Status: MISS

# Second request (cache HIT)
curl -I https://invoicefbr.com/api/stats/fbr-invoices
# Look for: X-Cache-Status: HIT
```

### Test Rate Limiting

```bash
# Send 70 requests (limit is 60/min)
for i in {1..70}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://invoicefbr.com/api/health
  sleep 0.1
done

# Should see:
# First 60: 200
# After 60: 429 (Too Many Requests)
```

---

## 📊 Monitoring

### Nginx Status

```bash
# Check status
sudo systemctl status nginx

# Check configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx
```

### Check Connections

```bash
# Active connections
sudo netstat -an | grep :80 | wc -l
sudo netstat -an | grep :443 | wc -l

# Nginx processes
ps aux | grep nginx
```

### Cache Statistics

```bash
# Check cache size
du -sh /var/cache/nginx/invoicefbr/

# Clear cache
sudo rm -rf /var/cache/nginx/invoicefbr/*
sudo systemctl reload nginx
```

---

## 🚨 Troubleshooting

### Nginx won't start

```bash
# Check configuration
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Check if port is in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### 502 Bad Gateway

```bash
# Check if PM2 is running
pm2 status

# Check PM2 logs
pm2 logs invoicefbr

# Check nginx error log
sudo tail -f /var/log/nginx/invoicefbr-error.log

# Test backend directly
curl http://localhost:3001/api/health
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect invoicefbr.com:443
```

### Permission Issues

```bash
# Fix nginx permissions
sudo chown -R www-data:www-data /var/cache/nginx
sudo chown -R www-data:www-data /var/log/nginx
sudo chown -R www-data:www-data /var/www/certbot

# Restart nginx
sudo systemctl restart nginx
```

---

## 🎯 Performance Tuning

### Increase Worker Connections

Edit `/etc/nginx/nginx.conf`:

```nginx
events {
    worker_connections 2048;  # Increase from default 768
    use epoll;
    multi_accept on;
}
```

### Enable HTTP/2

Already enabled in the config:
```nginx
listen 443 ssl http2;
```

### Optimize Buffer Sizes

Already configured in the config:
```nginx
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
```

---

## 📈 Expected Performance

### Before Nginx Optimization:
- Direct PM2 access
- No caching
- No rate limiting
- No load balancing

### After Nginx Optimization:
- ✅ Load balanced across 4 instances
- ✅ Static assets cached (1 year)
- ✅ API responses cached (5 minutes)
- ✅ Rate limiting (60 req/min API)
- ✅ Gzip compression
- ✅ SSL/HTTPS
- ✅ Security headers

**Expected improvement: 2-3x faster, more stable, better security**

---

## 🔄 Common Commands

```bash
# Reload nginx (no downtime)
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Test configuration
sudo nginx -t

# View access log
sudo tail -f /var/log/nginx/invoicefbr-access.log

# View error log
sudo tail -f /var/log/nginx/invoicefbr-error.log

# Clear cache
sudo rm -rf /var/cache/nginx/invoicefbr/*

# Check nginx version
nginx -v

# Check nginx status
sudo systemctl status nginx
```

---

## ✅ Success Checklist

- [ ] Nginx installed and running
- [ ] New configuration applied
- [ ] SSL certificate installed
- [ ] HTTP redirects to HTTPS
- [ ] Health check works
- [ ] Caching works (X-Cache-Status header)
- [ ] Rate limiting works (429 after limit)
- [ ] Static assets load fast
- [ ] PM2 instances load balanced
- [ ] Logs working
- [ ] Website accessible

---

**Your nginx is now optimized and production-ready! 🚀**
