# Google Analytics Setup Guide

## ✅ Implementation Complete

Google Analytics has been integrated into your Next.js app. Follow these steps to activate it:

---

## Step 1: Get Your Measurement ID

1. Go to: https://analytics.google.com/
2. Click **Admin** (gear icon, bottom left)
3. Click **Create Property**
4. Fill in:
   - Property name: `InvoiceFBR`
   - Reporting time zone: `(GMT+05:00) Pakistan Time`
   - Currency: `Pakistani Rupee (PKR)`
5. Click **Next** → Choose your business details → Click **Create**
6. Select **Web** platform
7. Set up data stream:
   - Website URL: `https://invoicefbr.com`
   - Stream name: `InvoiceFBR Website`
   - Enable **Enhanced measurement** (recommended)
8. Click **Create stream**
9. **Copy your Measurement ID** (looks like `G-XXXXXXXXXX`)

---

## Step 2: Add Measurement ID to Environment Variables

Replace `G-XXXXXXXXXX` with your actual Measurement ID in:

### Local Development (`.env.local`):
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Production (`.env.production`):
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important:** Also add this to your hosting platform's environment variables (Vercel/Netlify/etc.)

---

## Step 3: Deploy to Production

1. Commit your changes:
```bash
git add .
git commit -m "Add Google Analytics tracking"
git push
```

2. Add the environment variable to your hosting platform
3. Redeploy your site

---

## Step 4: Verify It's Working

1. Visit your live site: https://invoicefbr.com
2. Go to Google Analytics → **Reports** → **Realtime**
3. You should see yourself as an active user!

---

## What Gets Tracked Automatically

With the current setup, Google Analytics will automatically track:

- ✅ Page views
- ✅ User sessions
- ✅ Traffic sources
- ✅ Device types (mobile/desktop)
- ✅ Geographic location
- ✅ Bounce rate
- ✅ Session duration

### Enhanced Measurement (if enabled):
- Scrolls
- Outbound clicks
- Site search
- Video engagement
- File downloads

---

## Custom Event Tracking (Optional)

You can track custom events using the helper functions in `lib/google-analytics.tsx`:

### Track Button Clicks:
```typescript
import { trackEvent } from '@/lib/google-analytics'

// Example: Track "Start Free Trial" button
trackEvent('click', 'CTA', 'Start Free Trial')
```

### Track Conversions:
```typescript
import { trackConversion } from '@/lib/google-analytics'

// Example: Track successful registration
trackConversion('registration_complete', 1000)
```

### Track Custom Page Views:
```typescript
import { trackPageView } from '@/lib/google-analytics'

// Example: Track SPA navigation
trackPageView('/seller/invoices')
```

---

## Recommended Events to Track

Add these to your key pages for better insights:

### Homepage (`app/page.tsx`):
```typescript
// Track CTA clicks
<button onClick={() => {
  trackEvent('click', 'CTA', 'Start Free Trial')
  // ... your existing code
}}>
  Start Free Trial
</button>
```

### Registration Page (`app/register/page.tsx`):
```typescript
// Track successful registration
trackConversion('registration_complete')
trackEvent('signup', 'User', 'New Registration')
```

### Invoice Creation (`app/seller/invoices/new/page.tsx`):
```typescript
// Track invoice creation
trackEvent('create', 'Invoice', 'New Invoice Created')
```

### FBR Posting (`app/api/seller/invoices/[id]/post-fbr/route.ts`):
```typescript
// Track successful FBR posting
trackEvent('submit', 'FBR', 'Invoice Posted to FBR')
```

---

## Important Notes

1. **Privacy Compliance:**
   - Google Analytics is GDPR/privacy-compliant by default
   - Consider adding a cookie consent banner if targeting EU users
   - Current setup respects "Do Not Track" browser settings

2. **Performance:**
   - Scripts load with `strategy="afterInteractive"` (won't block page load)
   - Minimal impact on site performance

3. **Data Retention:**
   - Default: 14 months
   - Can be adjusted in GA settings

4. **Testing:**
   - Use Google Analytics Debugger Chrome extension
   - Check Real-time reports to verify tracking

---

## Troubleshooting

### Not seeing data in Google Analytics?

1. **Check environment variable:**
   ```bash
   echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
   ```

2. **Verify in browser console:**
   - Open DevTools → Console
   - Type: `window.gtag`
   - Should show a function (not undefined)

3. **Check Network tab:**
   - Look for requests to `google-analytics.com`
   - Should see `collect` and `gtag/js` requests

4. **Ad blockers:**
   - Disable ad blockers when testing
   - They often block GA scripts

### Data looks incorrect?

- Wait 24-48 hours for accurate data
- Real-time reports show immediate data
- Standard reports have a delay

---

## Next Steps

1. ✅ Set up Google Analytics property
2. ✅ Add Measurement ID to environment variables
3. ✅ Deploy to production
4. ⏳ Wait 24 hours for initial data
5. 📊 Set up custom dashboards
6. 🎯 Create conversion goals
7. 📧 Set up email reports

---

## Useful Resources

- [Google Analytics Dashboard](https://analytics.google.com/)
- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Next.js Analytics Guide](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)

---

**Questions?** Check the [Google Analytics Help Center](https://support.google.com/analytics/)
