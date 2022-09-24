import { expect, Locator, Page } from "@playwright/test";

export class MemberPage {
  pageTitle: Locator;
  linkUserSelect: Locator;
  page: Page;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("role=heading[name=/informasjon/i]");
    this.linkUserSelect = page.locator(
      "role=combobox[name=/Epost tilknytninger/i]"
    );
  }

  getRemoveLinkedUserButton(name: string) {
    return this.page.locator(`role=button[name=/fjern ${name}/i]`);
  }

  async linkUser(name: string) {
    await this.linkUserSelect.click();
    const listboxId = await this.linkUserSelect.getAttribute("aria-controls");
    const listBox = this.page.locator(`#${listboxId}`);
    await listBox.locator("role=button", { hasText: name }).click();
    await expect(listBox).toBeHidden();
    await expect(this.getRemoveLinkedUserButton(name)).toBeVisible();
  }

  async removeLinkedUser(name: string) {
    const removeButton = this.getRemoveLinkedUserButton(name);
    await removeButton.click();
    await expect(removeButton).toBeHidden();
  }

  async assertPrimaryEmail(email: string) {
    await expect(this.page.locator(`text=Email: ${email}`)).toBeVisible();
  }
}
