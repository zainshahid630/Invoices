# JazzCash Quick Reference Guide

## Quick Start

### 1. Environment Setup
```bash
# .env.local
JAZZCASH_MERCHANT_ID=MC478733
JAZZCASH_PASSWORD=s3184uvwzv
JAZZCASH_INTEGRITY_SALT=2531t08v20
JAZZCASH_RETURN_URL=http://localhost:3000/api/jazzcash/callback
JAZZCASH_IPN_URL=http://localhost:3000/api/jazzcash/ipn
JAZZCASH_ENVIRONMENT=sandbox
```

### 2. Initiate Payment
```typescript
const response = await fetch('/api/jazzcash/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1000,                    // PKR
    billReference: 'INV-001',        // Your reference
    description: 'Payment for goods',
    customerEmail: 'user@example.com',
    customerMobile: '03001234567'
  })
});

const data = await response.json();
// data.paymentUrl - JazzCash payment URL
// data.formData - Form fields to submit
// data.txnRefNo - Transaction reference
```

### 3. Submit to JazzCash (New Tab)
```typescript
// Open payment in new tab (recommended)
const newWindow = window.open('', '_blank');

if (newWindow) {
  const form = newWindow.document.createElement('form');
  form.method = 'POST';
  form.action = data.paymentUrl;

  Object.entries(data.formData).forEach(([key, value]) => {
    const input = newWindow.document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  // Add loading message
  newWindow.document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh;">
      <div style="text-align: center;">
        <h2>Redirecting to JazzCash...</h2>
        <p>Please wait...</p>
      </div>
    </div>
  `;

  newWindow.document.body.appendChild(form);
  form.submit();
} else {
  alert('Please allow pop-ups to complete payment');
}
```

**Alternative: Same Page Redirect**
```typescript
// Redirect in same page (not recommended for dashboards)
const form = document.createElement('form');
form.method = 'POST';
form.action = data.paymentUrl;

Object.entries(data.formData).forEach(([key, value]) => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = key;
  input.value = value;
  form.appendChild(input);
});

document.body.appendChild(form);
form.submit();
```

## API Endpoints

### POST /api/jazzcash/initiate
Initiates a payment request.

**Request:**
```json
{
  "amount": 1000,
  "billReference": "INV-001",
  "description": "Payment description",
  "customerEmail": "user@example.com",
  "customerMobile": "03001234567"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.jazzcash.com.pk/...",
  "formData": { ... },
  "txnRefNo": "T1700395200000"
}
```

### POST /api/jazzcash/callback
Handles user redirect after payment (Return URL).

**Receives:** Form data from JazzCash
**Returns:** Redirect to success/failed page

### POST /api/jazzcash/ipn
Handles server-to-server notification (IPN).

**Receives:** Form data from JazzCash servers
**Returns:** JSON response
```json
{
  "status": "SUCCESS",
  "message": "Payment processed successfully"
}
```

## Response Codes

| Code | Description | Action |
|------|-------------|--------|
| 000 | Success | Mark payment as completed |
| 001 | Declined | Show error to user |
| 002 | Insufficient Funds | Ask user to try another method |
| 003 | Invalid Card | Ask user to check card details |
| 004 | Expired Card | Ask user to use valid card |
| 124 | Timeout | Retry payment |
| 200 | Duplicate Transaction | Check if already processed |

## Form Fields Reference

### Required Fields
```typescript
{
  pp_Version: '1.1',              // API version
  pp_TxnType: 'MWALLET',          // Transaction type
  pp_Language: 'EN',              // Language
  pp_MerchantID: 'MC478733',      // Your merchant ID
  pp_Password: 's3184uvwzv',      // Your password
  pp_TxnRefNo: 'T1700395200000',  // Unique transaction ref
  pp_Amount: '100000',            // Amount in paisa
  pp_TxnCurrency: 'PKR',          // Currency
  pp_TxnDateTime: '20231119120000', // Transaction datetime
  pp_TxnExpiryDateTime: '20231119130000', // Expiry datetime
  pp_BillReference: 'INV-001',    // Your bill reference
  pp_Description: 'Payment',      // Description
  pp_ReturnURL: 'http://...',     // Return URL
  pp_SecureHash: 'ABC123...'      // Secure hash
}
```

### Optional Fields
```typescript
{
  ppmpf_1: 'user@example.com',    // Custom field 1 (email)
  ppmpf_2: '03001234567',         // Custom field 2 (mobile)
  ppmpf_3: '',                    // Custom field 3
  ppmpf_4: '',                    // Custom field 4
  ppmpf_5: ''                     // Custom field 5
}
```

## Hash Calculation

```typescript
// 1. Prepare data (without hash)
const data = {
  pp_Amount: '100000',
  pp_BillReference: 'INV-001',
  // ... other fields
};

// 2. Sort keys alphabetically
const sortedKeys = Object.keys(data).sort();

// 3. Create hash string
const hashString = integritySalt + '&' + 
  sortedKeys.map(key => data[key]).join('&');

// 4. Generate HMAC SHA256
const hash = crypto
  .createHmac('sha256', integritySalt)
  .update(hashString)
  .digest('hex')
  .toUpperCase();
```

## Common Issues & Solutions

### Issue: Invalid Hash
**Solution:** 
- Verify integrity salt is correct
- Ensure fields are sorted alphabetically
- Check for extra spaces in values
- Verify hash is uppercase

### Issue: IPN Not Received
**Solution:**
- Use ngrok for local testing: `ngrok http 3000`
- Update IPN URL in JazzCash portal
- Check server logs for incoming requests
- Verify firewall allows JazzCash IPs

### Issue: Amount Mismatch
**Solution:**
- Convert PKR to paisa: `amount * 100`
- Use `Math.round()` to avoid decimals
- Example: PKR 100.50 = 10050 paisa

### Issue: Callback Not Working
**Solution:**
- Check Return URL is correct
- Verify URL is publicly accessible
- Test with ngrok for local development
- Check for CORS issues

## Testing

### Test Cards (Sandbox)
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

### Test Mobile Wallet
```
Mobile Number: 03001234567
PIN: 1234
```

### Test Scenarios
1. **Successful Payment:** Complete payment flow
2. **Failed Payment:** Cancel on payment page
3. **Timeout:** Wait without completing
4. **Invalid Card:** Use wrong card number

## URLs

### Sandbox
- Payment Gateway: `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/`
- Portal: `https://sandbox.jazzcash.com.pk/`

### Production
- Payment Gateway: `https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/`
- Portal: `https://payments.jazzcash.com.pk/`

## Support

- Email: business@jazzcash.com.pk
- Phone: 111-124-444
- Documentation: https://sandbox.jazzcash.com.pk/

## Code Examples

### Complete Payment Flow
```typescript
// 1. Create payment
const payment = await fetch('/api/jazzcash/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1000,
    billReference: 'INV-001',
    description: 'Test payment'
  })
});

const { paymentUrl, formData } = await payment.json();

// 2. Submit to JazzCash in new tab (recommended)
const newWindow = window.open('', '_blank');

if (newWindow) {
  const form = newWindow.document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;

  Object.entries(formData).forEach(([key, value]) => {
    const input = newWindow.document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  // Add loading UI
  newWindow.document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">💳</div>
        <h2>Redirecting to JazzCash...</h2>
        <p style="color: #666;">Please wait...</p>
      </div>
    </div>
  `;

  newWindow.document.body.appendChild(form);
  form.submit();
} else {
  alert('Please allow pop-ups to complete payment');
}

// 3. Handle callback (automatic)
// User redirected to /api/jazzcash/callback in the new tab
// Then to /payment/success or /payment/failed

// 4. Handle IPN (automatic)
// JazzCash calls /api/jazzcash/ipn
// Database updated automatically
```

### Verify Response Hash
```typescript
function verifyHash(data: Record<string, string>): boolean {
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
  const receivedHash = data.pp_SecureHash;
  
  const { pp_SecureHash, ...dataWithoutHash } = data;
  const sortedKeys = Object.keys(dataWithoutHash).sort();
  const hashString = integritySalt + '&' + 
    sortedKeys.map(key => dataWithoutHash[key]).join('&');
  
  const calculatedHash = crypto
    .createHmac('sha256', integritySalt)
    .update(hashString)
    .digest('hex')
    .toUpperCase();
  
  return calculatedHash === receivedHash;
}
```

## Database Schema

```sql
-- Payment tracking
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  amount DECIMAL(10,2),
  payment_gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255),
  gateway_response_code VARCHAR(10),
  gateway_response_message TEXT,
  gateway_raw_response JSONB,
  payment_status VARCHAR(50),
  reference_number VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_gateway_txn ON payments(gateway_transaction_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_gateway ON payments(payment_gateway);
```

## New Tab vs Same Page Redirect

### New Tab Approach (Recommended)
**Pros:**
- User keeps dashboard/page open
- Better UX for sellers and admins
- Can track payment status in original tab
- No loss of form data or state
- User can easily switch back

**Cons:**
- Requires pop-up permission
- Slightly more complex code

**Use Cases:**
- Seller dashboards
- Admin panels
- Multi-step forms
- Any page with unsaved data

### Same Page Redirect
**Pros:**
- Simpler implementation
- No pop-up blockers
- Works everywhere

**Cons:**
- User loses current page
- Must navigate back manually
- Form data may be lost
- Poor UX for dashboards

**Use Cases:**
- Simple checkout pages
- Single-purpose payment pages
- Mobile apps (webview)

## Best Practices

1. **Always verify hash** in callback and IPN
2. **Use IPN for critical operations** (database updates)
3. **Use new tab for dashboards** (better UX)
4. **Log all transactions** for audit trail
5. **Handle timeouts gracefully** (user may close browser)
6. **Implement idempotency** (prevent duplicate processing)
7. **Use HTTPS in production** (required)
8. **Store raw responses** for debugging
9. **Monitor failed payments** and alert
10. **Implement retry logic** for network failures
11. **Test pop-up blockers** (provide fallback)
12. **Test thoroughly** before going live
