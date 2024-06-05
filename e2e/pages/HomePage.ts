import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { DocumentPage } from "./DocumentPage";

class DocumentModal {
   modal: Locator;
   titleTextBox: Locator;
   descriptionTextBox: Locator;
   saveButton: Locator;

   constructor(page: Page) {
      this.modal = page.getByRole("dialog", { name: "Nytt dokument" });
      this.titleTextBox = page.getByRole("textbox", { name: "Tittel" });
      this.descriptionTextBox = page.getByRole("textbox", {
         name: "Beskrivelse",
      });
      this.saveButton = page.getByRole("button", { name: "Lagre" });
   }

   async fillForm(title: string, description: string) {
      await expect(this.modal).toBeVisible();
      await this.titleTextBox.fill(title);
      await this.descriptionTextBox.fill(description);
      await this.saveButton.click();
      await expect(this.modal).toBeHidden();
   }
}

export class HomePage {
   page: Page;
   welcomeTitle: Locator;
   nonMemberInformationText: Locator;
   memberWelcomeTitle: Locator;
   addNewsButton: Locator;
   addNewsModal: DocumentModal;
   documentPage: DocumentPage;
   newsList: Locator;

   constructor(page: Page) {
      this.page = page;
      this.welcomeTitle = page.getByRole("heading", { name: "Velkommen" });
      this.memberWelcomeTitle = page.getByRole("heading", { name: "Nyheter" });
      this.newsList = page.getByRole("list", { name: "Nyheter" });
      this.addNewsButton = page.getByRole("link", { name: "Opprett" });
      this.nonMemberInformationText = page.getByText("Du må være medlem for å se nyheter");
      this.addNewsModal = new DocumentModal(page);
      this.documentPage = new DocumentPage(page);
   }

   async goto() {
      await this.page.goto("");
   }

   async addNews(title: string, description: string) {
      await this.addNewsButton.click();
      await this.addNewsModal.fillForm(title, description);
      await this.documentPage.validateTitleAndDescription(title, description);
   }

   getListItemButtons(listItem: Locator) {
      const editButton = listItem.getByRole("link", { name: "Rediger" });
      return { editButton };
   }

   getNewsListItem(title: string) {
      return this.page.getByRole("listitem").filter({ hasText: title });
   }

   async assertNewsHasContent(title: string, content: string) {
      const item = this.getNewsListItem(title);
      await expect(item).toContainText(content);
   }

   async clickEditNewsItem(title: string) {
      const item = this.getNewsListItem(title);
      const { editButton } = this.getListItemButtons(item);
      await editButton.click();
      await this.documentPage.validateTitle(title);
   }

   async deleteAllNews() {
      const items = this.newsList.getByRole("listitem");
      const count = await items.count();
      // Iterate backwards
      for (let i = count - 1; i >= 0; i--) {
         await this.deleteNewsItem(items.nth(i));
      }
   }

   private async deleteNewsItem(item: Locator) {
      await expect(item).toBeVisible();
      const { editButton } = this.getListItemButtons(item);
      await editButton.click();
      await this.documentPage.deleteDocument();
      await expect(this.memberWelcomeTitle).toBeVisible();
   }

   async deleteNews(title: string) {
      const item = this.newsList.getByRole("listitem").filter({ has: this.page.getByRole("heading", { name: title }) });
      await this.deleteNewsItem(item);
   }
}
