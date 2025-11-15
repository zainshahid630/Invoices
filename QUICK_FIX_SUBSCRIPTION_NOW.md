# 🚀 Quick Fix - Add Subscription NOW

## Your Company ID
`e20e1628-1f33-4a41-981d-c46b4d48ab8f`

---

## ⚡ Fastest Fix (Copy & Paste)

### Option 1: Use Fix API (Recommended)
Open your browser and go to:
```
http://localhost:3000/api/super-admin/fix-subscriptions
```

Then click POST or use curl:
```bash
curl -X POST http://localhost:3000/api/super-admin/fix-subscriptions
```

---

### Option 2: Direct SQL (Supabase Dashboard)

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste this:

```sql
INSERT INTO subscriptions (
  company_id,
  start_date,
  end_date,
  status,
  payment_status,
  amount
) VALUES (
  'e20e1628-1f33-4a41-981d-c46b4d48ab8f',
  NOW(),
  NOW() + INTERVAL '7 days',
  'active',
  'trial',
  0
);
```

3. Click "Run"
4. Done!

---

### Option 3: Fix ALL Companies at Once

```sql
INSERT INTO subscriptions (
  company_id,
  start_date,
  end_date,
  status,
  payment_status,
  amount
)
SELECT 
  c.id,
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

## ✅ Verify It Worked

### Check via API:
```
http://localhost:3000/api/seller/subscription?company_id=e20e1628-1f33-4a41-981d-c46b4d48ab8f
```

Should return:
```json
{
  "success": true,
  "subscription": {
    "company_id": "e20e1628-1f33-4a41-981d-c46b4d48ab8f",
    "status": "active",
    "payment_status": "trial",
    "end_date": "2024-11-22T..."
  }
}
```

### Check via SQL:
```sql
SELECT * FROM subscriptions 
WHERE company_id = 'e20e1628-1f33-4a41-981d-c46b4d48ab8f';
```

---

## 🎯 What Was Fixed

### Problem:
- ❌ Code was trying to insert `plan_name` column
- ❌ But `plan_name` column doesn't exist in database
- ❌ Caused SQL error

### Solution:
- ✅ Removed `plan_name` from all insert statements
- ✅ Subscriptions now insert without plan_name
- ✅ APIs updated: registration, super-admin, fix-subscriptions
- ✅ SQL scripts updated

### Optional Enhancement:
If you want to add `plan_name` column later, run:
```sql
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50) DEFAULT 'Trial';
```

---

## 📝 Files Updated

1. ✅ `app/api/register/route.ts` - Removed plan_name
2. ✅ `app/api/super-admin/companies/route.ts` - Removed plan_name
3. ✅ `app/api/super-admin/fix-subscriptions/route.ts` - Removed plan_name
4. ✅ `database/MANUALLY_ADD_TRIAL_SUBSCRIPTION.sql` - Removed plan_name
5. ✅ `database/ADD_PLAN_NAME_TO_SUBSCRIPTIONS.sql` - NEW (optional migration)

---

## 🚀 Next Steps

1. **Run the fix** (Option 1 or 2 above)
2. **Refresh your browser**
3. **Login again** if needed
4. **Check dashboard** - subscription should show!

---

**Status:** ✅ READY TO FIX
**Time to Fix:** < 1 minute
**Difficulty:** Easy - Just copy & paste!
