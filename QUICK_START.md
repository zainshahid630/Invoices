# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Copy Environment File
```bash
cp .env.example .env.local
```
✅ **Already done!** Your Supabase credentials are configured.

### Step 2: Run Database Setup

1. Go to your Supabase project: https://dosecswlefagrerrgmsc.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `database/complete-setup.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

**That's it!** Your database is now set up with:
- ✅ 12 tables
- ✅ All indexes
- ✅ Row Level Security
- ✅ Auto-generated invoice numbers
- ✅ Stock tracking
- ✅ All triggers and functions

### Step 3: (Optional) Add Test Data

If you want sample data for testing:
1. In Supabase SQL Editor, create another new query
2. Copy and paste the contents of `database/seed-data.sql`
3. Click **Run**

This adds:
- 2 test companies
- Test users
- Sample products
- Sample customers

### Step 4: Upgrade Node.js (if needed)

Check your Node version:
```bash
node --version
```

If it's less than v18.17.0:
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

### Step 5: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser! 🎉

---

## 📁 Project Structure

```
Saas-Invoices/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── database/              # All SQL files
│   ├── complete-setup.sql # 👈 Run this first!
│   ├── seed-data.sql      # Optional test data
│   ├── schema.sql         # Individual: tables
│   ├── rls-policies.sql   # Individual: security
│   ├── functions-triggers.sql # Individual: automation
│   └── README.md          # Database docs
├── .env.example           # ✅ Configured with your Supabase
├── .env.local             # Create this (copy from .env.example)
├── PROJECT_PLAN.md        # Complete feature plan
├── SETUP_GUIDE.md         # Detailed setup guide
├── PROGRESS.md            # Progress tracker
└── README.md              # Project overview
```

---

## 🎯 What's Next?

### Phase 2: Database Schema ✅ (Ready to run!)
- SQL files are ready in `database/` folder
- Just run `complete-setup.sql` in Supabase

### Phase 3: Start Building Features
Choose what to build first:
1. **Super Admin Module** - Company management
2. **Seller Authentication** - Login system
3. **Inventory Management** - Products & stock
4. **Customer Management** - Customer CRUD
5. **Invoice System** - Create invoices

See `PROJECT_PLAN.md` for detailed specifications.

---

## 🔧 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter

# Database (in Supabase SQL Editor)
# Run: database/complete-setup.sql
# Run: database/seed-data.sql (optional)
```

---

## 📚 Documentation

- **Quick Start**: This file
- **Setup Guide**: `SETUP_GUIDE.md` - Detailed instructions
- **Project Plan**: `PROJECT_PLAN.md` - All features & specs
- **Progress**: `PROGRESS.md` - What's done, what's next
- **Database**: `database/README.md` - Database docs
- **README**: `README.md` - Project overview

---

## ⚡ Test Credentials (After running seed-data.sql)

### Super Admin
- Email: `admin@saas-invoices.com`
- Password: `admin123` (change in production!)

### Test Company 1: ABC Electronics
- Email: `admin@abc-electronics.com`
- Password: `seller123`

### Test Company 2: XYZ Traders
- Email: `admin@xyz-traders.com`
- Password: `seller123`

**⚠️ Important**: These are test credentials. Change them before production!

---

## 🐛 Troubleshooting

### "Node.js version >= v18.17.0 is required"
**Solution**: Upgrade Node.js (see Step 4 above)

### "Port 3000 is already in use"
**Solution**: 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Database connection errors
**Solution**: 
1. Check `.env.local` exists (copy from `.env.example`)
2. Verify Supabase credentials are correct
3. Ensure Supabase project is active

### Tables already exist error
**Solution**: Tables were already created. You can:
- Skip running `complete-setup.sql` again
- Or drop tables first (⚠️ loses data!)

---

## 🎨 Features Overview

### ✅ Ready Now
- Project structure
- Database schema
- Multi-tenant architecture
- Auto-generated invoice numbers
- Stock tracking system
- Row Level Security

### 🚧 To Build (See PROJECT_PLAN.md)
- Super admin dashboard
- Seller authentication
- Product management UI
- Customer management UI
- Invoice creation UI
- Payment tracking
- Reports & analytics
- FBR integration

---

## 📞 Need Help?

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Review `database/README.md` for database issues
3. See `PROJECT_PLAN.md` for feature specifications
4. Check Supabase logs: Dashboard → Logs

---

## 🎉 You're All Set!

Your SaaS Invoice Management System is ready to go!

**Next Steps:**
1. ✅ Run `database/complete-setup.sql` in Supabase
2. ✅ Start dev server: `npm run dev`
3. ✅ Start building features!

Happy coding! 🚀

