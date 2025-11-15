# SaaS Invoice Management System - Project Plan

## Project Overview
A multi-tenant SaaS application for invoice management with inventory tracking, customer management, and FBR (Federal Board of Revenue) integration.

## Tech Stack (Recommended)
- **Frontend**: Next.js 14+ (React with TypeScript)
- **Backend**: Next.js API Routes / Node.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

---

## Feature Modules

### 1. Super Admin Module
- [ ] Super admin authentication system
- [ ] Company/Seller account creation
- [ ] Seller management dashboard
- [ ] Subscription management
  - [ ] Subscription period tracking
  - [ ] Amount tracking
  - [ ] Payment status
- [ ] Feature toggle system (enable/disable features per seller)
- [ ] Seller isolation (data segregation)

### 2. Inventory/Stock Management Module
- [ ] Product CRUD operations
- [ ] Product fields:
  - [ ] Product Name
  - [ ] HS Code
  - [ ] UOM (Unit of Measurement)
  - [ ] Unit Price
  - [ ] Warranty (in months)
  - [ ] Description (optional)
  - [ ] Current Stock Level
- [ ] Product detail page
- [ ] Stock change history with timestamps
- [ ] Stock movement tracking (in/out with reasons)

### 3. Customer Management Module
- [ ] Customer CRUD operations
- [ ] Customer fields:
  - [ ] Customer Name
  - [ ] Business Name
  - [ ] Address
  - [ ] NTN Number/CNIC
  - [ ] GST Number
  - [ ] Province
  - [ ] Date Added (auto-generated)
- [ ] Customer detail page
- [ ] Payment records (pending/completed)
  - [ ] Customer's pending payments
  - [ ] Our pending payments to customer
- [ ] Invoice history per customer
- [ ] Business analytics per customer

### 4. Sales Invoice Module
- [ ] Invoice creation page
- [ ] Invoice fields:
  - [ ] Date (auto-filled with today's date)
  - [ ] Invoice Type dropdown (Sales Tax Invoice, Debit Invoice)
  - [ ] Invoice Reference No. (Format: INV-2025-XXXXX, auto-generated)
  - [ ] Scenario selection dropdown
  - [ ] Sales Tax Value (required)
  - [ ] Further Tax Value (optional)
- [ ] Buyer details section:
  - [ ] Searchable customer dropdown
  - [ ] Auto-fill from saved customers
  - [ ] Manual entry option
  - [ ] Fields: NTN/CNIC, Business Name, Address, Province
- [ ] Line items section:
  - [ ] Product dropdown (from inventory)
  - [ ] Auto-fill: Name, HS Code, Unit Price, UOM
  - [ ] Manual entry option
  - [ ] Quantity input
  - [ ] Line total calculation
- [ ] Tax calculations
- [ ] Grand total calculation
- [ ] Create Invoice button

### 5. Invoice Management Module
- [ ] Invoice listing with filters
- [ ] Invoice status system:
  - [ ] FBR Posted
  - [ ] Verified
  - [ ] Paid
  - [ ] Deleted
- [ ] Separate tabs for each status
- [ ] Invoice detail view
- [ ] Invoice edit functionality
- [ ] Invoice PDF generation
- [ ] Invoice status updates

### 6. Seller Settings Module
- [ ] Seller profile management
- [ ] Seller details:
  - [ ] Name
  - [ ] Address
  - [ ] Business Name
  - [ ] NTN Number
  - [ ] GST Number
  - [ ] FBR Token
- [ ] Company logo upload
- [ ] Invoice template customization

### 7. Authentication & Authorization
- [ ] Multi-tenant architecture
- [ ] Super admin authentication
- [ ] Seller authentication
- [ ] Role-based access control (RBAC)
- [ ] Data isolation per seller

### 8. Dashboard & Analytics
- [ ] Seller dashboard
- [ ] Sales overview
- [ ] Pending payments summary
- [ ] Stock alerts
- [ ] Recent invoices
- [ ] Revenue analytics

---

## Database Schema (High-Level)

### Core Tables
1. **super_admins** - Super admin users
2. **companies** - Seller/Company accounts
3. **subscriptions** - Subscription details per company
4. **users** - Seller users (linked to companies)
5. **products** - Product/inventory master
6. **stock_history** - Stock movement tracking
7. **customers** - Customer master
8. **invoices** - Invoice header
9. **invoice_items** - Invoice line items
10. **payments** - Payment records
11. **settings** - Company-specific settings
12. **feature_toggles** - Feature access per company

---

## Development Phases

### Phase 1: Project Setup & Foundation
- [ ] Initialize Next.js project
- [ ] Setup Supabase project
- [ ] Configure authentication
- [ ] Setup database schema
- [ ] Install and configure UI libraries
- [ ] Setup project structure

### Phase 2: Super Admin Module
- [ ] Super admin authentication
- [ ] Company management
- [ ] Subscription management
- [ ] Feature toggle system

### Phase 3: Core Seller Features
- [ ] Seller authentication
- [ ] Seller dashboard
- [ ] Settings page

### Phase 4: Inventory Management
- [ ] Product CRUD
- [ ] Stock tracking
- [ ] Stock history

### Phase 5: Customer Management
- [ ] Customer CRUD
- [ ] Customer detail page
- [ ] Payment tracking

### Phase 6: Invoice System
- [ ] Invoice creation
- [ ] Invoice listing
- [ ] Invoice status management
- [ ] PDF generation

### Phase 7: Analytics & Reporting
- [ ] Dashboard analytics
- [ ] Reports generation
- [ ] Export functionality

### Phase 8: Testing & Deployment
- [ ] Unit testing
- [ ] Integration testing
- [ ] Deployment setup
- [ ] Production launch

---

## Current Status
**Phase**: Phase 1 Complete ✓
**Next Step**: Setup Supabase and create database schema (Phase 2)

### Completed Tasks
- ✅ Next.js 14 project initialized with TypeScript
- ✅ Tailwind CSS configured
- ✅ ESLint configured
- ✅ Project structure created
- ✅ Basic routing setup
- ✅ Environment configuration template created
- ✅ Documentation created (README.md, PROJECT_PLAN.md)

### Important Notes
- **Node.js Requirement**: This project requires Node.js >= v18.17.0
- **Current Node Version**: v16.20.2 (needs upgrade)
- **Action Required**: Upgrade Node.js before running `npm run dev`

### Next Steps
1. Upgrade Node.js to v18.17.0 or higher
2. Create Supabase project
3. Configure environment variables in `.env.local`
4. Design and implement database schema
5. Set up Supabase authentication

---

## Notes
- FBR integration will require API documentation from FBR
- Invoice numbering should be sequential per company
- All monetary values should support PKR currency
- Province dropdown should include all Pakistani provinces
- Multi-tenant data isolation is critical for security

