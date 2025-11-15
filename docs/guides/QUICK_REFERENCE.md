# Quick Reference Card

## 🔑 Login Credentials

### Super Admin
```
URL: http://localhost:3000/super-admin/login
Email: admin@saas-invoice.com
Password: SuperAdmin@123
```

---

## 🚀 Quick Start Commands

```bash
# 1. Copy environment file
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---

## 📊 Database Setup

### Run in Supabase SQL Editor:

```sql
-- 1. Complete database setup (tables, RLS, triggers)
database/complete-setup.sql

-- 2. Create super admin account
database/create-super-admin.sql

-- 3. (Optional) Add test data
database/seed-data.sql
```

---

## 🗺️ URL Routes

### Super Admin Routes
- `/super-admin/login` - Login page
- `/super-admin/dashboard` - Main dashboard
- `/super-admin/companies/new` - Create company
- `/super-admin/companies/[id]` - Company details
- `/super-admin/companies/[id]/subscription` - Manage subscription
- `/super-admin/companies/[id]/features` - Feature toggles

### API Routes
- `POST /api/auth/super-admin/login` - Login
- `GET /api/super-admin/companies` - List companies
- `POST /api/super-admin/companies` - Create company
- `GET /api/super-admin/companies/[id]` - Get company
- `PATCH /api/super-admin/companies/[id]` - Update company
- `GET /api/super-admin/companies/[id]/subscription` - Get subscription
- `POST /api/super-admin/companies/[id]/subscription` - Create subscription
- `GET /api/super-admin/companies/[id]/features` - Get features
- `POST /api/super-admin/companies/[id]/features` - Toggle feature

---

## 📁 Key Files

### Configuration
- `.env.local` - Environment variables
- `lib/supabase.ts` - Supabase client
- `lib/auth.ts` - Authentication logic

### Database
- `database/complete-setup.sql` - Full DB setup
- `database/create-super-admin.sql` - Create admin
- `database/schema.sql` - Tables only
- `database/rls-policies.sql` - Security only
- `database/functions-triggers.sql` - Automation only

### Documentation
- `SUPER_ADMIN_GUIDE.md` - Complete guide
- `SUPER_ADMIN_COMPLETE.md` - Summary
- `QUICK_START.md` - Quick start
- `DATABASE_REFERENCE.md` - DB reference
- `PROGRESS.md` - Progress tracker

---

## 🎯 Common Tasks

### Create a Company
1. Login as super admin
2. Click "Add New Company"
3. Fill in details
4. Click "Create Company"

### Manage Subscription
1. Go to company detail page
2. Click "Manage Subscription"
3. Set dates and amount
4. Set status
5. Click "Save"

### Toggle Features
1. Go to company detail page
2. Click "Feature Toggles"
3. Toggle features on/off
4. Changes are instant

### Activate/Deactivate Company
1. Go to dashboard
2. Find company in table
3. Click "Activate" or "Deactivate"

---

## 🔧 Troubleshooting

### Can't login?
```sql
-- Check if super admin exists
SELECT * FROM super_admins;

-- If not, run:
database/create-super-admin.sql
```

### Database connection error?
```bash
# Check .env.local exists
ls -la .env.local

# Verify Supabase credentials
cat .env.local
```

### Port already in use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

## 📦 Dependencies

```json
{
  "@supabase/supabase-js": "Latest",
  "bcryptjs": "Latest",
  "@types/bcryptjs": "Latest",
  "next": "14.2.33",
  "react": "18",
  "typescript": "5"
}
```

---

## 🗄️ Database Tables

1. `super_admins` - Super admin users
2. `companies` - Seller companies
3. `subscriptions` - Subscription tracking
4. `users` - Seller users
5. `products` - Product inventory
6. `stock_history` - Stock changes
7. `customers` - Customer database
8. `invoices` - Invoice headers
9. `invoice_items` - Invoice line items
10. `payments` - Payment records
11. `settings` - Company settings
12. `feature_toggles` - Feature access

---

## ✅ Features Checklist

### Super Admin Module ✅
- [x] Authentication system
- [x] Company management
- [x] Subscription management
- [x] Feature toggles
- [x] Data isolation

### Seller Module ⏳
- [ ] Seller authentication
- [ ] Seller dashboard
- [ ] Analytics

### Inventory Module ⏳
- [ ] Product CRUD
- [ ] Stock management
- [ ] Stock history

### Customer Module ⏳
- [ ] Customer CRUD
- [ ] Payment tracking
- [ ] Invoice history

### Invoice Module ⏳
- [ ] Invoice creation
- [ ] FBR integration
- [ ] PDF generation

---

## 🎨 Available Features (Toggle)

1. **Inventory Management** - Manage products and stock
2. **Customer Management** - Manage customer database
3. **Invoice Creation** - Create and manage invoices
4. **FBR Integration** - Post invoices to FBR
5. **Payment Tracking** - Track customer payments
6. **Reports & Analytics** - View business reports
7. **Multi-User Access** - Multiple users per company

---

## 📞 Support

### Documentation
- `SUPER_ADMIN_GUIDE.md` - Full guide
- `DATABASE_REFERENCE.md` - DB help
- `QUICK_START.md` - Getting started

### Check Logs
- Browser Console (F12)
- Network Tab (API calls)
- Supabase Dashboard → Logs

---

## 🎉 Quick Win

```bash
# 1. Setup
cp .env.example .env.local

# 2. Run SQL in Supabase
database/complete-setup.sql
database/create-super-admin.sql

# 3. Start app
npm run dev

# 4. Login
# URL: http://localhost:3000/super-admin/login
# Email: admin@saas-invoice.com
# Password: SuperAdmin@123

# 5. Create your first company!
```

---

**You're ready to go!** 🚀

