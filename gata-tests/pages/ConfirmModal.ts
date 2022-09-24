import { expect, Locator, Page } from "@playwright/test";

export class ConfirmModal {
  modal: Locator;
  confirmButton: Locator;

  constructor(page: Page) {
    this.modal = page.locator("role=dialog[name=/er du sikker/i]");
    this.confirmButton = page.locator("role=button[name=/jeg er sikker/i]");
  }

  async confirm() {
    await expect(this.modal).toBeVisible();
    await this.confirmButton.click();
    await expect(this.modal).toBeHidden();
  }
}
