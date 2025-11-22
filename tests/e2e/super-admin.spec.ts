import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testData } from '../fixtures/test-data';

test.describe('Super Admin Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login(testData.superAdmin.username, testData.superAdmin.password);
    await page.waitForURL('**/super-admin/dashboard');
  });

  test('should display super admin dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/super-admin/);
    await expect(page.locator('text=Companies')).toBeVisible();
    await expect(page.locator('text=Subscriptions')).toBeVisible();
  });

  test('should create a new company', async ({ page }) => {
    await page.locator('button:has-text("Add Company")').click();
    
    const companyName = `Test Company ${Date.now()}`;
    await page.fill('input[name="companyName"]', companyName);
    await page.fill('input[name="email"]', `test${Date.now()}@company.com`);
    await page.fill('input[name="ntn"]', '1234567-8');
    
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    
    await expect(page.locator(`text=${companyName}`)).toBeVisible();
  });

  test('should manage subscriptions', async ({ page }) => {
    await page.locator('text=Subscriptions').click();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should toggle features for a company', async ({ page }) => {
    await page.locator('text=Feature Toggles').click();
    
    const firstToggle = page.locator('input[type="checkbox"]').first();
    await firstToggle.click();
    await page.waitForTimeout(500);
  });

  test('should view company analytics', async ({ page }) => {
    await page.locator('text=Analytics').click();
    await expect(page.locator('text=Total Companies')).toBeVisible();
    await expect(page.locator('text=Active Subscriptions')).toBeVisible();
  });
});
