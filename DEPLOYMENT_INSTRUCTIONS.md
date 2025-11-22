# Deployment Instructions for Blog Updates

## Issue: RSS Feed XML Error

The RSS feed has been fixed to properly escape `&` characters in image URLs.

## Steps to Deploy the Fix

### 1. Rebuild the Application

```bash
npm run build
```

This will:
- Compile the updated RSS route
- Generate static pages
- Apply all code changes

### 2. Restart the Server

```bash
# Stop the current process
pm2 stop all
# or
pkill -f "next start"

# Start the server
npm run start
# or
pm2 start npm --name "invoicefbr" -- start
```

### 3. Clear Server Cache (if using nginx/apache)

**For Nginx:**
```bash
sudo nginx -s reload
```

**For Apache:**
```bash
sudo systemctl reload apache2
```

### 4. Verify the Fix

Visit: https://invoicefbr.com/blog/rss.xml

The XML should now be valid without errors. Look for:
- Properly escaped URLs: `?w=1200&amp;h=630` (not `?w=1200&h=630`)
- No XML parsing errors
- All blog posts listed

### 5. Test with RSS Validator

Visit: https://validator.w3.org/feed/

Enter: `https://invoicefbr.com/blog/rss.xml`

Should show: "This is a valid RSS feed"

## What Was Fixed

### Before (Broken):
```xml
<enclosure url="https://images.unsplash.com/photo-123?w=1200&h=630" type="image/jpeg" />
```
❌ The `&` character causes XML parsing error

### After (Fixed):
```xml
<enclosure url="https://images.unsplash.com/photo-123?w=1200&amp;h=630" type="image/jpeg" />
```
✅ The `&` is properly escaped as `&amp;`

## Files Changed

1. `app/blog/rss.xml/route.ts` - Fixed XML escaping
2. Cache-Control header updated to prevent caching issues

## Troubleshooting

### If RSS still shows error after rebuild:

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

2. **Force refresh:**
   - Chrome/Firefox: Ctrl+F5
   - Mac: Cmd+Shift+R

3. **Check if build completed:**
   ```bash
   ls -la .next/server/app/blog/rss.xml/
   ```
   Should show recent timestamp

4. **Restart with clean cache:**
   ```bash
   rm -rf .next
   npm run build
   npm run start
   ```

5. **Check server logs:**
   ```bash
   pm2 logs
   # or
   tail -f /var/log/nginx/error.log
   ```

## Production Deployment Checklist

- [ ] Code changes committed to git
- [ ] Pull latest code on server
- [ ] Run `npm install` (if dependencies changed)
- [ ] Run `npm run build`
- [ ] Restart application server
- [ ] Clear CDN cache (if using Cloudflare/etc)
- [ ] Test RSS feed URL
- [ ] Validate with W3C Feed Validator
- [ ] Submit updated sitemap to Google Search Console

## Quick Deploy Script

Create a file `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying InvoiceFBR updates..."

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build application
echo "📦 Building application..."
npm run build

# Restart server
echo "🔄 Restarting server..."
pm2 restart invoicefbr

# Clear nginx cache
echo "🧹 Clearing cache..."
sudo nginx -s reload

echo "✅ Deployment complete!"
echo "🔍 Verify at: https://invoicefbr.com/blog/rss.xml"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## After Deployment

1. **Test RSS Feed:**
   - Visit: https://invoicefbr.com/blog/rss.xml
   - Should load without errors
   - All 8 blog posts should be listed

2. **Submit to Google:**
   - Go to Google Search Console
   - Submit: `https://invoicefbr.com/blog/rss.xml`
   - Request indexing

3. **Monitor:**
   - Check server logs for errors
   - Monitor RSS feed readers
   - Verify blog posts are discoverable

## Support

If issues persist after following these steps:
- Check server error logs
- Verify Node.js version (should be 18+)
- Ensure all dependencies are installed
- Contact: info@zazteck.com

---

**Note:** The RSS feed cache has been disabled temporarily (`no-cache`) to ensure immediate updates. After confirming the fix works, you can re-enable caching by changing the Cache-Control header back to `public, max-age=3600`.
