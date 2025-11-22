import { chromium } from '@playwright/test';

async function recordDemo() {
  console.log('Starting demo recording...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800  // Slow down for better visibility
  });
  
  const context = await browser.newContext({
    recordVideo: {
      dir: 'demo-videos/',
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Login Demo
    console.log('Recording: Login flow...');
    await page.goto('http://localhost:3000/seller/login');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="text"]', 'Demo@invoice.com');
    await page.waitForTimeout(500);
    await page.fill('input[type="password"]', '123456');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/seller/dashboard', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // 2. Dashboard Overview
    console.log('Recording: Dashboard...');
    await page.waitForTimeout(2000);
    
    // 3. Invoice Management
    console.log('Recording: Invoice management...');
    await page.click('text=Invoices');
    await page.waitForTimeout(2000);
    
    // 4. Inventory Management
    console.log('Recording: Inventory management...');
    await page.click('text=Inventory');
    await page.waitForTimeout(2000);
    
    // 5. Customer Management
    console.log('Recording: Customer management...');
    await page.click('text=Customers');
    await page.waitForTimeout(2000);
    
    // 6. Settings
    console.log('Recording: Settings...');
    await page.click('text=Settings');
    await page.waitForTimeout(2000);
    
    console.log('Demo recording complete!');
    
  } catch (error) {
    console.error('Error during recording:', error);
  } finally {
    await context.close();
    await browser.close();
    console.log('Video saved in demo-videos/ directory');
  }
}

recordDemo();
