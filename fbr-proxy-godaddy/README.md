# FBR API Proxy for GoDaddy Shared Hosting

## Problem
- Your Next.js app can't run on GoDaddy shared hosting
- But GoDaddy IP is whitelisted with FBR
- Need to use that IP for FBR API calls

## Solution
Simple PHP proxy on GoDaddy that forwards requests to FBR!

---

## Setup Instructions

### Step 1: Upload to GoDaddy

1. **Login to GoDaddy cPanel**
2. **Go to File Manager**
3. **Navigate to `public_html`**
4. **Create folder:** `fbr-api` (or any name)
5. **Upload `fbr-proxy.php`** to this folder

**Result:** `https://yourdomain.com/fbr-api/fbr-proxy.php`

### Step 2: Configure Security

Edit `fbr-proxy.php`:

```php
// Line 28: Change this to a strong random key
$VALID_API_KEY = 'your-secret-api-key-here';

// Line 18: Change * to your domain (production)
header('Access-Control-Allow-Origin: *');
// To:
header('Access-Control-Allow-Origin: https://your-nextjs-app.com');
```

**Generate strong API key:**
```bash
# On your computer
openssl rand -hex 32
# Or use: https://randomkeygen.com/
```

### Step 3: Test the Proxy

**Test with cURL:**
```bash
curl -X POST https://yourdomain.com/fbr-api/fbr-proxy.php \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "endpoint": "validate",
    "token": "07de2afc-caed-3215-900b-b01720619ca4",
    "data": {
      "invoiceType": "Sale Invoice",
      "invoiceDate": "2025-11-12",
      "buyerNTNCNIC": "1234567",
      "buyerBusinessName": "Test Company",
      "buyerProvince": "Sindh",
      "buyerAddress": "Karachi",
      "invoiceRefNo": "TEST-001",
      "scenarioId": "SN001",
      "buyerRegistrationType": "Unregistered",
      "items": [{
        "hsCode": "0101.2100",
        "productDescription": "Test",
        "rate": "18%",
        "uoM": "Numbers, pieces, units",
        "quantity": 1,
        "totalValues": 0,
        "valueSalesExcludingST": 1000,
        "fixedNotifiedValueOrRetailPrice": 0,
        "salesTaxApplicable": 180,
        "salesTaxWithheldAtSource": 0,
        "extraTax": 0,
        "furtherTax": 0,
        "sroScheduleNo": "",
        "fedPayable": 0,
        "discount": 0,
        "saleType": "Goods at standard rate (default)",
        "sroItemSerialNo": ""
      }]
    }
  }'
```

**Expected Response:**
```json
{
  "dated": "2025-11-12 10:30:00",
  "validationResponse": {
    "statusCode": "00",
    "status": "Valid",
    ...
  }
}
```

### Step 4: Integrate with Your Next.js App

**Install in your project:**
```bash
# Copy fbr-client.ts to your lib folder
cp fbr-client.ts your-nextjs-app/lib/
```

**Use in your API routes:**

```typescript
// app/api/fbr/validate/route.ts
import { FBRProxyClient } from '@/lib/fbr-client';

const fbrClient = new FBRProxyClient({
  proxyUrl: process.env.FBR_PROXY_URL!, // https://yourdomain.com/fbr-api/fbr-proxy.php
  apiKey: process.env.FBR_PROXY_API_KEY! // your-secret-api-key-here
});

export async function POST(request: Request) {
  try {
    const { token, invoiceData } = await request.json();
    
    const result = await fbrClient.validateInvoice(token, invoiceData);
    
    return Response.json(result);
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Add to `.env`:**
```env
FBR_PROXY_URL=https://yourdomain.com/fbr-api/fbr-proxy.php
FBR_PROXY_API_KEY=your-secret-api-key-here
```

---

## Architecture

```
┌─────────────────────────────────┐
│  User Browser                   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Your Next.js App               │
│  (Vercel/Any hosting)           │
│  IP: Dynamic (any)              │
└──────────────┬──────────────────┘
               │
               │ HTTPS + API Key
               ▼
┌─────────────────────────────────┐
│  GoDaddy Shared Hosting         │
│  fbr-proxy.php                  │
│  IP: XXX.XXX.XXX.XXX            │ ← FBR Whitelisted
└──────────────┬──────────────────┘
               │
               │ Forward with token
               ▼
┌─────────────────────────────────┐
│  FBR API                        │
│  (Only accepts GoDaddy IP)      │
└─────────────────────────────────┘
```

---

## Benefits

✅ **Use GoDaddy's whitelisted IP** for all FBR calls  
✅ **Next.js app can be anywhere** (Vercel, AWS, etc.)  
✅ **Multiple apps** can use same proxy  
✅ **Secure** with API key authentication  
✅ **Simple** - just one PHP file  
✅ **No database needed**  
✅ **Works on shared hosting**  

---

## Security Best Practices

### 1. Strong API Key
```php
// Use a long random string
$VALID_API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
```

### 2. Restrict CORS
```php
// Only allow your domain
header('Access-Control-Allow-Origin: https://your-app.com');
```

### 3. Rate Limiting (Optional)
```php
// Add at the top of fbr-proxy.php
$ip = $_SERVER['REMOTE_ADDR'];
$rateLimit = 100; // requests per hour
// Implement rate limiting logic
```

### 4. IP Whitelist (Optional)
```php
// Only allow requests from your Next.js server
$allowedIPs = ['1.2.3.4', '5.6.7.8'];
if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIPs)) {
    http_response_code(403);
    exit('Forbidden');
}
```

### 5. HTTPS Only
```php
// Force HTTPS
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    http_response_code(403);
    exit('HTTPS required');
}
```

---

## Monitoring & Logs

### Check Logs
```bash
# Via cPanel File Manager or FTP
cat fbr-proxy-log.txt
cat fbr-proxy-errors.log
```

### Log Format
```json
{"timestamp":"2025-11-12 10:30:00","endpoint":"validate","http_code":200,"ip":"1.2.3.4"}
```

### Clear Logs (if too large)
```bash
# Via cPanel Terminal or SSH
> fbr-proxy-log.txt
> fbr-proxy-errors.log
```

---

## Troubleshooting

### Error: "Unauthorized"
- Check API key matches in both proxy and client
- Verify `X-API-Key` header is being sent

### Error: "CORS"
- Update `Access-Control-Allow-Origin` in proxy
- Check browser console for CORS errors

### Error: "Connection timeout"
- FBR API might be down
- Check GoDaddy server can reach FBR
- Increase `CURLOPT_TIMEOUT` in proxy

### Error: "SSL certificate problem"
- GoDaddy server SSL certificates outdated
- Contact GoDaddy support
- Temporary: Set `CURLOPT_SSL_VERIFYPEER => false` (not recommended)

---

## Cost

**GoDaddy Shared Hosting:**
- ~$5-10/month
- Unlimited bandwidth (usually)
- Multiple domains supported

**Benefits:**
- One proxy serves multiple apps
- All apps use same whitelisted IP
- No need for expensive VPS

---

## Scaling

### For High Traffic:

1. **Upgrade to VPS** (if needed)
2. **Add caching** (Redis/Memcached)
3. **Load balancer** (multiple proxies)
4. **CDN** (Cloudflare in front)

### For Multiple Clients:

```php
// Multi-tenant support
$clientId = $requestData['client_id'] ?? '';
$clientTokens = [
    'client1' => 'token1',
    'client2' => 'token2'
];
$fbrToken = $clientTokens[$clientId] ?? '';
```

---

## Alternative: Node.js Proxy

If GoDaddy supports Node.js:

```javascript
// fbr-proxy.js
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/fbr-proxy', async (req, res) => {
  const { endpoint, token, data } = req.body;
  
  const fbrUrl = endpoint === 'post' 
    ? 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb'
    : 'https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb';
  
  try {
    const response = await axios.post(fbrUrl, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

---

## Support

If you need help:
1. Check logs first
2. Test with cURL
3. Verify API key
4. Check GoDaddy IP is still whitelisted with FBR

---

**Happy Coding!** 🚀
