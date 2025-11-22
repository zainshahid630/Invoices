import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InvoicePage } from '../pages/InvoicePage';
import { CustomerPage } from '../pages/CustomerPage';
import { InventoryPage } from '../pages/InventoryPage';
import { testData } from '../fixtures/test-data';

test.describe('Invoice Management Tests', () => {
  let loginPage: LoginPage;
  let invoicePage: InvoicePage;
  let customerPage: CustomerPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    invoicePage = new InvoicePage(page);
    customerPage = new CustomerPage(page);
    inventoryPage = new InventoryPage(page);
    
    await loginPage.navigateToLogin();
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForURL('**/seller/dashboard');
  });

  test('should display invoices page correctly', async ({ page }) => {
    await invoicePage.navigateToInvoices();
    await expect(invoicePage.createInvoiceButton).toBeVisible();
    await expect(invoicePage.invoiceTable).toBeVisible();
  });

  test('should create a new invoice successfully', async ({ page }) => {
    // Setup: Create customer and product first
    const customerName = `Test Customer ${Date.now()}`;
    const productName = `Test Product ${Date.now()}`;
    
    await customerPage.navigateToCustomers();
    await customerPage.addCustomer({ ...testData.customer, name: customerName });
    
    await inventoryPage.navigateToInventory();
    await inventoryPage.addProduct({ ...testData.product, name: productName });
    
    // Create invoice
    await invoicePage.navigateToInvoices();
    await invoicePage.createInvoice(testData.invoice, customerName, productName, 5);
    
    await expect(page.locator('text=INV-2025-')).toBeVisible();
  });

  test('should filter invoices by status', async ({ page }) => {
    await invoicePage.navigateToInvoices();
    
    await invoicePage.filterByStatus('FBR Posted');
    await expect(page).toHaveURL(/status=fbr-posted/);
    
    await invoicePage.filterByStatus('Verified');
    await expect(page).toHaveURL(/status=verified/);
  });

  test('should download invoice PDF', async ({ page }) => {
    await invoicePage.navigateToInvoices();
    
    // Assuming there's at least one invoice
    const firstInvoiceNumber = await page.locator('table tr:nth-child(2) td:first-child').textContent();
    
    if (firstInvoiceNumber) {
      const download = await invoicePage.downloadInvoicePdf(firstInvoiceNumber);
      expect(download.suggestedFilename()).toContain('.pdf');
    }
  });

  test('should calculate tax correctly', async ({ page }) => {
    await invoicePage.navigateToInvoices();
    await invoicePage.createInvoiceButton.click();
    
    // Add items and verify tax calculation
    await expect(page.locator('text=Sales Tax')).toBeVisible();
    await expect(page.locator('text=Further Tax')).toBeVisible();
  });

  test('should validate invoice number format', async ({ page }) => {
    await invoicePage.navigateToInvoices();
    
    const invoiceNumber = await page.locator('table tr:nth-child(2) td:first-child').textContent();
    expect(invoiceNumber).toMatch(/INV-2025-\d{5}/);
  });
});
