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
    this.deleteButton = page.getByRole("link", { name: "Slett" });
    this.editContentButton = page.getByRole("button", {
      name: "Rediger innhold",
    });
    this.saveContentButton = page.getByRole("button", { name: "Lagre" });
    this.contentTextBox = page.getByRole("textbox", {
      name: "Rediger innhold",
    });
    this.confirmDeleteModal = new ConfirmModal(page);
  }

  async validateTitle(title: string) {
    await expect(this.page.getByRole("heading", { name: title })).toBeVisible();
  }

  async validateTitleAndDescription(title: string, description: string) {
    await this.validateTitle(title);
    await expect(this.page.getByText(description)).toBeVisible();
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
