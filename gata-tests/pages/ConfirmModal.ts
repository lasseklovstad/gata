import { expect, Locator, Page } from "@playwright/test";

export class ConfirmModal {
  readonly dialog: Locator;
  private readonly confirmButton: Locator;
  private readonly buttonCancel: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole("dialog", { name: "Er du sikker?" });
    this.confirmButton = page.getByRole("button", { name: "Jeg er sikker" });
    this.buttonCancel = page.getByRole("button", { name: "Avbryt" });
  }

  async confirm() {
    await expect(this.dialog).toBeVisible();
    await this.confirmButton.click();
    await expect(this.dialog).toBeHidden();
  }

  async cancel() {
    await expect(this.dialog).toBeVisible();
    await this.buttonCancel.click();
    await expect(this.dialog).toBeHidden();
  }
}
