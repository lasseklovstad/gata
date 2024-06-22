import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { DocumentPage } from "./DocumentPage";
import { EventPage } from "./EventPage";

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

export const HomePage = (page: Page) => {
   const welcomeTitle = page.getByRole("heading", { name: "Velkommen" });
   const memberWelcomeTitle = page.getByRole("heading", { name: "Nyheter" });
   const newsList = page.getByRole("list", { name: "Nyheter" });
   const listEvents = page.getByRole("list", { name: "Arrangement" });
   const addNewsButton = page.getByRole("link", { name: "Opprett" });
   const buttonCreateEvent = page.getByRole("link", { name: "Nytt Arrangement" });
   const nonMemberInformationText = page.getByText("Du må være medlem for å se nyheter");
   const addNewsModal = new DocumentModal(page);
   const documentPage = new DocumentPage(page);

   async function goto() {
      await page.goto("");
   }

   async function gotoEvent(name: string) {
      await page.goto("");
      await listEvents.getByRole("link", { name }).click();
   }

   async function addNews(title: string, description: string) {
      await addNewsButton.click();
      await addNewsModal.fillForm(title, description);
      await documentPage.validateTitleAndDescription(title, description);
   }

   function getListItemButtons(listItem: Locator) {
      const editButton = listItem.getByRole("link", { name: "Rediger" });
      return { editButton };
   }

   function getNewsListItem(title: string) {
      return page.getByRole("listitem").filter({ hasText: title });
   }

   async function assertNewsHasContent(title: string, content: string) {
      const item = getNewsListItem(title);
      await expect(item).toContainText(content);
   }

   async function clickEditNewsItem(title: string) {
      const item = getNewsListItem(title);
      const { editButton } = getListItemButtons(item);
      await editButton.click();
      await documentPage.validateTitle(title);
   }

   async function deleteAllNews() {
      const items = newsList.getByRole("listitem");
      const count = await items.count();
      // Iterate backwards
      for (let i = count - 1; i >= 0; i--) {
         await deleteNewsItem(items.nth(i));
      }
   }

   async function deleteAllEvents() {
      const items = listEvents.getByRole("listitem");
      const count = await items.count();
      const eventPage = EventPage(page);
      for (let i = count - 2; i >= 0; i--) {
         await items.nth(i).getByRole("link").click();
         await eventPage.deleteEvent();
      }
   }

   async function deleteNewsItem(item: Locator) {
      await expect(item).toBeVisible();
      const { editButton } = getListItemButtons(item);
      await editButton.click();
      await documentPage.deleteDocument();
      await expect(memberWelcomeTitle).toBeVisible();
   }

   async function deleteNews(title: string) {
      const item = newsList.getByRole("listitem").filter({ has: page.getByRole("heading", { name: title }) });
      await deleteNewsItem(item);
   }

   return {
      welcomeTitle,
      memberWelcomeTitle,
      newsList,
      addNewsButton,
      buttonCreateEvent,
      nonMemberInformationText,
      addNewsModal,
      documentPage,
      goto,
      addNews,
      getListItemButtons,
      getNewsListItem,
      assertNewsHasContent,
      clickEditNewsItem,
      deleteAllNews,
      deleteNewsItem,
      deleteNews,
      deleteAllEvents,
      gotoEvent,
   };
};
