import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InvoicePage extends BasePage {
  readonly createInvoiceButton: Locator;
  readonly invoiceTypeSelect: Locator;
  readonly scenarioSelect: Locator;
  readonly buyerSearchInput: Locator;
  readonly addItemButton: Locator;
  readonly productSearchInput: Locator;
  readonly quantityInput: Locator;
  readonly saveInvoiceButton: Locator;
  readonly invoiceTable: Locator;
  readonly downloadPdfButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createInvoiceButton = page.locator('button:has-text("Create Invoice")');
    this.invoiceTypeSelect = page.locator('select[name="invoiceType"]');
    this.scenarioSelect = page.locator('select[name="scenario"]');
    this.buyerSearchInput = page.locator('input[placeholder*="Search buyer"]');
    this.addItemButton = page.locator('button:has-text("Add Item")');
    this.productSearchInput = page.locator('input[placeholder*="Search product"]');
    this.quantityInput = page.locator('input[name="quantity"]');
    this.saveInvoiceButton = page.locator('button:has-text("Save Invoice")');
    this.invoiceTable = page.locator('table');
    this.downloadPdfButton = page.locator('button:has-text("Download PDF")');
  }

  async navigateToInvoices() {
    await this.goto('/seller/invoices');
  }

  async createInvoice(invoiceData: any, customerName: string, productName: string, quantity: number) {
    await this.createInvoiceButton.click();
    await this.invoiceTypeSelect.selectOption(invoiceData.type);
    await this.scenarioSelect.selectOption(invoiceData.scenario);
    
    // Select customer
    await this.buyerSearchInput.fill(customerName);
    await this.page.locator(`text=${customerName}`).first().click();
    
    // Add product
    await this.addItemButton.click();
    await this.productSearchInput.fill(productName);
    await this.page.locator(`text=${productName}`).first().click();
    await this.quantityInput.fill(quantity.toString());
    
    await this.saveInvoiceButton.click();
    await this.waitForToast();
  }

  async filterByStatus(status: string) {
    await this.page.locator(`button:has-text("${status}")`).click();
    await this.waitForPageLoad();
  }

  async downloadInvoicePdf(invoiceNumber: string) {
    const row = this.page.locator(`tr:has-text("${invoiceNumber}")`);
    const downloadPromise = this.page.waitForEvent('download');
    await row.locator('button:has-text("Download")').click();
    const download = await downloadPromise;
    return download;
  }
}
