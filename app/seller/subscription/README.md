# Subscription Management System

This directory contains the subscription management feature for sellers, integrated with JazzCash payment gateway.

## Features

- **Multiple Subscription Plans**: Basic, Professional, and Enterprise tiers
- **JazzCash Integration**: Secure payment processing via JazzCash gateway
- **Direct Pay Support**: MPAY transaction type with card details
- **Mobile Wallet Support**: MWALLET transaction type for JazzCash wallet payments
- **Automatic Subscription Activation**: Subscriptions are activated upon successful payment
- **Payment Tracking**: Full payment history and status tracking

## Subscription Plans

### Basic Plan (PKR 2,000/month)
- Up to 50 invoices per month
- Basic reporting
- Email support
- FBR integration

### Professional Plan (PKR 5,000/month) - Most Popular
- Unlimited invoices
- Advanced reporting & analytics
- Priority support
- FBR integration
- Custom branding
- Multi-user access

### Enterprise Plan (PKR 10,000/month)
- Everything in Professional
- Dedicated account manager
- 24/7 phone support
- Custom integrations
- API access
- Training & onboarding

## Payment Flow

1. **User selects a plan** → Clicks "Subscribe Now"
2. **Subscription record created** → API creates pending subscription in database
3. **Payment initiated** → JazzCash payment form is generated with secure hash
4. **User redirected to JazzCash** → Opens in new tab with payment options
5. **Payment processed** → User completes payment via card/wallet/OTC
6. **IPN notification** → JazzCash sends server-to-server notification
7. **Subscription activated** → System activates subscription upon successful payment
8. **User redirected back** → Returns to success/failure page

## API Endpoints

### GET `/api/seller/subscription`
Fetch current subscription for a company.

**Query Parameters:**
- `company_id` (required): Company UUID

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "company_id": "uuid",
    "plan_id": "pro_monthly",
    "start_date": "2024-01-01",
    "end_date": "2024-02-01",
    "amount": 5000,
    "status": "active",
    "payment_status": "paid"
  }
}
```

### POST `/api/seller/subscription`
Create a new subscription and payment record.

**Request Body:**
```json
{
  "companyId": "uuid",
  "planId": "pro_monthly",
  "amount": 5000,
  "txnRefNo": "SUB-uuid-timestamp"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": { ... },
  "payment": { ... }
}
```

## JazzCash Integration

### Required Environment Variables

```env
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_integrity_salt
JAZZCASH_RETURN_URL=https://yourdomain.com/api/jazzcash/callback
JAZZCASH_ENVIRONMENT=sandbox  # or 'production'
```

### Payment Types Supported

#### 1. MWALLET (Mobile Wallet)
- JazzCash mobile wallet
- No card details required
- User logs in to JazzCash account

#### 2. MPAY (Direct Pay)
- Credit/Debit cards (Visa, Mastercard)
- Card details entered directly
- Supports card tokenization
- Required fields:
  - `pp_CustomerCardNumber`
  - `pp_CustomerCardCVV`
  - `pp_CustomerCardExpiry` (MMYY format)

### Secure Hash Generation

All requests to JazzCash must include a secure hash for integrity verification:

```typescript
// Hash string format: integritySalt&value1&value2&...
// Values are sorted alphabetically by key
const hashString = integritySalt + '&' + sortedValues.join('&');
const hash = crypto.createHmac('sha256', integritySalt)
  .update(hashString)
  .digest('hex')
  .toUpperCase();
```

## Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  plan_id VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  reference_number VARCHAR(100),
  gateway_transaction_id VARCHAR(255),
  gateway_response_code VARCHAR(50),
  gateway_response_message TEXT,
  gateway_raw_response JSONB,
  created_at TIMESTAMP
);
```

## Testing

Currently restricted to NTN: 090078601 for testing purposes.

To test:
1. Login with a seller account having NTN 090078601
2. Navigate to `/seller/subscription`
3. Select a plan and click "Subscribe Now"
4. Complete payment on JazzCash sandbox
5. Verify subscription activation

## Security Considerations

1. **Hash Verification**: All JazzCash responses are verified using HMAC-SHA256
2. **HTTPS Required**: All production endpoints must use HTTPS
3. **Environment Variables**: Sensitive credentials stored in environment variables
4. **IPN Validation**: Server-to-server notifications are validated before processing
5. **Amount Validation**: Payment amounts are verified against subscription records

## Troubleshooting

### Payment fails with "Invalid Hash"
- Verify `JAZZCASH_INTEGRITY_SALT` is correct
- Ensure all parameters are included in hash calculation
- Check parameter values match exactly (no extra spaces)

### Subscription not activated after payment
- Check IPN endpoint is accessible from JazzCash servers
- Verify database permissions for updating subscriptions
- Check server logs for IPN processing errors

### Pop-up blocked
- Ensure browser allows pop-ups for your domain
- User will see error message to enable pop-ups

## Future Enhancements

- [ ] Annual subscription plans with discounts
- [ ] Proration for plan upgrades/downgrades
- [ ] Auto-renewal with saved cards
- [ ] Subscription pause/resume
- [ ] Usage-based billing
- [ ] Invoice generation for subscriptions
- [ ] Email notifications for expiring subscriptions
- [ ] Admin dashboard for subscription management
