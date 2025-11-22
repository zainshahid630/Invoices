import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CustomerPage extends BasePage {
  readonly addCustomerButton: Locator;
  readonly customerNameInput: Locator;
  readonly businessNameInput: Locator;
  readonly addressInput: Locator;
  readonly ntnInput: Locator;
  readonly gstInput: Locator;
  readonly provinceSelect: Locator;
  readonly saveButton: Locator;
  readonly searchInput: Locator;
  readonly customerTable: Locator;

  constructor(page: Page) {
    super(page);
    this.addCustomerButton = page.locator('button:has-text("Add Customer")');
    this.customerNameInput = page.locator('input[name="customerName"]');
    this.businessNameInput = page.locator('input[name="businessName"]');
    this.addressInput = page.locator('input[name="address"]');
    this.ntnInput = page.locator('input[name="ntn"]');
    this.gstInput = page.locator('input[name="gst"]');
    this.provinceSelect = page.locator('select[name="province"]');
    this.saveButton = page.locator('button[type="submit"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.customerTable = page.locator('table');
  }

  async navigateToCustomers() {
    await this.goto('/seller/customers');
  }

  async addCustomer(customerData: any) {
    await this.addCustomerButton.click();
    await this.customerNameInput.fill(customerData.name);
    await this.businessNameInput.fill(customerData.businessName);
    await this.addressInput.fill(customerData.address);
    await this.ntnInput.fill(customerData.ntn);
    await this.gstInput.fill(customerData.gst);
    await this.provinceSelect.selectOption(customerData.province);
    await this.saveButton.click();
    await this.waitForToast();
  }

  async searchCustomer(customerName: string) {
    await this.searchInput.fill(customerName);
    await this.page.waitForTimeout(500);
  }
}
