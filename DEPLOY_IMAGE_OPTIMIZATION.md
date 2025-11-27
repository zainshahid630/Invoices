# Deploy Image Optimization Changes

## Quick Deploy (Recommended)

### Option 1: Using Git (Easiest)

```bash
# 1. Commit and push changes
git add app/how-it-works/page.tsx next.config.js
git commit -m "Optimize image loading on how-it-works page"
git push origin main

# 2. SSH into server
ssh root@167.71.232.76

# 3. Pull changes and rebuild
cd /root/invoicefbr
git pull origin main
npm install
npm run build
pm2 restart invoicefbr

# 4. Verify
pm2 logs invoicefbr --lines 50
```

### Option 2: Manual File Upload

```bash
# 1. Upload files using SCP
scp app/how-it-works/page.tsx root@167.71.232.76:/root/invoicefbr/app/how-it-works/page.tsx
scp next.config.js root@167.71.232.76:/root/invoicefbr/next.config.js

# 2. SSH into server and rebuild
ssh root@167.71.232.76

cd /root/invoicefbr
npm install
npm run build
pm2 restart invoicefbr
pm2 logs invoicefbr --lines 50
```

### Option 3: Using the Deployment Script

```bash
# Make sure you have SSH key access configured
./deploy-image-optimization.sh
```

## What Was Changed

### Files Modified:
1. **app/how-it-works/page.tsx**
   - Added shimmer effect for smooth image loading
   - Priority loading for first 2 images in each section
   - Improved image quality (75 → 85)
   - Better blur placeholders

2. **next.config.js**
   - Increased image cache TTL (60s → 1 year)
   - Ensured image optimization is enabled

## Verify Deployment

After deployment, test the changes:

1. **Visit the page:**
   ```
   https://invoicefbr.com/how-it-works
   ```

2. **Clear browser cache:**
   - Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Firefox: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

3. **Check image loading:**
   - You should see a shimmer effect while images load
   - First 2 images in each section load immediately
   - Other images lazy-load as you scroll
   - On refresh, images load instantly from cache

4. **Monitor server logs:**
   ```bash
   ssh root@167.71.232.76
   pm2 logs invoicefbr
   ```

## Performance Improvements

### Before:
- Images showed blank space while loading
- All images lazy-loaded (even above-the-fold)
- Quality: 75
- Cache: 60 seconds

### After:
- Shimmer effect shows loading progress
- First 2 images per section load immediately
- Quality: 85 (better visuals)
- Cache: 1 year (instant subsequent loads)

## Troubleshooting

### If build fails:
```bash
ssh root@167.71.232.76
cd /root/invoicefbr
npm install --force
npm run build
pm2 restart invoicefbr
```

### If images don't show shimmer:
- Clear browser cache completely
- Check browser console for errors
- Verify files were uploaded correctly

### If PM2 doesn't restart:
```bash
pm2 delete invoicefbr
pm2 start ecosystem.config.js
```

## Rollback (If Needed)

If something goes wrong:

```bash
ssh root@167.71.232.76
cd /root/invoicefbr
git log --oneline -5  # Find previous commit
git reset --hard <previous-commit-hash>
npm run build
pm2 restart invoicefbr
```

## Next Steps

After successful deployment:

1. Test on different devices (mobile, tablet, desktop)
2. Check page load speed using Google PageSpeed Insights
3. Monitor server performance with `pm2 monit`
4. Consider adding more optimizations if needed

## Support

If you encounter issues:
- Check PM2 logs: `pm2 logs invoicefbr`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Check system resources: `htop` or `pm2 monit`
