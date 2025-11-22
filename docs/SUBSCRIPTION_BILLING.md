# Subscription & Billing System

## Overview
This document explains how the subscription billing system works for collecting platform fees from sellers using JazzCash payment gateway.

## Purpose
The JazzCash integration is used to collect **subscription fees** from sellers who use your platform. This is separate from their business transactions (invoices, customer payments, etc.).

## How It Works

### 1. Subscription Plans
Sellers can choose from different subscription tiers:
- **Basic**: PKR 2,000/month - For small businesses
- **Professional**: PKR 5,000/month - For growing businesses (Most Popular)
- **Enterprise**: PKR 10,000/month - For large businesses

### 2. Payment Flow
1. Seller navigates to **Subscription** page in their dashboard
2. Selects a subscription plan
3. Clicks "Subscribe Now"
4. Payment opens in new tab via JazzCash
5. Seller completes payment using:
   - Credit/Debit Card
   - JazzCash Mobile Wallet
   - Bank Account
   - Over The Counter (OTC)
6. Payment confirmation received
7. Subscription activated

### 3. Payment Processing
```typescript
// When seller subscribes
await processJazzCashPayment({
  amount: plan.price,                           // e.g., 5000 PKR
  billReference: `SUB-${companyId}-${timestamp}`, // Unique reference
  description: `Professional Plan Subscription - monthly`,
  customerEmail: seller.email,
  customerMobile: seller.phone
});
```

## File Structure

```
app/
├── seller/
│   ├── subscription/
│   │   └── page.tsx              # Subscription plans & payment
│   └── payments/
│       └── page.tsx              # Business payments (NOT platform fees)
├── api/
│   └── jazzcash/
│       ├── initiate/
│       │   └── route.ts          # Initiates payment
│       ├── callback/
│       │   └── route.ts          # Handles user redirect
│       └── ipn/
│           └── route.ts          # Handles payment notification
lib/
├── jazzcash.ts                   # Server-side utilities
└── jazzcash-client.ts            # Client-side utilities
```

## Important Distinctions

### Seller Payments Page (`/seller/payments`)
**Purpose:** Track business transactions
- Payments received from customers
- Payments made to suppliers
- Invoice-related payments
- **NOT for platform subscription fees**

### Seller Subscription Page (`/seller/subscription`)
**Purpose:** Pay platform subscription fees
- Choose subscription plan
- Pay platform fees via JazzCash
- Manage subscription status
- View billing history

## Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- active, expired, cancelled
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PKR',
  billing_cycle VARCHAR(20) NOT NULL, -- monthly, yearly
  starts_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### Subscription Payments Table
```sql
CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id),
  company_id UUID REFERENCES companies(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_gateway VARCHAR(50) DEFAULT 'jazzcash',
  gateway_transaction_id VARCHAR(255),
  gateway_response_code VARCHAR(10),
  gateway_response_message TEXT,
  gateway_raw_response JSONB,
  payment_status VARCHAR(50) NOT NULL, -- pending, completed, failed
  reference_number VARCHAR(255) UNIQUE,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sub_payments_subscription ON subscription_payments(subscription_id);
CREATE INDEX idx_sub_payments_company ON subscription_payments(company_id);
CREATE INDEX idx_sub_payments_status ON subscription_payments(payment_status);
CREATE INDEX idx_sub_payments_gateway_txn ON subscription_payments(gateway_transaction_id);
```

## API Endpoints

### Initiate Subscription Payment
```typescript
POST /api/jazzcash/initiate

Request:
{
  "amount": 5000,
  "billReference": "SUB-company123-1700395200000",
  "description": "Professional Plan Subscription - monthly",
  "customerEmail": "seller@example.com",
  "customerMobile": "03001234567"
}

Response:
{
  "success": true,
  "paymentUrl": "https://sandbox.jazzcash.com.pk/...",
  "formData": { ... },
  "txnRefNo": "T1700395200000"
}
```

### Payment Callback (IPN)
```typescript
POST /api/jazzcash/ipn

// Automatically called by JazzCash
// Updates subscription status in database
```

## Implementation Steps

### 1. Create Subscription Plans
Define your plans in the subscription page:
```typescript
const SUBSCRIPTION_PLANS = [
  {
    id: 'basic_monthly',
    name: 'Basic',
    price: 2000,
    duration: 'monthly',
    features: [...]
  },
  // ... more plans
];
```

### 2. Handle Subscription Payment
```typescript
const handleSubscribe = async (plan) => {
  await processJazzCashPayment({
    amount: plan.price,
    billReference: `SUB-${companyId}-${Date.now()}`,
    description: `${plan.name} Plan Subscription`,
    customerEmail: user.email,
  });
};
```

### 3. Process IPN Notification
Update subscription status when payment is confirmed:
```typescript
// In /api/jazzcash/ipn/route.ts
if (responseCode === '000') {
  // Payment successful
  await activateSubscription({
    companyId,
    planId,
    transactionId,
    amount,
  });
}
```

## Testing

### Test Subscription Flow
1. Login as seller
2. Navigate to **Subscription** page
3. Select a plan (e.g., Professional - PKR 5,000)
4. Click "Subscribe Now"
5. Payment opens in new tab
6. Use test card: `4111 1111 1111 1111`
7. Complete payment
8. Verify subscription activated

### Test Cards (Sandbox)
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (12/25)
CVV: Any 3 digits (123)
```

## Revenue Tracking

### For Platform Owner
Track subscription revenue in super admin dashboard:
```sql
-- Total subscription revenue
SELECT 
  SUM(amount) as total_revenue,
  COUNT(*) as total_subscriptions,
  plan_id,
  DATE_TRUNC('month', paid_at) as month
FROM subscription_payments
WHERE payment_status = 'completed'
GROUP BY plan_id, month
ORDER BY month DESC;
```

### Monthly Recurring Revenue (MRR)
```sql
SELECT 
  SUM(amount) as mrr,
  COUNT(DISTINCT company_id) as active_subscribers
FROM subscriptions
WHERE status = 'active'
  AND billing_cycle = 'monthly';
```

## Auto-Renewal

### Implementation
1. Set up cron job to check expiring subscriptions
2. Send reminder emails 7 days before expiry
3. Automatically charge on expiry date
4. Update subscription status based on payment result

### Cron Job Example
```typescript
// Run daily
async function checkExpiringSubscriptions() {
  const expiringSoon = await getSubscriptionsExpiringIn(7); // 7 days
  
  for (const subscription of expiringSoon) {
    await sendReminderEmail(subscription);
  }
  
  const expired = await getExpiredSubscriptions();
  
  for (const subscription of expired) {
    if (subscription.auto_renew) {
      await renewSubscription(subscription);
    } else {
      await deactivateSubscription(subscription);
    }
  }
}
```

## Best Practices

1. **Separate Concerns**
   - Keep subscription payments separate from business payments
   - Use different database tables
   - Different UI sections

2. **Grace Period**
   - Give 7-day grace period for failed payments
   - Send multiple reminders
   - Don't immediately disable account

3. **Transparent Pricing**
   - Clearly show what's included in each plan
   - No hidden fees
   - Easy to understand billing

4. **Easy Cancellation**
   - Allow sellers to cancel anytime
   - No penalties for cancellation
   - Prorated refunds if applicable

5. **Payment Security**
   - All payments through JazzCash (PCI compliant)
   - Never store card details
   - Verify all payment callbacks

## Support

### For Sellers
- Email: support@yourplatform.com
- Phone: Your support number
- Help Center: Link to documentation

### For Platform Owner
- JazzCash Support: business@jazzcash.com.pk
- JazzCash Phone: 111-124-444

## Next Steps

1. ✅ Set up subscription plans
2. ✅ Integrate JazzCash payment
3. ⏳ Create subscription database tables
4. ⏳ Implement IPN handler for subscriptions
5. ⏳ Add subscription status checks
6. ⏳ Set up auto-renewal system
7. ⏳ Create admin dashboard for revenue tracking
8. ⏳ Add email notifications
9. ⏳ Test thoroughly
10. ⏳ Go live!
