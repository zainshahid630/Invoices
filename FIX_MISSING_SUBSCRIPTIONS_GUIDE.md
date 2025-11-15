# 🔧 Fix Missing Subscriptions Guide

## Problem
Company created but subscription is null/not showing on frontend.

## Company ID
`e20e1628-1f33-4a41-981d-c46b4d48ab8f`

---

## 🚀 Quick Fix Options

### Option 1: Use API Endpoint (Recommended)

#### Step 1: Check which companies are missing subscriptions
```bash
GET http://localhost:3000/api/super-admin/fix-subscriptions
```

Or in browser:
```
http://localhost:3000/api/super-admin/fix-subscriptions
```

#### Step 2: Fix all missing subscriptions automatically
```bash
POST http://localhost:3000/api/super-admin/fix-subscriptions
```

Using curl:
```bash
curl -X POST http://localhost:3000/api/super-admin/fix-subscriptions
```

This will:
- ✅ Check all companies
- ✅ Create 7-day trial for companies without subscription
- ✅ Skip companies that already have subscriptions
- ✅ Return summary of what was fixed

---

### Option 2: Manual SQL (Direct Database)

#### For Specific Company:
```sql
-- Add subscription for your company
INSERT INTO subscriptions (
  company_id,
  plan_name,
  start_date,
  end_date,
  status,
  payment_status,
  amount
) VALUES (
  'e20e1628-1f33-4a41-981d-c46b4d48ab8f',
  'Trial',
  NOW(),
  NOW() + INTERVAL '7 days',
  'active',
  'trial',
  0
);
```

#### For All Companies Missing Subscriptions:
```sql
-- Fix all companies at once
INSERT INTO subscriptions (
  company_id,
  plan_name,
  start_date,
  end_date,
  status,
  payment_status,
  amount
)
SELECT 
  c.id,
  'Trial',
  NOW(),
  NOW() + INTERVAL '7 days',
  'active',
  'trial',
  0
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
WHERE s.id IS NULL;
```

---

### Option 3: Using Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run this query:
```sql
INSERT INTO subscriptions (
  company_id,
  plan_name,
  start_date,
  end_date,
  status,
  payment_status,
  amount
) VALUES (
  'e20e1628-1f33-4a41-981d-c46b4d48ab8f',
  'Trial',
  NOW(),
  NOW() + INTERVAL '7 days',
  'active',
  'trial',
  0
);
```

---

## 🔍 Verification

### Check if subscription was created:

#### Via API:
```
GET http://localhost:3000/api/seller/subscription?company_id=e20e1628-1f33-4a41-981d-c46b4d48ab8f
```

Should return:
```json
{
  "success": true,
  "subscription": {
    "id": "...",
    "company_id": "e20e1628-1f33-4a41-981d-c46b4d48ab8f",
    "plan_name": "Trial",
    "status": "active",
    "payment_status": "trial",
    "start_date": "2024-11-15T...",
    "end_date": "2024-11-22T...",
    "amount": 0
  }
}
```

#### Via SQL:
```sql
SELECT * FROM subscriptions 
WHERE company_id = 'e20e1628-1f33-4a41-981d-c46b4d48ab8f';
```

#### Via Frontend:
1. Login to the company account
2. Check dashboard header
3. Should see trial badge with days remaining

---

## 🐛 Why Did This Happen?

### Possible Causes:
1. ❌ Company was created before subscription code was added
2. ❌ Error during company creation (subscription insert failed)
3. ❌ Database transaction rolled back
4. ❌ Supabase permissions issue
5. ❌ Code was updated but existing companies not migrated

### Prevention:
- ✅ Code now includes subscription creation
- ✅ Both registration and super-admin APIs create subscriptions
- ✅ Use fix-subscriptions API for existing companies

---

## 📊 Check All Companies

### See which companies need fixing:
```sql
SELECT 
  c.id,
  c.name,
  c.business_name,
  c.created_at,
  CASE 
    WHEN s.id IS NULL THEN '❌ Missing'
    ELSE '✅ Has Subscription'
  END as subscription_status,
  s.plan_name,
  s.status,
  s.end_date
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
ORDER BY c.created_at DESC;
```

---

## 🔄 After Fix

### What to do after adding subscription:

1. **Refresh Frontend**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear browser cache
   - Logout and login again

2. **Verify Display**
   - Check dashboard header for trial badge
   - Check subscription info component
   - Verify days remaining calculation

3. **Test Features**
   - Try creating an invoice
   - Check if all features are accessible
   - Verify FBR integration works

---

## 📝 Files Created

### New Files:
1. ✅ `app/api/super-admin/fix-subscriptions/route.ts` - API to fix subscriptions
2. ✅ `database/CHECK_SUBSCRIPTION_FOR_COMPANY.sql` - Check queries
3. ✅ `database/MANUALLY_ADD_TRIAL_SUBSCRIPTION.sql` - Manual fix queries
4. ✅ `FIX_MISSING_SUBSCRIPTIONS_GUIDE.md` - This guide

---

## 🎯 Recommended Action

### For Your Specific Case:

**Quickest Solution:**
```bash
# Run this in your terminal or browser
curl -X POST http://localhost:3000/api/super-admin/fix-subscriptions
```

Or visit in browser:
```
http://localhost:3000/api/super-admin/fix-subscriptions
```

Then refresh your frontend and the subscription should appear!

---

## 🚨 If Still Not Working

### Debug Steps:

1. **Check API Response:**
```bash
curl http://localhost:3000/api/seller/subscription?company_id=e20e1628-1f33-4a41-981d-c46b4d48ab8f
```

2. **Check Database Directly:**
```sql
SELECT * FROM subscriptions WHERE company_id = 'e20e1628-1f33-4a41-981d-c46b4d48ab8f';
```

3. **Check Frontend Console:**
- Open browser DevTools (F12)
- Check Console for errors
- Check Network tab for API calls

4. **Check Supabase Logs:**
- Go to Supabase Dashboard
- Check Logs section
- Look for errors

---

## ✨ Summary

**Problem:** Company created without subscription
**Solution:** Use fix-subscriptions API or manual SQL
**Prevention:** Code updated to always create subscriptions
**Status:** Ready to fix

Run the fix-subscriptions API and your subscription will be created! 🚀

---

**Created:** November 15, 2024
**Company ID:** e20e1628-1f33-4a41-981d-c46b4d48ab8f
**Issue:** Missing subscription
**Fix:** Available via API or SQL
