import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testData } from '../fixtures/test-data';

test.describe('Authentication Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/InvoiceFBR/i);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.login('invaliduser', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should successfully login with valid seller credentials', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await loginPage.login(testData.seller.username, testData.seller.password);
    await expect(page).toHaveURL(/\/seller\/dashboard/);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/01-dashboard.png', fullPage: false });

    await page.goto('/seller/products');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/02-products.png', fullPage: false });

    await page.goto('/seller/customers');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/03-customers.png', fullPage: false });

    await page.goto('/seller/invoices');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/04-invoices.png', fullPage: false });

    await page.goto('/seller/payments');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/05-payments.png', fullPage: false });

    await page.goto('/seller/reports');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/06-reports.png', fullPage: false });

    await page.goto('/seller/settings');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/07-settings-company.png', fullPage: false });
    
    const tabButtons = page.locator('button').filter({ hasText: 'Company Information' }).or(
      page.locator('button').filter({ hasText: 'Invoice Settings' })
    ).or(
      page.locator('button').filter({ hasText: 'Tax Configuration' })
    ).or(
      page.locator('button').filter({ hasText: 'WhatsApp' })
    ).or(
      page.locator('button').filter({ hasText: 'Email' })
    ).or(
      page.locator('button').filter({ hasText: 'Security' })
    ).or(
      page.locator('button').filter({ hasText: 'Templates' })
    ).or(
      page.locator('button').filter({ hasText: 'Preferences' })
    );
    
    const tabCount = await tabButtons.count();
    const tabNames = ['company', 'invoice', 'tax', 'whatsapp', 'email', 'security', 'templates', 'preferences'];
    for (let i = 0; i < tabCount; i++) {
      await tabButtons.nth(i).click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `screenshots/08-settings-${tabNames[i] || i}.png`, fullPage: false });
    }

    await page.goto('/seller/fbr-sandbox');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/09-fbr-sandbox.png', fullPage: false });
  });

  test('should logout successfully', async ({ page }) => {
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForTimeout(2000);
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await page.waitForTimeout(1000);
      // After logout, should redirect to login or home page
      await expect(page).toHaveURL(/\/(seller\/login|$)/);
    }
  });

  test('should display registration page', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/register');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/how-to-start.png', fullPage: false });
  });
});
