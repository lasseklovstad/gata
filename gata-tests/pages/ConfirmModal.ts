import { expect, Locator, Page } from "@playwright/test";

export class ConfirmModal {
  modal: Locator;
  confirmButton: Locator;

  constructor(page: Page) {
    this.modal = page.getByRole("dialog", { name: "Er du sikker?" });
    this.confirmButton = page.getByRole("button", { name: "Jeg er sikker" });
  }

  async confirm() {
    await expect(this.modal).toBeVisible();
    await this.confirmButton.click();
    await expect(this.modal).toBeHidden();
  }
}
