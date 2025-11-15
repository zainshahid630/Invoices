# Testing Subscription Display - Quick Guide

## Prerequisites
1. Super admin account created
2. At least one company created
3. At least one seller user for that company

## Test Steps

### Test 1: Create Active Subscription
1. Login as super admin
2. Go to Super Admin Dashboard
3. Click "Subscription" for a company
4. Create subscription:
   - Start Date: Today
   - End Date: 1 year from today
   - Amount: 12000
   - Status: Active
   - Payment Status: Paid
5. Click "Create Subscription"

**Expected Result:**
- Subscription created successfully
- Redirects back to subscription page showing details

### Test 2: View on Seller Dashboard
1. Logout from super admin
2. Login as seller (user of the company)
3. Go to Dashboard

**Expected Result:**
- Green subscription info card appears at top
- Shows "Active" and "Paid" badges
- Shows "Valid until [date]"
- Click "▼ Details" to expand
- Shows Start Date, End Date, Amount
- Click "▲ Hide" to collapse

### Test 3: View on Seller Settings
1. While logged in as seller
2. Go to Settings page

**Expected Result:**
- Same subscription info card appears
- Same functionality as dashboard

### Test 4: Test Expiring Soon Warning
1. Login as super admin
2. Edit the subscription
3. Change End Date to 25 days from today
4. Save changes
5. Login as seller
6. Go to Dashboard

**Expected Result:**
- Yellow/orange background on subscription card
- Shows "⏰ Expires in 25 days"
- Still shows "Active" status

### Test 5: Test Expired Subscription
1. Login as super admin
2. Edit the subscription
3. Change End Date to yesterday
4. Change Status to "Expired"
5. Save changes
6. Login as seller
7. Go to Dashboard

**Expected Result:**
- Red background on subscription card
- Shows "⚠️ Subscription expired"
- Shows "Expired" badge

### Test 6: Test No Subscription
1. Login as super admin
2. Create a new company without subscription
3. Create a user for that company
4. Login as that user
5. Go to Dashboard

**Expected Result:**
- No subscription card appears
- Dashboard looks normal
- No errors in console
- User can access all features

### Test 7: Test Payment Status
1. Login as super admin
2. Edit subscription
3. Change Payment Status to "Pending"
4. Save
5. Login as seller
6. Check dashboard

**Expected Result:**
- Shows "Pending" badge in yellow

Repeat with "Overdue":
**Expected Result:**
- Shows "Overdue" badge in red

### Test 8: Test Expand/Collapse
1. Login as seller
2. Go to Dashboard
3. Click "▼ Details"

**Expected Result:**
- Card expands smoothly
- Shows 3 columns: Start Date, End Date, Amount
- Button changes to "▲ Hide"

4. Click "▲ Hide"

**Expected Result:**
- Card collapses smoothly
- Shows compact view
- Button changes to "▼ Details"

### Test 9: Test Mobile Responsive
1. Login as seller
2. Open browser dev tools
3. Switch to mobile view (375px width)
4. Go to Dashboard

**Expected Result:**
- Subscription card is full width
- Expand to see details
- Details stack vertically (1 column)
- All text is readable
- Buttons are touch-friendly

### Test 10: Test Multiple Companies
1. Create 3 companies with different subscriptions:
   - Company A: Active, Paid, expires in 6 months
   - Company B: Active, Pending, expires in 20 days
   - Company C: Expired, Overdue
2. Create users for each company
3. Login as each user

**Expected Result:**
- Each user sees only their company's subscription
- Correct status and colors for each
- No data leakage between companies

## SQL Queries for Testing

### Create Test Subscription (Active)
```sql
INSERT INTO subscriptions (
  company_id,
  start_date,
  end_date,
  amount,
  status,
  payment_status
) VALUES (
  'YOUR_COMPANY_ID',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  12000.00,
  'active',
  'paid'
);
```

### Create Test Subscription (Expiring Soon)
```sql
INSERT INTO subscriptions (
  company_id,
  start_date,
  end_date,
  amount,
  status,
  payment_status
) VALUES (
  'YOUR_COMPANY_ID',
  CURRENT_DATE - INTERVAL '11 months',
  CURRENT_DATE + INTERVAL '25 days',
  12000.00,
  'active',
  'pending'
);
```

### Create Test Subscription (Expired)
```sql
INSERT INTO subscriptions (
  company_id,
  start_date,
  end_date,
  amount,
  status,
  payment_status
) VALUES (
  'YOUR_COMPANY_ID',
  CURRENT_DATE - INTERVAL '1 year',
  CURRENT_DATE - INTERVAL '1 day',
  12000.00,
  'expired',
  'overdue'
);
```

### Check Subscription for Company
```sql
SELECT 
  s.*,
  c.name as company_name,
  c.business_name
FROM subscriptions s
JOIN companies c ON s.company_id = c.id
WHERE c.id = 'YOUR_COMPANY_ID'
ORDER BY s.created_at DESC
LIMIT 1;
```

### Update Subscription Status
```sql
UPDATE subscriptions
SET 
  status = 'expired',
  payment_status = 'overdue',
  end_date = CURRENT_DATE - INTERVAL '1 day'
WHERE company_id = 'YOUR_COMPANY_ID';
```

## Common Issues & Solutions

### Issue: Subscription not showing
**Solution:**
1. Check if subscription exists in database
2. Check company_id matches
3. Check browser console for errors
4. Verify seller_session in localStorage has company_id

### Issue: Wrong company's subscription showing
**Solution:**
1. Clear localStorage
2. Logout and login again
3. Verify company_id in session

### Issue: Dates not calculating correctly
**Solution:**
1. Check server timezone
2. Verify date format in database
3. Check browser timezone

### Issue: Component not expanding
**Solution:**
1. Check browser console for errors
2. Verify React state is updating
3. Check CSS classes are applied

## Browser Console Commands

### Check Session
```javascript
console.log(JSON.parse(localStorage.getItem('seller_session')));
```

### Check Company ID
```javascript
const session = JSON.parse(localStorage.getItem('seller_session'));
console.log('Company ID:', session.company_id);
```

### Test API Call
```javascript
const session = JSON.parse(localStorage.getItem('seller_session'));
fetch(`/api/seller/subscription?company_id=${session.company_id}`)
  .then(r => r.json())
  .then(d => console.log('Subscription:', d));
```

## Success Criteria

✅ Subscription displays correctly for active subscriptions
✅ Warning shows for expiring subscriptions (≤30 days)
✅ Alert shows for expired subscriptions
✅ No display when no subscription exists
✅ Expand/collapse works smoothly
✅ Mobile responsive
✅ No blocking of user access
✅ Correct colors for all statuses
✅ Data isolation between companies
✅ No console errors

## Performance Checks

- Component loads in <500ms
- No unnecessary re-renders
- API call happens only once per page load
- No memory leaks
- Smooth animations

## Accessibility Checks

- Keyboard navigation works
- Screen reader announces status
- Color contrast is sufficient
- Focus indicators visible
- Touch targets are 44x44px minimum

---

**Note:** This is a non-blocking feature. Even if subscription is expired, users should still be able to access all features. The display is purely informational.
