# Testing Subscription Feature

## Access Restriction

The subscription feature is currently restricted to **testing accounts only**.

### Who Can Access?
Only sellers with **NTN: 090078601** can access the subscription page.

### What Happens for Other Users?
- Subscription link is **hidden** in the navigation menu
- If they try to access `/seller/subscription` directly, they will see:
  - "Access Restricted" message
  - Automatic redirect to dashboard after 3 seconds

## Testing Steps

### 1. Login with Test Account
Make sure you're logged in with a seller account that has:
- **NTN:** 090078601

### 2. Access Subscription Page
Two ways to access:
1. Click **"Subscription"** link in the sidebar (💳 icon)
2. Navigate directly to: `http://localhost:3000/seller/subscription`

### 3. Test Subscription Payment

#### Step-by-Step:
1. You'll see a **blue testing badge** at the top indicating testing mode
2. View the three subscription plans:
   - **Basic:** PKR 2,000/month
   - **Professional:** PKR 5,000/month (Most Popular)
   - **Enterprise:** PKR 10,000/month

3. Click **"Subscribe Now"** on any plan

4. Payment window opens in **new tab**

5. Use JazzCash test credentials:
   ```
   Card Number: 4111 1111 1111 1111
   Expiry Date: 12/25 (any future date)
   CVV: 123 (any 3 digits)
   ```

6. Complete the payment

7. You'll be redirected to success page

8. Subscription should be activated

## Verification

### Check Access
```javascript
// In browser console
const session = JSON.parse(localStorage.getItem('seller_session'));
console.log('NTN:', session.company.ntn);
// Should show: 090078601
```

### Check Navigation
- Login with test account → Subscription link visible ✅
- Login with other account → Subscription link hidden ✅

### Check Direct Access
- Test account accessing `/seller/subscription` → Page loads ✅
- Other account accessing `/seller/subscription` → Redirected to dashboard ✅

## Test Scenarios

### Scenario 1: Successful Subscription
1. Login with NTN 090078601
2. Go to Subscription page
3. Select Professional plan (PKR 5,000)
4. Complete payment with test card
5. **Expected:** Payment successful, subscription activated

### Scenario 2: Access Denied
1. Login with different NTN (not 090078601)
2. Try to access `/seller/subscription`
3. **Expected:** "Access Restricted" message, redirect to dashboard

### Scenario 3: Navigation Visibility
1. Login with NTN 090078601
2. **Expected:** Subscription link visible in sidebar
3. Logout and login with different NTN
4. **Expected:** Subscription link NOT visible in sidebar

### Scenario 4: Payment Cancellation
1. Login with NTN 090078601
2. Go to Subscription page
3. Select any plan
4. Cancel payment on JazzCash page
5. **Expected:** Redirected to failed page, subscription not activated

## Environment Setup

### Required Environment Variables
```env
JAZZCASH_MERCHANT_ID=MC478733
JAZZCASH_PASSWORD=s3184uvwzv
JAZZCASH_INTEGRITY_SALT=2531t08v20
JAZZCASH_RETURN_URL=http://localhost:3000/api/jazzcash/callback
JAZZCASH_IPN_URL=http://localhost:3000/api/jazzcash/ipn
JAZZCASH_ENVIRONMENT=sandbox
```

### Database Requirements
Make sure the `companies` table has the `ntn` column:
```sql
-- Check if NTN column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND column_name = 'ntn';

-- If not exists, add it
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS ntn VARCHAR(50);

-- Update test company
UPDATE companies 
SET ntn = '090078601' 
WHERE id = 'your-test-company-id';
```

## Troubleshooting

### Issue: Subscription Link Not Showing
**Solution:**
1. Check if logged in user's company has NTN: 090078601
2. Verify in browser console:
   ```javascript
   const session = JSON.parse(localStorage.getItem('seller_session'));
   console.log(session.company.ntn);
   ```
3. If NTN is missing or different, update in database

### Issue: Access Denied Even with Correct NTN
**Solution:**
1. Clear browser cache and localStorage
2. Logout and login again
3. Check if company data is properly loaded in session

### Issue: Payment Window Not Opening
**Solution:**
1. Check browser pop-up blocker
2. Allow pop-ups for localhost:3000
3. Try different browser

### Issue: Payment Fails
**Solution:**
1. Verify JazzCash credentials in `.env.local`
2. Check if using sandbox environment
3. Use correct test card: 4111 1111 1111 1111
4. Check browser console for errors

## Removing Test Restriction

When ready to enable for all users, remove the NTN check:

### In `app/seller/subscription/page.tsx`:
```typescript
// Remove this check:
if (userData.company?.ntn !== '090078601') {
  setAccessDenied(true);
  setTimeout(() => {
    router.push('/seller/dashboard');
  }, 3000);
  return;
}
```

### In `app/seller/components/SellerLayout.tsx`:
```typescript
// Change this:
const hasSubscriptionAccess = user.company?.ntn === '090078601';

// To this:
const hasSubscriptionAccess = true; // Enable for all users
```

## Production Checklist

Before enabling in production:
- [ ] Test all payment scenarios
- [ ] Verify IPN callback works
- [ ] Test subscription activation
- [ ] Test auto-renewal (if implemented)
- [ ] Update JazzCash credentials to production
- [ ] Change environment to 'production'
- [ ] Update return URL to production domain
- [ ] Test with real payment (small amount)
- [ ] Remove testing badge from UI
- [ ] Enable for all users (remove NTN restriction)

## Support

If you encounter issues during testing:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify JazzCash sandbox is working
4. Contact JazzCash support: business@jazzcash.com.pk

## Notes

- This is a **testing restriction only**
- In production, all sellers should have access
- The restriction is implemented at both:
  - Navigation level (link visibility)
  - Page level (access control)
- Testing badge is shown to indicate testing mode
