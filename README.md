# SaaS Invoices

## Overview
SaaS Invoices is a Next.js application designed for managing invoices, customers, and subscriptions. It features a comprehensive dashboard for super admins and sellers, invoice generation with multiple templates, and automated workflows.

## Tech Stack
- **Framework:** [Next.js 14](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** Supabase (PostgreSQL)
- **ORM/Querying:** @tanstack/react-query
- **Authentication:** Custom (to be verified)
- **Testing:** [Playwright](https://playwright.dev/)
- **Utilities:** Lucide React, Nodemailer, Puppeteer, QRCode

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd saas-invoices
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required values (Supabase URL, API keys, etc.)

### Running the Application
- **Development:**
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Production:**
  ```bash
  npm run build
  npm run start
  ```

## Scripts
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run test`: Runs Playwright end-to-end tests.

## Project Structure
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable React components.
- `lib/`: Utility functions, hooks, and shared logic.
- `database/`: Database connection and queries.
- `tests/`: Playwright test suites.
