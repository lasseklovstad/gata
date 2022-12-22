import { expect, Locator, Page } from "@playwright/test";
import { selectComboboxOption } from "../utils/combobox";
import { ConfirmModal } from "./ConfirmModal";

class MemberResponsibilityModal {
  responsibilityCombobox: Locator;
  yearCombobox: Locator;
  saveButton: Locator;
  modal: Locator;
  page: Page;

  constructor(page: Page) {
    this.responsibilityCombobox = page.locator(
      "role=combobox[name=/Velg ansvarspost/i]"
    );
    this.yearCombobox = page.locator("role=combobox[name=/velg år/i]");
    this.saveButton = page.locator("role=button[name=/lagre/i]");
    this.modal = page.locator("role=dialog[name=/Legg til ansvarspost/i]");
    this.page = page;
  }

  async fillForm(name: string, year: string) {
    await expect(this.modal).toBeVisible();
    await selectComboboxOption(this.page, this.responsibilityCombobox, name);
    await selectComboboxOption(this.page, this.yearCombobox, year);
    await this.saveButton.click();
    await expect(this.modal).toBeHidden();
  }
}

export class MemberPage {
  pageTitle: Locator;
  linkUserSelect: Locator;
  page: Page;
  responsibilityModal: MemberResponsibilityModal;
  addResponsibilityButton: Locator;
  confirmDeleteResponsibilityModal: ConfirmModal;
  deleteResponsibilityButton: Locator;
  responsibilityContentTextBox: Locator;
  saveResonsibilityButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("role=heading[name=/informasjon/i]");
    this.linkUserSelect = page.locator(
      "role=combobox[name=/Epost tilknytninger/i]"
    );
    this.responsibilityModal = new MemberResponsibilityModal(page);
    this.addResponsibilityButton = page.locator(
      "role=link[name=/legg til ansvarspost/i]"
    );
    this.confirmDeleteResponsibilityModal = new ConfirmModal(page);
    this.deleteResponsibilityButton = page.locator(
      "role=link[name=/fjern ansvarspost/i]"
    );
    this.responsibilityContentTextBox = this.page.locator(
      "role=textbox[name=/notat/i]"
    );
    this.saveResonsibilityButton = this.page.locator(
      "role=button[name=/lagre/i]"
    );
  }

  getRemoveLinkedUserButton(name: string) {
    return this.page.locator(`role=button[name=/fjern ${name}/i]`);
  }

  async linkUser(name: string) {
    await selectComboboxOption(this.page, this.linkUserSelect, name);
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

  getResponsibilityButton(name: string) {
    return this.page.locator(`role=button[name=/${name}/i]`);
  }

  goToResponsibilityTab() {
    return this.page.locator(`role=tab[name=/ansvarsposter/i]`).click();
  }

  async addResponsibility(name: string) {
    const year = new Date().getFullYear().toString();
    await this.addResponsibilityButton.click();
    await this.responsibilityModal.fillForm(name, year);
    await expect(this.getResponsibilityButton(name)).toBeVisible();
  }

  async deleteResponsibility(name: string) {
    await this.getResponsibilityButton(name).click();
    await this.deleteResponsibilityButton.click();
    await this.confirmDeleteResponsibilityModal.confirm();
    await expect(this.getResponsibilityButton(name)).toBeHidden();
  }

  async editResponsibiblity(name: string, content: string) {
    await this.getResponsibilityButton(name).click();
    await this.responsibilityContentTextBox.fill(content);
    await this.saveResonsibilityButton.click();
  }
}
