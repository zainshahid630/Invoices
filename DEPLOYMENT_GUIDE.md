# 🚀 Deployment Guide - SaaS Invoice Management System

## ✅ Build Status: SUCCESS

The application has been successfully built and is ready for deployment!

---

## 📋 Build Summary

### **Build Details:**
- **Node Version:** 21.7.3
- **npm Version:** 10.8.2
- **Next.js Version:** 14.2.33
- **Build Status:** ✅ Compiled Successfully
- **Port:** 3001
- **Production URL:** https://invoicefbr.com

### **Build Fixes Applied:**
1. ✅ Fixed React Hook conditional call in customers page
2. ✅ Fixed unescaped entities (apostrophes and quotes)
3. ✅ Fixed TypeScript error in layout.tsx (React.Node → React.ReactNode)
4. ✅ Fixed duplicate company_id in customers page
5. ✅ Added missing is_active property to Customer interface
6. ✅ Added missing buyer_name property to Payment.invoice interface
7. ✅ Configured next.config.js for dynamic routes

---

## 🖥️ Local Testing

The application is currently running locally on:
- **URL:** http://localhost:3001
- **Status:** ✅ Running

### **Test the Application:**

1. **Super Admin Login:**
   - URL: http://localhost:3001/super-admin/login
   - Email: `admin@saas-invoice.com`
   - Password: `SuperAdmin@123`

2. **Seller Login:**
   - URL: http://localhost:3001/seller/login
   - Use your seller credentials

---

## 🌐 Production Deployment

### **Option 1: PM2 (Recommended for Production)**

PM2 is a production process manager for Node.js applications.

#### **Install PM2:**
```bash
npm install -g pm2
```

#### **Create PM2 Ecosystem File:**

Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [{
    name: 'saas-invoices',
    script: 'npm',
    args: 'run start:prod',
    cwd: '/path/to/Saas-Invoices',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

#### **Start with PM2:**
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# View logs
pm2 logs saas-invoices

# Monitor
pm2 monit

# Restart
pm2 restart saas-invoices

# Stop
pm2 stop saas-invoices
```

---

### **Option 2: Systemd Service (Linux)**

Create a systemd service file: `/etc/systemd/system/saas-invoices.service`

```ini
[Unit]
Description=SaaS Invoice Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/Saas-Invoices
Environment="NODE_ENV=production"
Environment="PORT=3001"
ExecStart=/usr/bin/npm run start:prod
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### **Enable and Start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable saas-invoices
sudo systemctl start saas-invoices
sudo systemctl status saas-invoices
```

---

### **Option 3: Docker (Containerized Deployment)**

#### **Create Dockerfile:**

```dockerfile
FROM node:21-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["npm", "run", "start:prod"]
```

#### **Create .dockerignore:**
```
node_modules
.next
.git
.env.local
*.md
```

#### **Build and Run:**
```bash
# Build Docker image
docker build -t saas-invoices:latest .

# Run container
docker run -d \
  --name saas-invoices \
  -p 3001:3001 \
  --env-file .env.production \
  --restart unless-stopped \
  saas-invoices:latest

# View logs
docker logs -f saas-invoices

# Stop container
docker stop saas-invoices

# Start container
docker start saas-invoices
```

---

## 🔧 Nginx Configuration

To serve the application through Nginx with SSL:

### **Create Nginx Config:** `/etc/nginx/sites-available/anjumassociates.com`

```nginx
server {
    listen 80;
    server_name anjumassociates.com www.anjumassociates.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name anjumassociates.com www.anjumassociates.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/anjumassociates.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anjumassociates.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size for file uploads
    client_max_body_size 10M;
}
```

#### **Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/anjumassociates.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d anjumassociates.com -d www.anjumassociates.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## 📁 Environment Variables

Make sure `.env.production` is configured:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dosecswlefagrerrgmsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://invoicefbr.com
PORT=3001
```

---

## 🔄 Deployment Workflow

### **Initial Deployment:**

```bash
# 1. Clone repository on server
git clone <repository-url> /var/www/saas-invoices
cd /var/www/saas-invoices

# 2. Install Node.js 21 using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 21
nvm use 21

# 3. Install dependencies
npm install

# 4. Build application
npm run build

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Update Deployment:**

```bash
# 1. Pull latest changes
cd /var/www/saas-invoices
git pull origin main

# 2. Install new dependencies (if any)
npm install

# 3. Rebuild application
npm run build

# 4. Restart PM2
pm2 restart saas-invoices
```

---

## 📊 Monitoring

### **PM2 Monitoring:**
```bash
# View logs
pm2 logs saas-invoices

# Monitor resources
pm2 monit

# View process info
pm2 info saas-invoices

# View all processes
pm2 list
```

### **Application Health Check:**
```bash
# Check if application is running
curl http://localhost:3001

# Check with SSL
curl https://invoicefbr.com
```

---

## 🐛 Troubleshooting

### **Port Already in Use:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### **Build Errors:**
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### **PM2 Not Starting:**
```bash
# Check PM2 logs
pm2 logs saas-invoices --lines 100

# Restart PM2
pm2 restart saas-invoices

# Delete and recreate
pm2 delete saas-invoices
pm2 start ecosystem.config.js
```

---

## ✅ Post-Deployment Checklist

- [ ] Application builds successfully
- [ ] Application starts on port 3001
- [ ] Super Admin login works
- [ ] Seller login works
- [ ] Database connection works
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] PM2 process manager running
- [ ] PM2 startup script configured
- [ ] Firewall configured (allow 80, 443)
- [ ] DNS pointing to server
- [ ] Monitoring set up

---

## 🎉 Deployment Complete!

Your SaaS Invoice Management System is now ready for production!

**Access URLs:**
- **Production:** https://invoicefbr.com
- **Super Admin:** https://invoicefbr.com/super-admin/login
- **Seller Login:** https://invoicefbr.com/seller/login

**Support:**
- Check logs: `pm2 logs saas-invoices`
- Monitor: `pm2 monit`
- Restart: `pm2 restart saas-invoices`

---

**Built with ❤️ using Next.js 14, TypeScript, and Supabase**

