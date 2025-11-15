# SaaS Invoice Management System

A comprehensive multi-tenant SaaS application for invoice management with inventory tracking, customer management, and FBR (Federal Board of Revenue) integration.

## Features

### Super Admin Module
- Company/Seller account creation and management
- Subscription management (period, amount, payment status)
- Feature toggle system (enable/disable features per seller)
- Complete data isolation between sellers

### Inventory Management
- Product CRUD operations with fields:
  - Product Name
  - HS Code
  - UOM (Unit of Measurement)
  - Unit Price
  - Warranty (in months)
  - Description (optional)
  - Stock Level
- Complete stock change history with timestamps
- Stock movement tracking

### Customer Management
- Customer CRUD operations with fields:
  - Customer Name
  - Business Name
  - Address
  - NTN Number/CNIC
  - GST Number
  - Province
  - Date Added
- Payment tracking (pending/completed)
- Invoice history per customer
- Business analytics per customer

### Sales Invoice System
- Invoice creation with:
  - Auto-generated date and invoice number (INV-2025-XXXXX)
  - Invoice types (Sales Tax Invoice, Debit Invoice)
  - Scenario selection
  - Tax calculations (Sales Tax, Further Tax)
  - Buyer details (searchable from customers or manual entry)
  - Line items (from inventory or manual entry)
- Invoice status management:
  - FBR Posted
  - Verified
  - Paid
  - Deleted
- Invoice PDF generation
- Separate tabs for each status

### Seller Settings
- Company profile management
- Business details (Name, Address, NTN, GST, FBR Token)
- Logo upload
- Invoice template customization

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd Saas-Invoices
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your Supabase credentials.

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The database schema includes the following tables:

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

See `PROJECT_PLAN.md` for detailed schema information.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── (super-admin)/     # Super admin routes
│   ├── (seller)/          # Seller routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
├── lib/                   # Utility functions
├── types/                 # TypeScript types
├── public/                # Static assets
└── PROJECT_PLAN.md        # Detailed project plan
\`\`\`

## Development Phases

- [x] Phase 1: Project Setup & Foundation
- [ ] Phase 2: Database Schema Design
- [ ] Phase 3: Super Admin Module
- [ ] Phase 4: Seller Authentication & Dashboard
- [ ] Phase 5: Inventory Management
- [ ] Phase 6: Customer Management
- [ ] Phase 7: Invoice System
- [ ] Phase 8: Settings & Configuration

## Contributing

Please refer to `PROJECT_PLAN.md` for the complete development roadmap and feature specifications.

## License

MIT

---

**Developed by Zain Shahid** | [GitHub](https://github.com/zainshahid630)

