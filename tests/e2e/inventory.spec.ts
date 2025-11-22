import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { testData } from '../fixtures/test-data';

test.describe('Inventory Management Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    
    await loginPage.navigateToLogin();
    await loginPage.login(testData.seller.username, testData.seller.password);
    await page.waitForURL('**/seller/dashboard');
    await inventoryPage.navigateToInventory();
  });

  test('should display inventory page correctly', async ({ page }) => {
    await expect(inventoryPage.addProductButton).toBeVisible();
    await expect(inventoryPage.searchInput).toBeVisible();
    await expect(inventoryPage.productTable).toBeVisible();
  });

  test('should add a new product successfully', async ({ page }) => {
    const productData = {
      ...testData.product,
      name: `Test Product ${Date.now()}`,
    };
    
    await inventoryPage.addProduct(productData);
    await inventoryPage.searchProduct(productData.name);
    await expect(page.locator(`text=${productData.name}`)).toBeVisible();
  });

  test('should search for products', async ({ page }) => {
    await inventoryPage.searchProduct(testData.product.name);
    await expect(inventoryPage.productTable).toBeVisible();
  });

  test('should edit product details', async ({ page }) => {
    const productName = `Test Product ${Date.now()}`;
    await inventoryPage.addProduct({ ...testData.product, name: productName });
    
    const row = page.locator(`tr:has-text("${productName}")`);
    await row.locator('button:has-text("Edit")').click();
    
    await inventoryPage.unitPriceInput.fill('2000');
    await inventoryPage.saveButton.click();
    await inventoryPage.waitForToast();
    
    await expect(page.locator('text=2000')).toBeVisible();
  });

  test('should delete a product', async ({ page }) => {
    const productName = `Test Product ${Date.now()}`;
    await inventoryPage.addProduct({ ...testData.product, name: productName });
    await inventoryPage.deleteProduct(productName);
    
    await inventoryPage.searchProduct(productName);
    await expect(page.locator(`text=${productName}`)).not.toBeVisible();
  });

  test('should track stock history', async ({ page }) => {
    const productName = `Test Product ${Date.now()}`;
    await inventoryPage.addProduct({ ...testData.product, name: productName });
    
    const row = page.locator(`tr:has-text("${productName}")`);
    await row.locator('button:has-text("History")').click();
    
    await expect(page.locator('text=Stock History')).toBeVisible();
  });
});
