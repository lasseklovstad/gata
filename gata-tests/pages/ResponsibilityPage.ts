import { expect, Locator, Page } from "@playwright/test";
import { ConfirmModal } from "./ConfirmModal";
import { GataHeader } from "./GataHeader";

class ResponsibilityFormModal {
  modal: Locator;
  nameTextbox: Locator;
  descriptionTextbox: Locator;
  saveButton: Locator;

  constructor(page: Page) {
    this.modal = page.locator("role=dialog[name=/(Ny|Rediger) Ansvarspost/i]");
    this.nameTextbox = page.locator("role=textbox[name=/Navn/i]");
    this.descriptionTextbox = page.locator("role=textbox[name=/beskrivelse/i]");
    this.saveButton = page.locator("role=button[name=/lagre/i]");
  }
}

export class ResponsibilityPage {
  page: Page;
  pageTitle: Locator;
  addButton: Locator;
  responsibilityFormModal: ResponsibilityFormModal;
  confirmDeleteModal: ConfirmModal;
  header: GataHeader;

  constructor(page: Page) {
    this.pageTitle = page.locator("role=heading[name=Ansvarsposter]");
    this.addButton = page.locator("role=button[name=/legg til/i]");
    this.responsibilityFormModal = new ResponsibilityFormModal(page);
    this.confirmDeleteModal = new ConfirmModal(page);
    this.header = new GataHeader(page);
    this.page = page;
  }

  async fillResponsibilityFormAndSave(name: string, description: string) {
    const { modal, nameTextbox, descriptionTextbox, saveButton } =
      this.responsibilityFormModal;
    await expect(modal).toBeVisible();
    await nameTextbox.fill(name);
    await descriptionTextbox.fill(description);
    await saveButton.click();
    await expect(modal).toBeHidden();
  }

  async createNewResponsibility(name: string, description: string) {
    await this.addButton.click();
    await this.fillResponsibilityFormAndSave(name, description);
    const originalItem = this.getResponsibilityListItem(name);
    await expect(originalItem.listItem).toBeVisible();
  }

  async goto() {
    await this.header.responsibilityLink.click();
  }

  async editResponsibility(
    originalName: string,
    name: string,
    description: string
  ) {
    const originalItem = this.getResponsibilityListItem(originalName);
    await expect(originalItem.listItem).toBeVisible();
    await originalItem.editButton.click();
    await this.fillResponsibilityFormAndSave(name, description);
    await expect(originalItem.listItem).toBeHidden();
    const updatedItem = this.getResponsibilityListItem(name);
    await expect(updatedItem.listItem).toBeVisible();
  }

  async deleteResponsibility(name: string) {
    const item = this.getResponsibilityListItem(name);
    await item.deleteButton.click();
    await this.confirmDeleteModal.confirm();
    await expect(item.listItem).toBeHidden();
  }

  async deleteAllResponsibilities() {
    const items = this.page.locator("role=listitem");
    const count = await items.count();
    // Iterate backwards
    for (let i = count - 1; i >= 0; i--) {
      const item = items.nth(i);
      await expect(item).toBeVisible();
      const { deleteButton } = this.getListItemButtons(item);
      await deleteButton.click();
      await this.confirmDeleteModal.confirm();
    }
  }

  getListItemButtons(listItem: Locator) {
    const deleteButton = listItem.locator("role=button[name=/slett/i]");
    const editButton = listItem.locator("role=button[name=/rediger/i]");
    return { deleteButton, editButton };
  }

  getResponsibilityListItem(name: RegExp | string) {
    const listItem = this.page.locator("role=listitem", { hasText: name });
    const buttons = this.getListItemButtons(listItem);
    return { listItem, ...buttons };
  }
}
