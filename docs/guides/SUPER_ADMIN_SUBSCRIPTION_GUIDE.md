# Super Admin - Subscription Management Guide

## Overview
As a super admin, you can create and manage subscriptions for all companies. This guide shows you how to manage subscriptions effectively.

## Accessing Subscription Management

### Method 1: From Dashboard
1. Login to Super Admin Dashboard
2. Find the company in the companies table
3. Click "Subscription" link in the Actions column
4. You'll be taken to the subscription management page

### Method 2: From Company Details
1. Login to Super Admin Dashboard
2. Click "View" for a company
3. Click "Manage Subscription" button
4. You'll be taken to the subscription management page

## Creating a New Subscription

### Step 1: Navigate to Subscription Page
- Go to: `/super-admin/companies/[company-id]/subscription`

### Step 2: Fill in Subscription Details

**Start Date** (Required)
- The date when the subscription begins
- Usually set to today or the contract start date
- Format: YYYY-MM-DD

**End Date** (Required)
- The date when the subscription expires
- Typically 1 year from start date
- Format: YYYY-MM-DD

**Amount** (Required)
- The subscription fee in PKR
- Enter as decimal: 12000.00
- This is the total amount for the subscription period

**Status** (Required)
- **Active:** Subscription is currently valid
- **Expired:** Subscription has ended
- **Cancelled:** Subscription was terminated early

**Payment Status** (Required)
- **Paid:** Payment has been received
- **Pending:** Waiting for payment
- **Overdue:** Payment is late

### Step 3: Save
- Click "Create Subscription"
- Subscription is created immediately
- Seller will see it on their dashboard

## Editing an Existing Subscription

### Step 1: Navigate to Subscription Page
- Go to company's subscription page
- You'll see the current subscription details

### Step 2: Click Edit
- Click the "Edit" button
- Form becomes editable

### Step 3: Update Details
- Modify any fields as needed
- Common updates:
  - Extend end date (renewal)
  - Change payment status (after payment received)
  - Update status (expire or cancel)

### Step 4: Save Changes
- Click "Update Subscription"
- Changes are saved immediately
- Seller sees updated info instantly

## Common Subscription Scenarios

### Scenario 1: New Company Onboarding
```
Start Date: Today
End Date: Today + 1 year
Amount: 12000.00
Status: Active
Payment Status: Pending
```
**Use Case:** New company signs up, payment expected soon

### Scenario 2: Paid Annual Subscription
```
Start Date: Today
End Date: Today + 1 year
Amount: 12000.00
Status: Active
Payment Status: Paid
```
**Use Case:** Company paid upfront for the year

### Scenario 3: Renewal
```
Start Date: Old End Date
End Date: Old End Date + 1 year
Amount: 12000.00
Status: Active
Payment Status: Pending
```
**Use Case:** Renewing an existing subscription

### Scenario 4: Trial Period
```
Start Date: Today
End Date: Today + 30 days
Amount: 0.00
Status: Active
Payment Status: Paid
```
**Use Case:** Free trial for 30 days

### Scenario 5: Payment Received
```
(Keep all other fields same)
Payment Status: Paid
```
**Use Case:** Company paid their pending invoice

### Scenario 6: Subscription Expired
```
(Keep all other fields same)
Status: Expired
Payment Status: Overdue (if not paid)
```
**Use Case:** Subscription period ended

### Scenario 7: Early Cancellation
```
End Date: Today
Status: Cancelled
Payment Status: (depends on refund policy)
```
**Use Case:** Company wants to cancel early

## Subscription Pricing Examples

### Basic Plan
```
Amount: 8000.00 PKR/year
Features: Basic invoicing, up to 100 invoices/month
```

### Professional Plan
```
Amount: 12000.00 PKR/year
Features: Unlimited invoices, FBR integration, templates
```

### Enterprise Plan
```
Amount: 20000.00 PKR/year
Features: Everything + WhatsApp, Email, Priority support
```

## Monitoring Subscriptions

### Dashboard View
The super admin dashboard shows:
- Total companies
- Active companies
- Inactive companies

### Subscription Status Check
To see all subscriptions:
```sql
SELECT 
  c.name as company_name,
  c.business_name,
  s.start_date,
  s.end_date,
  s.amount,
  s.status,
  s.payment_status,
  CASE 
    WHEN s.end_date < CURRENT_DATE THEN 'EXPIRED'
    WHEN s.end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING SOON'
    ELSE 'ACTIVE'
  END as subscription_health
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
ORDER BY s.end_date ASC;
```

### Companies Without Subscriptions
```sql
SELECT 
  c.id,
  c.name,
  c.business_name,
  c.created_at
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id
WHERE s.id IS NULL
ORDER BY c.created_at DESC;
```

### Expiring Subscriptions (Next 30 Days)
```sql
SELECT 
  c.name as company_name,
  c.email,
  s.end_date,
  s.payment_status,
  (s.end_date - CURRENT_DATE) as days_remaining
FROM companies c
JOIN subscriptions s ON c.id = s.company_id
WHERE s.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND s.status = 'active'
ORDER BY s.end_date ASC;
```

### Overdue Payments
```sql
SELECT 
  c.name as company_name,
  c.email,
  c.phone,
  s.amount,
  s.end_date,
  s.payment_status
FROM companies c
JOIN subscriptions s ON c.id = s.company_id
WHERE s.payment_status IN ('pending', 'overdue')
  AND s.status = 'active'
ORDER BY s.end_date ASC;
```

## Best Practices

### 1. Regular Monitoring
- Check expiring subscriptions weekly
- Follow up on pending payments
- Update statuses promptly

### 2. Communication
- Notify companies 30 days before expiration
- Send payment reminders
- Confirm renewals

### 3. Record Keeping
- Keep accurate payment records
- Document subscription changes
- Track renewal dates

### 4. Pricing Consistency
- Use standard pricing tiers
- Document any discounts
- Keep amount field accurate

### 5. Status Management
- Update status when subscription expires
- Mark as cancelled if company requests
- Keep payment status current

## Automation Ideas (Future)

### Email Notifications
- 30 days before expiration
- 7 days before expiration
- On expiration day
- Payment received confirmation

### Auto-Expiration
- Cron job to update status to 'expired' when end_date passes
- Auto-update payment_status to 'overdue' if not paid

### Renewal Reminders
- Dashboard widget showing expiring subscriptions
- Email to super admin with weekly summary

### Payment Integration
- Link to payment gateway
- Auto-update payment_status on successful payment

## Troubleshooting

### Issue: Seller not seeing subscription
**Check:**
1. Subscription exists in database
2. company_id matches
3. Seller is logged in correctly
4. Browser cache cleared

### Issue: Wrong dates showing
**Check:**
1. Date format in database
2. Timezone settings
3. Browser timezone

### Issue: Can't create subscription
**Check:**
1. All required fields filled
2. End date is after start date
3. Amount is positive number
4. Company exists

## Support Workflow

### When Company Contacts About Subscription

1. **Verify Identity**
   - Confirm company name
   - Verify contact details

2. **Check Current Status**
   - Look up subscription in dashboard
   - Note current status and payment status

3. **Address Issue**
   - Payment not received? Check payment status
   - Expired? Offer renewal
   - Need extension? Update end date

4. **Update Records**
   - Make necessary changes
   - Confirm with company
   - Document the interaction

5. **Follow Up**
   - Verify company sees updated info
   - Confirm satisfaction
   - Schedule next check-in if needed

## Quick Reference

### URLs
- Dashboard: `/super-admin/dashboard`
- Company List: `/super-admin/dashboard`
- Subscription: `/super-admin/companies/[id]/subscription`
- Company Details: `/super-admin/companies/[id]`

### API Endpoints
- GET subscription: `/api/super-admin/companies/[id]/subscription`
- POST create: `/api/super-admin/companies/[id]/subscription`
- PATCH update: `/api/super-admin/companies/[id]/subscription/[subscriptionId]`

### Database Table
- Table: `subscriptions`
- Foreign Key: `company_id` → `companies.id`
- Cascade: ON DELETE CASCADE

---

**Remember:** Subscription display is non-blocking. Even expired subscriptions don't prevent sellers from using the system. It's purely informational for now.
