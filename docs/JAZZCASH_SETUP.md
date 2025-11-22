# JazzCash Payment Gateway Integration

## Overview
This document explains how to integrate and use the JazzCash payment gateway in your application. The implementation follows the official JazzCash documentation v3.9 for HTTP POST (Page Redirection) integration mode.

## Integration Mode
This implementation uses **HTTP POST (Page Redirection)** with **MWALLET** transaction type, which supports:
- Credit/Debit Cards (Visa, Mastercard)
- Mobile Wallet (JazzCash Mobile Account)
- Over The Counter (OTC) payments

## Setup Instructions

### 1. Get JazzCash Credentials

To get your JazzCash credentials, you need to:

1. Contact JazzCash Business Support
   - Email: business@jazzcash.com.pk
   - Phone: 111-124-444
   - Website: https://sandbox.jazzcash.com.pk/

2. Request for Merchant Account and provide:
   - Business Name
   - Business Registration Documents
   - Bank Account Details
   - Contact Information

3. You will receive:
   - **Merchant ID** (auto-generated)
   - **Password** (auto-generated)
   - **Integrity Salt** (auto-generated)

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# JazzCash Payment Gateway
JAZZCASH_MERCHANT_ID=your_merchant_id_here
JAZZCASH_PASSWORD=your_password_here
JAZZCASH_INTEGRITY_SALT=your_integrity_salt_here
JAZZCASH_RETURN_URL=http://localhost:3000/api/jazzcash/callback
JAZZCASH_ENVIRONMENT=sandbox
```

**Important Notes:**
- Use `sandbox` environment for testing
- Change to `production` when going live
- Update `JAZZCASH_RETURN_URL` to your production domain when deploying

### 3. Return URL & IPN URL Configuration

When registering with JazzCash, provide them with both URLs:

#### Return URL (User Redirect)
This is where users are redirected after payment:

**For Development:**
```
http://localhost:3000/api/jazzcash/callback
```

**For Production:**
```
https://yourdomain.com/api/jazzcash/callback
```

#### IPN URL (Server-to-Server Notification)
This receives instant payment notifications from JazzCash servers:

**For Development:**
```
http://localhost:3000/api/jazzcash/ipn
```

**For Production:**
```
https://yourdomain.com/api/jazzcash/ipn
```

**Important Differences:**
- **Return URL**: User's browser is redirected here (can be unreliable if user closes browser)
- **IPN URL**: JazzCash server calls this directly (reliable, always executes)
- **Best Practice**: Use IPN for critical operations like updating payment status in database

## File Structure

```
app/
├── api/
│   └── jazzcash/
│       ├── callback/
│       │   └── route.ts          # Handles user redirects (Return URL)
│       ├── ipn/
│       │   └── route.ts          # Handles server notifications (IPN URL)
│       └── initiate/
│           └── route.ts          # Initiates payment
├── payment/
│   ├── page.tsx                  # Payment form
│   ├── success/
│   │   └── page.tsx             # Success page
│   └── failed/
│       └── page.tsx             # Failed page
lib/
└── jazzcash.ts                   # JazzCash utility functions
```

## Usage

### Basic Payment Flow

1. User fills payment form at `/payment`
2. Form submits to `/api/jazzcash/initiate`
3. API creates payment request and redirects to JazzCash
4. User completes payment on JazzCash portal
5. **Two things happen simultaneously:**
   - **IPN**: JazzCash server calls `/api/jazzcash/ipn` (server-to-server)
   - **Return URL**: User's browser redirects to `/api/jazzcash/callback`
6. IPN updates database with payment status
7. Callback verifies payment and redirects user to success/failed page

**Note:** Always rely on IPN for critical operations, as Return URL can fail if user closes browser.

### Programmatic Payment Initiation

```typescript
import { createPaymentForm } from '@/lib/jazzcash';

const paymentData = createPaymentForm({
  amount: 1000, // PKR
  billReference: 'INV-001',
  description: 'Payment for Invoice #001',
  customerEmail: 'customer@example.com',
  customerMobile: '03001234567',
});

// paymentData contains:
// - url: JazzCash payment URL
// - formData: Form fields to submit
// - txnRefNo: Transaction reference number
```

### API Endpoint Usage

**Initiate Payment:**
```bash
POST /api/jazzcash/initiate
Content-Type: application/json

{
  "amount": 1000,
  "billReference": "INV-001",
  "description": "Payment for invoice",
  "customerEmail": "customer@example.com",
  "customerMobile": "03001234567"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.jazzcash.com.pk/...",
  "formData": {
    "pp_MerchantID": "...",
    "pp_Amount": "100000",
    ...
  },
  "txnRefNo": "T1234567890123"
}
```

## Testing

### Sandbox Test Cards

JazzCash provides test cards for sandbox environment:

- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits

### Test Scenarios

1. **Successful Payment:**
   - Use valid test card
   - Complete payment flow
   - Should redirect to `/payment/success`

2. **Failed Payment:**
   - Cancel payment on JazzCash portal
   - Should redirect to `/payment/failed`

## Security

### Hash Verification

All requests and responses are verified using HMAC SHA256:

```typescript
// Request hash
const hashString = integritySalt + '&' + sortedValues.join('&');
const hash = crypto.createHmac('sha256', integritySalt)
  .update(hashString)
  .digest('hex')
  .toUpperCase();
```

### Best Practices

1. Never expose credentials in client-side code
2. Always verify response hash in callback
3. Use HTTPS in production
4. Store transaction logs for audit
5. Implement rate limiting on payment endpoints

## Response Codes

| Code | Description |
|------|-------------|
| 000  | Success |
| 001  | Declined |
| 002  | Insufficient Funds |
| 003  | Invalid Card |
| 004  | Expired Card |
| 124  | Timeout |
| 200  | Duplicate Transaction |

## IPN vs Return URL

| Feature | IPN URL | Return URL |
|---------|---------|------------|
| **Type** | Server-to-Server | Browser Redirect |
| **Reliability** | High (always executes) | Medium (can fail if user closes browser) |
| **Use Case** | Update database, send emails | Show success/failure page to user |
| **When Called** | Immediately after payment | After payment when user is redirected |
| **Recommended For** | Critical operations | User feedback |

**Best Practice:** Use IPN for database updates and Return URL for user experience.

## Troubleshooting

### Common Issues

1. **Invalid Hash Error:**
   - Verify integrity salt is correct
   - Check field order in hash calculation
   - Ensure no extra spaces in values

2. **IPN/Callback Not Received:**
   - Check URLs are publicly accessible (use ngrok for local testing)
   - Verify firewall settings allow JazzCash IPs
   - Check JazzCash portal configuration
   - For local development, use a tunneling service like ngrok

3. **Amount Mismatch:**
   - Remember: Amount must be in paisa (multiply by 100)
   - Example: PKR 100 = 10000 paisa

4. **Testing IPN Locally:**
   - Use ngrok: `ngrok http 3000`
   - Update IPN URL to ngrok URL: `https://your-id.ngrok.io/api/jazzcash/ipn`
   - Provide this URL to JazzCash for testing

## Important Implementation Notes

### Hash Calculation
According to JazzCash documentation, the secure hash is calculated as follows:
1. Sort all parameters alphabetically by key name
2. Create hash string: `integritySalt&value1&value2&value3...`
3. Generate HMAC SHA256 hash
4. Convert to uppercase hexadecimal

**Example:**
```typescript
const sortedKeys = Object.keys(data).sort();
const hashString = integritySalt + '&' + sortedKeys.map(key => data[key]).join('&');
const hash = crypto.createHmac('sha256', integritySalt)
  .update(hashString)
  .digest('hex')
  .toUpperCase();
```

### Transaction Types
- **MWALLET**: Mobile Wallet (supports cards, mobile accounts, OTC)
- **MIGS**: Card Payment only
- **OTC**: Over The Counter only

This implementation uses **MWALLET** for maximum flexibility.

### Amount Format
- Amount must be in **paisa** (1 PKR = 100 paisa)
- Example: PKR 100.00 = 10000 paisa
- Always use `Math.round()` to avoid decimal issues

### DateTime Format
- Format: `YYYYMMDDHHMMSS`
- Example: `20231119123045` (Nov 19, 2023, 12:30:45)
- Timezone: Pakistan Standard Time (PKT)

## Production Checklist

- [ ] Update `JAZZCASH_ENVIRONMENT` to `production`
- [ ] Update `JAZZCASH_RETURN_URL` to production domain with HTTPS
- [ ] Update `JAZZCASH_IPN_URL` to production domain with HTTPS
- [ ] Configure production credentials from JazzCash
- [ ] Whitelist your production IPs with JazzCash
- [ ] Test with real transactions (small amounts first)
- [ ] Set up transaction logging and monitoring
- [ ] Configure webhook monitoring and alerts
- [ ] Enable SSL/HTTPS (required for production)
- [ ] Set up error alerting and notifications
- [ ] Implement transaction reconciliation process
- [ ] Add rate limiting on payment endpoints
- [ ] Set up backup/fallback payment method

## Support

For JazzCash support:
- Email: business@jazzcash.com.pk
- Phone: 111-124-444
- Documentation: https://sandbox.jazzcash.com.pk/

## Next Steps

1. Get credentials from JazzCash
2. Update `.env.local` with your credentials
3. Test payment flow at `/payment`
4. Integrate with your invoice/billing system
5. Add database logging for transactions
