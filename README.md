# InvoiceFBR - FBR Compliant Invoicing Software

Pakistan's leading FBR-compliant invoicing software. Create professional invoices, automate FBR posting, manage customers & inventory.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── seller/            # Seller dashboard
│   ├── blog/              # Blog pages
│   └── ...
├── components/            # React components
├── lib/                   # Utilities & helpers
├── public/                # Static assets
├── docs/                  # Documentation
│   ├── performance/       # Performance optimization guides
│   └── archive/           # Old documentation
└── tests/                 # Test files
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3001

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id

# JazzCash (optional)
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_salt
```

## 🎯 Features

- ✅ FBR-compliant invoice generation
- ✅ Automatic FBR posting with QR codes
- ✅ Customer & product management
- ✅ WhatsApp integration
- ✅ Multiple invoice templates
- ✅ Payment tracking
- ✅ Reports & analytics
- ✅ Multi-user support

## 📊 Performance

Recent optimizations:
- 5x capacity increase (50-100 req/sec)
- 95% reduction in database load
- Sub-second response times
- Rate limiting & caching enabled

See `docs/performance/` for details.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:invoices
npm run test:api

# Load testing
artillery run load-test-simple.yml
```

## 🚀 Deployment

### Using PM2 (Recommended)

```bash
# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

### Manual Deployment

```bash
npm run build
npm run start:prod
```

## 📖 Documentation

- [Performance Optimization](docs/performance/APPLY_FIXES_NOW.md)
- [Deployment Guide](docs/performance/DEPLOYMENT_OPTIMIZATIONS.md)
- [Database Setup](docs/performance/database-indexes.sql)

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **State Management:** React Query
- **Testing:** Playwright
- **Deployment:** PM2 + Nginx

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🤝 Support

For issues or questions:
- Email: info@zazteck.com
- Website: https://invoicefbr.com

## 📄 License

Copyright © 2024 Zazteck. All rights reserved.

---

Made with ❤️ in Pakistan 🇵🇰
