import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly addProductButton: Locator;
  readonly productNameInput: Locator;
  readonly hsCodeInput: Locator;
  readonly uomSelect: Locator;
  readonly unitPriceInput: Locator;
  readonly warrantyInput: Locator;
  readonly descriptionInput: Locator;
  readonly stockLevelInput: Locator;
  readonly saveButton: Locator;
  readonly searchInput: Locator;
  readonly productTable: Locator;

  constructor(page: Page) {
    super(page);
    this.addProductButton = page.locator('button:has-text("Add Product")');
    this.productNameInput = page.locator('input[name="productName"]');
    this.hsCodeInput = page.locator('input[name="hsCode"]');
    this.uomSelect = page.locator('select[name="uom"]');
    this.unitPriceInput = page.locator('input[name="unitPrice"]');
    this.warrantyInput = page.locator('input[name="warranty"]');
    this.descriptionInput = page.locator('textarea[name="description"]');
    this.stockLevelInput = page.locator('input[name="stockLevel"]');
    this.saveButton = page.locator('button[type="submit"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.productTable = page.locator('table');
  }

  async navigateToInventory() {
    await this.goto('/seller/inventory');
  }

  async addProduct(productData: any) {
    await this.addProductButton.click();
    await this.productNameInput.fill(productData.name);
    await this.hsCodeInput.fill(productData.hsCode);
    await this.uomSelect.selectOption(productData.uom);
    await this.unitPriceInput.fill(productData.unitPrice.toString());
    await this.warrantyInput.fill(productData.warranty.toString());
    if (productData.description) {
      await this.descriptionInput.fill(productData.description);
    }
    await this.stockLevelInput.fill(productData.stockLevel.toString());
    await this.saveButton.click();
    await this.waitForToast();
  }

  async searchProduct(productName: string) {
    await this.searchInput.fill(productName);
    await this.page.waitForTimeout(500);
  }

  async deleteProduct(productName: string) {
    const row = this.page.locator(`tr:has-text("${productName}")`);
    await row.locator('button:has-text("Delete")').click();
    await this.page.locator('button:has-text("Confirm")').click();
    await this.waitForToast();
  }
}
