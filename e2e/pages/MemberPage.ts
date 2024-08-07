import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

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
      await this.responsibilityCombobox.selectOption(name);
      await this.yearCombobox.selectOption(year);
      await this.saveButton.click();
      await expect(this.modal).toBeHidden();
   }
}

export class MemberPage {
   pageTitle: Locator;
   linkUserSelect: Locator;
   primaryUserSelect: Locator;
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
      this.primaryUserSelect = page.getByRole("button", {
         name: "Primær epost",
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
      await expect(this.linkUserSelect).toBeVisible();
      await this.linkUserSelect.fill(name);
      await this.page.getByRole("option", { name: "Auth0 " + name, exact: true }).click();
      await expect(this.getRemoveLinkedUserButton(name)).toBeVisible();
   }

   async markContingentAsPaid(year: number, isPaid: boolean) {
      await this.page.getByRole("combobox", { name: "Velg år" }).selectOption(year.toString());
      const hasPaidCheckbox = this.page.getByRole("checkbox", { name: "Betalt" });

      await (isPaid ? hasPaidCheckbox.check() : hasPaidCheckbox.uncheck());
      await this.page.getByRole("button", { name: "Lagre" }).click();
   }

   async changePrimaryUser(name: string) {
      await this.primaryUserSelect.click();
      await this.page.getByRole("option", { name: "Auth0 " + name, exact: true }).click();
      await expect(this.getRemoveLinkedUserButton(name)).toBeHidden();
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
      return this.page.getByRole("group").filter({ hasText: name }).locator("summary");
   }

   goToResponsibilityTab() {
      return this.page.getByRole("main").getByRole("navigation").getByRole("link", { name: "Ansvarsposter" }).click();
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

   private getAddRoleButton(role: Role) {
      return this.page.getByRole("listitem").filter({ hasText: role }).getByRole("button", { name: "Legg til rolle" });
   }

   private getRemoveRoleButton(role: Role) {
      return this.page.getByRole("listitem").filter({ hasText: role }).getByRole("button", { name: "Fjern rolle" });
   }

   async addRole(role: Role) {
      await this.getAddRoleButton(role).click();
      await expect(this.getRemoveRoleButton(role)).toBeVisible();
   }

   async removeRole(role: Role) {
      await this.getRemoveRoleButton(role).click();
      await expect(this.getAddRoleButton(role)).toBeVisible();
   }

   async deleteUser() {
      await this.page.getByRole("button", { name: "Slett" }).click();
      await new ConfirmModal(this.page).confirm();
   }
}

type Role = "Administrator" | "Medlem";
