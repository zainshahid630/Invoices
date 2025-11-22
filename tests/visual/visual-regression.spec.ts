import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testData } from '../fixtures/test-data';

test.describe('Visual Regression Tests', () => {
  test('should match login page screenshot', async ({ page }) => {
    await page.goto('/seller/login');
    await expect(page).toHaveScreenshot('login-page.png');
  });



  test('should match invoice page screenshot', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForURL('**/seller/dashboard');
    await page.goto('/seller/invoices');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('invoices-page.png');
  });

  test('should match inventory page screenshot', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForURL('**/seller/dashboard');
    await page.goto('/seller/products');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('inventory-page.png');
  });
});
