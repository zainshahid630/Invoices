# 🚀 FBR Proxy Setup for Zazteck.com

## Quick Setup (5 Minutes)

### Your Configuration:
- **Domain:** https://zazteck.com
- **Proxy URL:** https://zazteck.com/fbr-api/fbr-proxy.php
- **Test URL:** https://zazteck.com/fbr-api/test-proxy.html
- **API Key:** `zazteck-fbr-2025-secure-key-<?php echo md5('zazteck.com'); ?>`
- **Seller NTN:** 5419764

---

## 📤 Step 1: Upload to GoDaddy

### Via cPanel:

1. **Login to GoDaddy**
   - Go to: https://godaddy.com
   - Login → My Products → Web Hosting → Manage

2. **Open cPanel**
   - Click "cPanel Admin"

3. **File Manager**
   - Files section → File Manager
   - Navigate to `public_html`

4. **Create Folder**
   - Click "+ Folder"
   - Name: `fbr-api`
   - Click "Create New Folder"

5. **Upload Files**
   - Open `fbr-api` folder
   - Click "Upload"
   - Upload:
     - ✅ `fbr-proxy.php`
     - ✅ `test-proxy.html`

6. **Set Permissions**
   - Right-click `fbr-proxy.php` → Permissions → 644
   - Right-click `test-proxy.html` → Permissions → 644

---

## ✅ Step 2: Test the Proxy

### Open Test Page:
```
https://zazteck.com/fbr-api/test-proxy.html
```

### Test Configuration:
- **Endpoint:** Validate (Sandbox)
- **FBR Token:** `07de2afc-caed-3215-900b-b01720619ca4`
- **Seller NTN:** `5419764`
- **Seller Name:** `Zazteck`
- **Province:** Punjab
- **Address:** Lahore

### Click "🚀 Test FBR API"

### Expected Success Response:
```json
{
  "dated": "2025-11-12 ...",
  "validationResponse": {
    "statusCode": "00",
    "status": "Valid",
    "error": "",
    "invoiceStatuses": [{
      "itemSNo": "1",
      "statusCode": "00",
      "status": "Valid",
      "error": ""
    }]
  }
}
```

---

## 🔧 Step 3: Test with cURL

```bash
curl -X POST https://zazteck.com/fbr-api/fbr-proxy.php \
  -H "Content-Type: application/json" \
  -H "X-API-Key: zazteck-fbr-2025-secure-key-$(echo -n 'zazteck.com' | md5sum | cut -d' ' -f1)" \
  -d '{
    "endpoint": "validate",
    "token": "07de2afc-caed-3215-900b-b01720619ca4",
    "data": {
      "invoiceType": "Sale Invoice",
      "invoiceDate": "2025-11-12",
      "sellerNTNCNIC": "5419764",
      "sellerBusinessName": "Zazteck",
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
        "productDescription": "Test Product",
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

## 💻 Step 4: Integrate with Your Next.js App

### Add Environment Variables

**File:** `.env.local`
```env
# FBR Proxy Configuration
FBR_PROXY_URL=https://zazteck.com/fbr-api/fbr-proxy.php
FBR_PROXY_API_KEY=zazteck-fbr-2025-secure-key-[generated-hash]

# FBR Tokens
FBR_SANDBOX_TOKEN=07de2afc-caed-3215-900b-b01720619ca4
FBR_PRODUCTION_TOKEN=your-production-token-here

# Seller Information
SELLER_NTN=5419764
SELLER_BUSINESS_NAME=Zazteck
SELLER_PROVINCE=Punjab
SELLER_ADDRESS=Lahore
```

### Copy Client Library

```bash
cp fbr-client.ts your-nextjs-app/lib/
```

### Create API Route

**File:** `app/api/fbr/validate/route.ts`
```typescript
import { FBRProxyClient } from '@/lib/fbr-client';

const fbrClient = new FBRProxyClient({
  proxyUrl: process.env.FBR_PROXY_URL!,
  apiKey: process.env.FBR_PROXY_API_KEY!
});

export async function POST(request: Request) {
  try {
    const { invoiceData, environment = 'sandbox' } = await request.json();
    
    const token = environment === 'production' 
      ? process.env.FBR_PRODUCTION_TOKEN!
      : process.env.FBR_SANDBOX_TOKEN!;
    
    const result = await fbrClient.validateInvoice(token, invoiceData);
    
    return Response.json(result);
  } catch (error: any) {
    console.error('FBR Validation Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/fbr/post/route.ts`
```typescript
import { FBRProxyClient } from '@/lib/fbr-client';

const fbrClient = new FBRProxyClient({
  proxyUrl: process.env.FBR_PROXY_URL!,
  apiKey: process.env.FBR_PROXY_API_KEY!
});

export async function POST(request: Request) {
  try {
    const { invoiceData, environment = 'sandbox' } = await request.json();
    
    const token = environment === 'production' 
      ? process.env.FBR_PRODUCTION_TOKEN!
      : process.env.FBR_SANDBOX_TOKEN!;
    
    const result = await fbrClient.postInvoice(token, invoiceData);
    
    return Response.json(result);
  } catch (error: any) {
    console.error('FBR Post Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Use in Components

```typescript
// Example: Validate invoice
const validateInvoice = async (invoiceData: any) => {
  const response = await fetch('/api/fbr/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoiceData,
      environment: 'sandbox' // or 'production'
    })
  });
  
  return await response.json();
};

// Example: Post invoice
const postInvoice = async (invoiceData: any) => {
  const response = await fetch('/api/fbr/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoiceData,
      environment: 'sandbox' // or 'production'
    })
  });
  
  return await response.json();
};
```

---

## 📊 Monitoring

### Check Logs via cPanel:

1. **File Manager** → `public_html/fbr-api/`
2. **View Logs:**
   - `fbr-requests.log` - All successful requests
   - `fbr-errors.log` - Error logs

### Log Format:
```
[2025-11-12 10:30:00] validate - HTTP 200 - IP: 1.2.3.4
```

---

## 🔐 Security

### Your API Key:
```
zazteck-fbr-2025-secure-key-[auto-generated-hash]
```

### To Change API Key:

Edit `fbr-proxy.php` line 10:
```php
define('API_KEY', 'your-new-super-secret-key-here');
```

### Production Security Checklist:

- [ ] Change default API key
- [ ] Verify CORS origin is correct
- [ ] Test with cURL
- [ ] Monitor logs regularly
- [ ] Keep FBR tokens secure
- [ ] Use HTTPS only

---

## 🐛 Troubleshooting

### Error: "Unauthorized"
✅ Check API key in both proxy and client  
✅ Verify `X-API-Key` header is sent

### Error: "CORS"
✅ Check `ALLOWED_ORIGIN` in fbr-proxy.php  
✅ Should be: `https://zazteck.com`

### Error: "File not found"
✅ Verify path: `public_html/fbr-api/fbr-proxy.php`  
✅ Check file permissions (644)

### Error: "Connection timeout"
✅ FBR API might be down  
✅ Check GoDaddy can reach FBR  
✅ Increase timeout in proxy

---

## ✅ Go Live Checklist

- [ ] Files uploaded to GoDaddy
- [ ] Permissions set (644)
- [ ] Test page works
- [ ] cURL test successful
- [ ] API key configured
- [ ] Environment variables set
- [ ] Next.js integration tested
- [ ] Logs are working
- [ ] Production token obtained
- [ ] GoDaddy IP whitelisted with FBR

---

## 🎉 Success!

Your FBR proxy is now live at:

**Proxy:** https://zazteck.com/fbr-api/fbr-proxy.php  
**Test:** https://zazteck.com/fbr-api/test-proxy.html

**Benefits:**
✅ GoDaddy's whitelisted IP for all FBR calls  
✅ Next.js app can be hosted anywhere  
✅ Secure with API key authentication  
✅ Multiple apps can use same proxy  
✅ Simple maintenance  

**Ready to process FBR invoices!** 🚀

---

**Company:** Zazteck  
**Domain:** https://zazteck.com  
**NTN:** 5419764
