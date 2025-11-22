# QA Automation Testing Guide

## Overview
Comprehensive test suite for the SaaS Invoice Management System using Playwright.

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts       # Authentication tests
│   ├── invoices.spec.ts   # Invoice management tests
│   ├── inventory.spec.ts  # Inventory tests
│   ├── customers.spec.ts  # Customer management tests
│   └── super-admin.spec.ts # Super admin tests
├── api/                    # API tests
│   └── api-tests.spec.ts
├── visual/                 # Visual regression tests
│   └── visual-regression.spec.ts
├── performance/            # Performance tests
│   └── load-tests.spec.ts
├── pages/                  # Page Object Models
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── InvoicePage.ts
│   ├── InventoryPage.ts
│   └── CustomerPage.ts
└── fixtures/               # Test data
    └── test-data.ts
```

## Setup

1. Install Playwright browsers:
```bash
npx playwright install
```

2. Configure test environment:
```bash
cp .env.test .env.test.local
# Edit .env.test.local with your test credentials
```

3. Start the development server:
```bash
npm run dev
```

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run specific test suite
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests with video recording
```bash
npx playwright test --video=on
```

## Test Reports

### View HTML report
```bash
npx playwright show-report
```

### Generate and view trace
```bash
npx playwright test --trace=on
npx playwright show-trace trace.zip
```

## Video Recording

Tests automatically record videos on failure. To record all tests:

```bash
npx playwright test --video=on
```

Videos are saved in `test-results/` directory.

## Test Data

Update test credentials in `tests/fixtures/test-data.ts`:
- Super admin credentials
- Seller credentials
- Sample customer data
- Sample product data

## Best Practices

1. Use Page Object Model for maintainability
2. Keep tests independent and isolated
3. Use meaningful test descriptions
4. Clean up test data after tests
5. Use proper waits (avoid hardcoded timeouts)
6. Take screenshots on failures
7. Use fixtures for test data

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npx playwright test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: test-results/
```

## Troubleshooting

### Tests failing locally
- Ensure dev server is running
- Check test credentials in .env.test.local
- Clear browser cache: `npx playwright test --clear-cache`

### Slow tests
- Run tests in parallel: `npx playwright test --workers=4`
- Use `networkidle` sparingly
- Optimize selectors

### Flaky tests
- Add proper waits
- Use `waitForSelector` instead of `waitForTimeout`
- Check for race conditions
