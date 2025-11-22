import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CustomerPage } from '../pages/CustomerPage';
import { testData } from '../fixtures/test-data';

test.describe('Customer Management Tests', () => {
  let loginPage: LoginPage;
  let customerPage: CustomerPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    customerPage = new CustomerPage(page);
    
    await loginPage.navigateToLogin();
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForURL('**/seller/dashboard');
    await customerPage.navigateToCustomers();
  });

  test('should display customers page correctly', async ({ page }) => {
    await expect(customerPage.addCustomerButton).toBeVisible();
    await expect(customerPage.searchInput).toBeVisible();
    await expect(customerPage.customerTable).toBeVisible();
  });

  test('should add a new customer successfully', async ({ page }) => {
    const customerData = {
      ...testData.customer,
      name: `Test Customer ${Date.now()}`,
    };
    
    await customerPage.addCustomer(customerData);
    await customerPage.searchCustomer(customerData.name);
    await expect(page.locator(`text=${customerData.name}`)).toBeVisible();
  });

  test('should search for customers', async ({ page }) => {
    await customerPage.searchCustomer(testData.customer.name);
    await expect(customerPage.customerTable).toBeVisible();
  });

  test('should view customer details', async ({ page }) => {
    const customerName = `Test Customer ${Date.now()}`;
    await customerPage.addCustomer({ ...testData.customer, name: customerName });
    
    const row = page.locator(`tr:has-text("${customerName}")`);
    await row.locator('button:has-text("View")').click();
    
    await expect(page.locator('text=Customer Details')).toBeVisible();
  });

  test('should edit customer information', async ({ page }) => {
    const customerName = `Test Customer ${Date.now()}`;
    await customerPage.addCustomer({ ...testData.customer, name: customerName });
    
    const row = page.locator(`tr:has-text("${customerName}")`);
    await row.locator('button:has-text("Edit")').click();
    
    await customerPage.addressInput.fill('456 New Address');
    await customerPage.saveButton.click();
    await customerPage.waitForToast();
    
    await expect(page.locator('text=456 New Address')).toBeVisible();
  });
});
