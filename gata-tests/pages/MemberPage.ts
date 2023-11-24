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
    this.responsibilityCombobox = page.getByRole("combobox", {
      name: "Velg ansvarspost",
    });
    this.yearCombobox = page.getByRole("combobox", { name: "Velg år" });
    this.saveButton = page.getByRole("button", { name: "Lagre" });
    this.modal = page.getByRole("dialog", { name: "Legg til ansvarspost" });
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
    this.pageTitle = page.getByRole("heading", { name: "Informasjon" });
    this.linkUserSelect = page.getByRole("combobox", {
      name: "Epost tilknytninger",
    });
    this.responsibilityModal = new MemberResponsibilityModal(page);
    this.addResponsibilityButton = page.getByRole("link", {
      name: "Legg til ansvarspost",
    });
    this.confirmDeleteResponsibilityModal = new ConfirmModal(page);
    this.deleteResponsibilityButton = page.getByRole("link", {
      name: "Fjern ansvarspost",
    });
    this.responsibilityContentTextBox = page.getByRole("textbox", {
      name: "Notat",
    });
    this.saveResonsibilityButton = page.getByRole("button", {
      name: "Lagre",
    });
  }

  getRemoveLinkedUserButton(name: string) {
    return this.page.getByRole("button", { name: `Fjern ${name}` });
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
    await expect(this.page.getByText(`Email: ${email}`)).toBeVisible();
  }

  getResponsibilityButton(name: string) {
    return this.page.getByRole("button", { name });
  }

  goToResponsibilityTab() {
    return this.page.getByRole("tab", { name: "Ansvarsposter" }).click();
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
