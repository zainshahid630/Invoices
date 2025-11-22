# Video Recording Guide for QA Testing

## Automated Video Recording with Playwright

### Configuration
Videos are automatically recorded based on the configuration in `playwright.config.ts`:

```typescript
use: {
  video: 'retain-on-failure',  // Records video only when test fails
}
```

### Recording Options

#### 1. Record on Failure (Default)
```bash
npx playwright test
```
Videos saved only when tests fail.

#### 2. Record All Tests
```bash
npx playwright test --video=on
```
Records every test execution.

#### 3. Record Specific Test
```bash
npx playwright test tests/e2e/invoices.spec.ts --video=on
```

### Video Output Location
Videos are saved in: `test-results/<test-name>/video.webm`

## Creating Demo Videos

### Option 1: Using Playwright Trace Viewer
Best for detailed step-by-step demonstrations.

```bash
# Run tests with trace
npx playwright test --trace=on

# View trace (includes video, screenshots, network)
npx playwright show-trace test-results/<test-name>/trace.zip
```

### Option 2: Screen Recording During Test Execution

#### macOS
```bash
# Start recording
npx playwright test --headed --video=on

# Use QuickTime or built-in screen recorder
# Cmd + Shift + 5 to start screen recording
```

#### Windows
```bash
# Use Windows Game Bar
# Win + G to start recording
npx playwright test --headed --video=on
```

#### Linux
```bash
# Install SimpleScreenRecorder or use ffmpeg
npx playwright test --headed --video=on
```

### Option 3: Create Custom Recording Script

Create `scripts/record-demo.ts`:

```typescript
import { chromium } from '@playwright/test';

async function recordDemo() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Slow down actions for better visibility
  });
  
  const context = await browser.newContext({
    recordVideo: {
      dir: 'demo-videos/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  // Your demo script here
  await page.goto('http://localhost:3000');
  await page.fill('input[type="email"]', 'demo@test.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL('**/seller/**');
  
  // Navigate through features
  await page.click('text=Invoices');
  await page.waitForTimeout(2000);
  
  await page.click('text=Inventory');
  await page.waitForTimeout(2000);
  
  await page.click('text=Customers');
  await page.waitForTimeout(2000);
  
  await context.close();
  await browser.close();
}

recordDemo();
```

Run it:
```bash
npx ts-node scripts/record-demo.ts
```

## Demo Video Checklist

### 1. Authentication Flow
- [ ] Login page
- [ ] Successful login
- [ ] Dashboard view
- [ ] Logout

### 2. Invoice Management
- [ ] View invoice list
- [ ] Create new invoice
- [ ] Select customer
- [ ] Add products
- [ ] Calculate taxes
- [ ] Save invoice
- [ ] Download PDF
- [ ] Filter by status

### 3. Inventory Management
- [ ] View products
- [ ] Add new product
- [ ] Edit product
- [ ] View stock history
- [ ] Search products

### 4. Customer Management
- [ ] View customers
- [ ] Add new customer
- [ ] Edit customer
- [ ] View customer details
- [ ] Search customers

### 5. Super Admin Features
- [ ] Company management
- [ ] Subscription management
- [ ] Feature toggles
- [ ] Analytics dashboard

## Video Editing Tips

### Recommended Tools
- **Free**: DaVinci Resolve, Shotcut, OpenShot
- **Paid**: Adobe Premiere Pro, Final Cut Pro, Camtasia

### Editing Checklist
1. Add intro slide with app name
2. Add text overlays for feature names
3. Highlight cursor/clicks
4. Add background music (optional)
5. Speed up slow parts (2x)
6. Add transitions between sections
7. Add outro with contact info
8. Export in 1080p MP4

### Video Structure
```
00:00 - Intro
00:10 - Login & Authentication
00:30 - Dashboard Overview
01:00 - Invoice Management Demo
02:30 - Inventory Management Demo
03:30 - Customer Management Demo
04:30 - Super Admin Features
05:30 - Outro
```

## Sharing Videos

### For Clients
- Upload to YouTube (unlisted)
- Share via Google Drive/Dropbox
- Embed in documentation

### For Team
- Store in project repository (if small)
- Use Loom for quick demos
- Share via Slack/Teams

## Automated Video Generation Script

Create `scripts/generate-demo-videos.sh`:

```bash
#!/bin/bash

echo "Generating demo videos..."

# Authentication demo
npx playwright test tests/e2e/auth.spec.ts --headed --video=on --project=chromium

# Invoice demo
npx playwright test tests/e2e/invoices.spec.ts --headed --video=on --project=chromium

# Inventory demo
npx playwright test tests/e2e/inventory.spec.ts --headed --video=on --project=chromium

# Customer demo
npx playwright test tests/e2e/customers.spec.ts --headed --video=on --project=chromium

echo "Videos saved in test-results/"
```

Make it executable:
```bash
chmod +x scripts/generate-demo-videos.sh
./scripts/generate-demo-videos.sh
```

## Tips for Better Demo Videos

1. **Clean Test Data**: Use realistic, professional-looking test data
2. **Slow Motion**: Use `slowMo` option to make actions visible
3. **Annotations**: Add text overlays explaining each step
4. **Resolution**: Record in 1920x1080 for clarity
5. **Browser**: Use Chrome for best compatibility
6. **Narration**: Consider adding voiceover explaining features
7. **Length**: Keep videos under 5 minutes per feature
8. **Branding**: Add company logo and colors

## Example: Complete Demo Recording

```bash
# 1. Start dev server
npm run dev

# 2. Record with slow motion for better visibility
npx playwright test --headed --video=on --slow-mo=500

# 3. Find videos in test-results/
# 4. Edit and compile into final demo video
# 5. Upload and share
```
