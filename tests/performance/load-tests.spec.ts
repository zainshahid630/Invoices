import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testData } from '../fixtures/test-data';

test.describe('Performance Tests', () => {
  test('should load dashboard within acceptable time', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    
    const startTime = Date.now();
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForURL('**/seller/dashboard');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should load invoice list efficiently', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForURL('**/seller/dashboard');
    
    const startTime = Date.now();
    await page.goto('/seller/invoices');
    await page.waitForSelector('table');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle pagination efficiently', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForURL('**/seller/dashboard');
    await page.goto('/seller/invoices');
    
    const startTime = Date.now();
    await page.locator('button:has-text("Next")').click();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(1500);
  });
});
