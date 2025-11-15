# FBR Proxy Setup for Anjum Associates

## 🎯 Quick Setup (5 Minutes)

### Step 1: Upload Files to GoDaddy

1. **Login to GoDaddy cPanel**
   - Go to: https://godaddy.com
   - Login with your credentials
   - Click "cPanel" or "Web Hosting"

2. **Open File Manager**
   - Find "Files" section
   - Click "File Manager"

3. **Create Directory**
   - Navigate to `public_html`
   - Click "New Folder"
   - Name it: `fbr-api`

4. **Upload Files**
   - Enter `fbr-api` folder
   - Click "Upload"
   - Upload these files:
     - `fbr-proxy.php`
     - `test-proxy.html`

### Step 2: Set Permissions

```
fbr-api/
├── fbr-proxy.php (644)
└── test-proxy.html (644)
```

Right-click each file → Permissions → Set to 644

### Step 3: Test the Proxy

**Open in browser:**
```
https://invoicefbr.com/fbr-api/test-proxy.html
```

**Fill in the form:**
- Endpoint: Validate (Sandbox)
- FBR Token: 07de2afc-caed-3215-900b-b01720619ca4
- Seller NTN: 5419764
- Seller Name: Anjum Associates
- Province: Punjab
- Address: Lahore

**Click "Test FBR API"**

**Expected Result:**
```json
{
  "dated": "2025-11-12 ...",
  "validationResponse": {
    "statusCode": "00",
    "status": "Valid",
    ...
  }
}
```

---

## 🔐 Security Configuration

### Your API Key:
```
anjum-fbr-2025-secure-key-<?php echo md5('anjumassociates.com'); ?>
```

**To change it:**
Edit `fbr-proxy.php` line 10:
```php
define('API_KEY', 'your-new-super-secret-key-here');
```

---

## 📡 API Endpoints

### Proxy URL:
```
https://invoicefbr.com/fbr-api/fbr-proxy.php
```

### Available Endpoints:
- `validate` - Validate invoice (Sandbox)
- `post` - Post invoice (Sandbox)
- `validate_prod` - Validate invoice (Production)
- `post_prod` - Post invoice (Production)

---

## 💻 Integration with Your Next.js App

### 1. Install Client Library

Copy `fbr-client.ts` to your project:
```bash
cp fbr-client.ts your-nextjs-app/lib/
```

### 2. Add Environment Variables

Create/update `.env.local`:
```env
FBR_PROXY_URL=https://invoicefbr.com/fbr-api/fbr-proxy.php
FBR_PROXY_API_KEY=anjum-fbr-2025-secure-key-<?php echo md5('anjumassociates.com'); ?>
FBR_SANDBOX_TOKEN=07de2afc-caed-3215-900b-b01720619ca4
FBR_PRODUCTION_TOKEN=your-production-token-here
```

### 3. Create API Route

**File:** `app/api/fbr/validate/route.ts`
```typescript
import { FBRProxyClient } from '@/lib/fbr-client';

const fbrClient = new FBRProxyClient({
  proxyUrl: process.env.FBR_PROXY_URL!,
  apiKey: process.env.FBR_PROXY_API_KEY!
});

export async function POST(request: Request) {
  try {
    const { invoiceData, environment } = await request.json();
    
    const token = environment === 'production' 
      ? process.env.FBR_PRODUCTION_TOKEN!
      : process.env.FBR_SANDBOX_TOKEN!;
    
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

### 4. Use in Your Components

```typescript
// In your invoice component
const validateInvoice = async (invoiceData: any) => {
  const response = await fetch('/api/fbr/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoiceData,
      environment: 'sandbox' // or 'production'
    })
  });
  
  const result = await response.json();
  return result;
};
```

---

## 🧪 Testing

### Test with cURL:

```bash
curl -X POST https://invoicefbr.com/fbr-api/fbr-proxy.php \
  -H "Content-Type: application/json" \
  -H "X-API-Key: anjum-fbr-2025-secure-key-<?php echo md5('anjumassociates.com'); ?>" \
  -d '{
    "endpoint": "validate",
    "token": "07de2afc-caed-3215-900b-b01720619ca4",
    "data": {
      "invoiceType": "Sale Invoice",
      "invoiceDate": "2025-11-12",
      "sellerNTNCNIC": "5419764",
      "sellerBusinessName": "Anjum Associates",
      "sellerProvince": "Punjab",
      "sellerAddress": "Lahore",
      "buyerNTNCNIC": "1234567",
      "buyerBusinessName": "Test Customer",
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

---

## 📊 Monitoring

### Check Logs:

Via cPanel File Manager:
```
fbr-api/fbr-requests.log  - Successful requests
fbr-api/fbr-errors.log    - Error logs
```

### Log Format:
```
[2025-11-12 10:30:00] validate - HTTP 200 - IP: 1.2.3.4
```

### Clear Logs (if too large):
```bash
# Via cPanel Terminal
> fbr-api/fbr-requests.log
> fbr-api/fbr-errors.log
```

---

## 🔧 Troubleshooting

### Error: "Unauthorized"
✅ Check API key matches in proxy and client  
✅ Verify `X-API-Key` header is being sent

### Error: "CORS"
✅ Check `ALLOWED_ORIGIN` in fbr-proxy.php  
✅ Should be: `https://invoicefbr.com`

### Error: "Connection timeout"
✅ FBR API might be down  
✅ Check GoDaddy server can reach FBR  
✅ Contact GoDaddy support

### Error: "File not found"
✅ Verify file path: `public_html/fbr-api/fbr-proxy.php`  
✅ Check file permissions (644)

---

## 🚀 Go Live Checklist

- [ ] Files uploaded to GoDaddy
- [ ] Permissions set correctly (644)
- [ ] Test page works
- [ ] cURL test successful
- [ ] API key configured
- [ ] Environment variables set
- [ ] Next.js integration tested
- [ ] Production token obtained from FBR
- [ ] Monitoring logs working

---

## 📞 Support

**GoDaddy Issues:**
- GoDaddy Support: 1-480-505-8877
- cPanel Help: https://godaddy.com/help

**FBR Issues:**
- FBR Helpline: [FBR Contact]
- Email: support@fbr.gov.pk

**Technical Issues:**
- Check logs first
- Test with cURL
- Verify API key
- Check GoDaddy IP is whitelisted

---

## 🎉 Success!

Once everything is working:

✅ Your GoDaddy IP is whitelisted with FBR  
✅ All requests go through anjumassociates.com  
✅ Your Next.js app can be hosted anywhere  
✅ Multiple apps can use same proxy  
✅ Secure with API key authentication  

**You're ready to process FBR invoices!** 🚀

---

**Domain:** https://invoicefbr.com  
**Proxy:** https://invoicefbr.com/fbr-api/fbr-proxy.php  
**Test:** https://invoicefbr.com/fbr-api/test-proxy.html
