import { expect, Locator, Page } from "@playwright/test";
import { ConfirmModal } from "./ConfirmModal";

class DocumentModal {
  modal: Locator;
  titleTextBox: Locator;
  descriptionTextBox: Locator;
  saveButton: Locator;

  constructor(page: Page) {
    this.modal = page.locator("role=dialog[name=/nytt dokument/i]");
    this.titleTextBox = page.locator("role=textbox[name=/tittel/i]");
    this.descriptionTextBox = page.locator("role=textbox[name=/beskrivelse/i]");
    this.saveButton = page.locator("role=button[name=/lagre/i]");
  }

  async fillForm(title: string, description: string) {
    await expect(this.modal).toBeVisible();
    await this.titleTextBox.fill(title);
    await this.descriptionTextBox.fill(description);
    await this.saveButton.click();
    await expect(this.modal).toBeHidden();
  }
}

class DocumentPage {
  page: Page;
  deleteButton: Locator;
  confirmDeleteModal: ConfirmModal;

  constructor(page: Page) {
    this.page = page;
    this.deleteButton = page.locator("role=button[name=/slett/i]");
    this.confirmDeleteModal = new ConfirmModal(page);
  }

  async validateTitleAndDescription(title: string, description: string) {
    await expect(
      this.page.locator(`role=heading[name='${title}']`)
    ).toBeVisible();
    await expect(this.page.locator(`text='${description}'`)).toBeVisible();
  }

  async deleteDocument() {
    await this.deleteButton.click();
    await this.confirmDeleteModal.confirm();
  }
}

export class HomePage {
  page: Page;
  welcomeTitle: Locator;
  memberWelcomeTitle: Locator;
  addNewsButton: Locator;
  addNewsModal: DocumentModal;
  documentPage: DocumentPage;
  newsList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeTitle = page.locator("role=heading[name=Velkommen]");
    this.memberWelcomeTitle = page.locator("role=heading[name=Nyheter]");
    this.newsList = page.locator("role=list[name=Nyheter]");
    this.addNewsButton = page.locator("role=button[name=Opprett]");
    this.addNewsModal = new DocumentModal(page);
    this.documentPage = new DocumentPage(page);
  }

  async addNews(title: string, description: string) {
    await this.addNewsButton.click();
    await this.addNewsModal.fillForm(title, description);
    await this.documentPage.validateTitleAndDescription(title, description);
  }

  getListItemButtons(listItem: Locator) {
    const editButton = listItem.locator("role=link[name=/rediger/i]");
    return { editButton };
  }

  async deleteAllNews() {
    const items = this.page.locator("role=listitem");
    const count = await items.count();
    // Iterate backwards
    for (let i = count - 1; i >= 0; i--) {
      const item = items.nth(i);
      await expect(item).toBeVisible();
      const { editButton } = this.getListItemButtons(item);
      await editButton.click();
      await this.documentPage.deleteDocument();
      await expect(this.memberWelcomeTitle).toBeVisible();
    }
  }
}
