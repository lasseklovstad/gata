import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { ConfirmModal } from "./ConfirmModal";
import { GataHeader } from "./GataHeader";

class ResponsibilityFormModal {
   modal: Locator;
   nameTextbox: Locator;
   descriptionTextbox: Locator;
   saveButton: Locator;

   constructor(page: Page) {
      this.modal = page.getByRole("dialog", {
         name: /(Ny|Rediger) Ansvarspost/i,
      });
      this.nameTextbox = page.getByRole("textbox", { name: "Navn" });
      this.descriptionTextbox = page.getByRole("textbox", {
         name: "Beskrivelse",
      });
      this.saveButton = page.getByRole("button", { name: "Lagre" });
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
      this.pageTitle = page.getByRole("heading", { name: "Ansvarsposter" });
      this.addButton = page.getByRole("link", { name: "Legg til" });
      this.responsibilityFormModal = new ResponsibilityFormModal(page);
      this.confirmDeleteModal = new ConfirmModal(page);
      this.header = new GataHeader(page);
      this.page = page;
   }

   async fillResponsibilityFormAndSave(name: string, description: string) {
      const { modal, nameTextbox, descriptionTextbox, saveButton } = this.responsibilityFormModal;
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
      await this.page.goto("/");
      await this.header.responsibilityLink.click();
      await expect(this.pageTitle).toBeVisible();
   }

   async editResponsibility(originalName: string, name: string, description: string) {
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
      const items = this.page.getByRole("listitem");
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
      const deleteButton = listItem.getByRole("link", { name: "Slett" });
      const editButton = listItem.getByRole("link", { name: "Rediger" });
      return { deleteButton, editButton };
   }

   getResponsibilityListItem(name: RegExp | string) {
      const listItem = this.page.getByRole("listitem").filter({ hasText: name });
      const buttons = this.getListItemButtons(listItem);
      return { listItem, ...buttons };
   }
}
