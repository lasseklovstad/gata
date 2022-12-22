import { expect, Locator, Page } from "@playwright/test";
import { ConfirmModal } from "./ConfirmModal";

export class DocumentPage {
  page: Page;
  deleteButton: Locator;
  confirmDeleteModal: ConfirmModal;
  editContentButton: Locator;
  contentTextBox: Locator;
  saveContentButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.deleteButton = page.locator("role=link[name=/slett/i]");
    this.editContentButton = page.locator(
      "role=button[name=/rediger innhold/i]"
    );
    this.saveContentButton = page.locator("role=button[name=/lagre/i]");
    this.contentTextBox = page.locator("role=textbox[name=/rediger innhold/i]");
    this.confirmDeleteModal = new ConfirmModal(page);
  }

  async validateTitle(title: string) {
    await expect(
      this.page.locator(`role=heading[name='${title}']`)
    ).toBeVisible();
  }

  async validateTitleAndDescription(title: string, description: string) {
    await this.validateTitle(title);
    await expect(this.page.locator(`text='${description}'`)).toBeVisible();
  }

  async deleteDocument() {
    await this.deleteButton.click();
    await this.confirmDeleteModal.confirm();
  }

  async editContent(content: string) {
    await this.editContentButton.click();
    await this.contentTextBox.fill(content);
    await this.saveContentButton.click();
    await expect(this.contentTextBox).toBeHidden();
  }
}
