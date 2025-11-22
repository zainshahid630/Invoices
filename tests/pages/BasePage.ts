import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async clickButton(selector: string) {
    await this.page.click(selector);
  }

  async selectDropdown(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  async waitForToast(message?: string) {
    if (message) {
      await this.page.waitForSelector(`text=${message}`);
    } else {
      await this.page.waitForTimeout(1000);
    }
  }
}
