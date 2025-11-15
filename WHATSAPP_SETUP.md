# WhatsApp Integration Setup Guide

## 📱 FREE WhatsApp Integration for Invoice System

This integration allows super-admin to connect their WhatsApp number and send invoices automatically.

## 🚀 Installation Steps

### 1. Install Required Packages

```bash
npm install whatsapp-web.js qrcode
```

### 2. Install Chromium Dependencies (if not already installed)

**For Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y \
  chromium-browser \
  libgbm-dev \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm-dev \
  libxkbcommon-dev \
  libxcomposite-dev \
  libxdamage-dev \
  libxrandr-dev \
  libgbm-dev \
  libpango-1.0-0 \
  libcairo2 \
  libasound2
```

**For macOS:**
```bash
# Chromium is included with puppeteer, no additional installation needed
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Access WhatsApp Settings

1. Login as Super Admin
2. Click on "📱 WhatsApp" in the navigation
3. Click "Connect WhatsApp"
4. Scan the QR code with your WhatsApp mobile app

## 📋 How to Scan QR Code

1. Open WhatsApp on your phone
2. Tap Menu (⋮) or Settings
3. Tap "Linked Devices"
4. Tap "Link a Device"
5. Point your phone at the QR code on screen

## ✨ Features

- ✅ **FREE** - No monthly fees or per-message costs
- ✅ **Easy Setup** - Just scan QR code once
- ✅ **Automatic Sending** - Send invoices with one click
- ✅ **PDF Attachments** - Attach invoice PDFs automatically
- ✅ **Custom Templates** - Customize message templates
- ✅ **Delivery Tracking** - Track message delivery status

## 🔧 Configuration

### Environment Variables (Optional)

Add to your `.env.local` file:

```env
# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./.wwebjs_auth
```

## 📁 Files Created

```
app/
├── super-admin/
│   └── whatsapp/
│       └── page.tsx                    # WhatsApp settings page
├── api/
│   └── whatsapp/
│       ├── status/route.ts             # Check connection status
│       ├── connect/route.ts            # Initialize connection
│       ├── disconnect/route.ts         # Disconnect WhatsApp
│       └── send/route.ts               # Send messages (to be created)
lib/
└── whatsapp.ts                         # WhatsApp service
```

## ⚠️ Important Notes

1. **Keep Server Running**: The WhatsApp connection requires the server to stay running
2. **QR Code Expiry**: QR codes expire after 60 seconds - refresh if needed
3. **Re-scanning**: You may need to re-scan occasionally if connection drops
4. **Phone Connection**: Don't logout from WhatsApp on your phone
5. **Session Data**: Session data is stored in `.wwebjs_auth` folder

## 🐛 Troubleshooting

### QR Code Not Showing
- Check if Chromium is installed
- Check server logs for errors
- Try refreshing the page

### Connection Drops
- Check internet connection
- Ensure phone has WhatsApp running
- Re-scan QR code

### "Puppeteer Error"
```bash
# Install missing dependencies
npm install puppeteer
```

## 🔒 Security

- Session data is stored locally in `.wwebjs_auth`
- Add `.wwebjs_auth` to `.gitignore`
- Only super-admin can access WhatsApp settings
- Connection is encrypted end-to-end by WhatsApp

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Ensure all dependencies are installed

## 🎯 Next Steps

After setup is complete:
1. Test sending a message
2. Configure message templates
3. Add "Send via WhatsApp" button to invoices
4. Set up automatic invoice sending

---

**Cost:** Completely FREE ✨
**Setup Time:** 5-10 minutes
**Maintenance:** Minimal (re-scan QR occasionally)
