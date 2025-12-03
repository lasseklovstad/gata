import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { formatDate } from "date-fns";

import { selectDate } from "e2e/utils/eventUtils";

import { HomePage } from "./HomePage";

export type GataEventForm = {
   title: string;
   description: string;
   startTime?: string;
   startDate?: Date;
   visibility?: "Alle" | "Arrangører";
};

export const EventFormPage = (page: Page) => {
   const dialog = page.getByRole("dialog", { name: /(Rediger|Nytt) arrangement/i });
   const inputTitle = dialog.getByLabel("Tittel");
   const inputDescription = dialog.getByLabel("Beskrivelse");
   const inputTime = dialog.getByLabel("Starttidspunkt");
   const groupVisibility = dialog.getByRole("group", { name: "Velg synlighet" });
   const inputDate = dialog.locator('input[type="date"]');
   const buttonOpenDatePicker = dialog.getByRole("button", { name: "Åpne kalender" });

   const fillForm = async ({ title, description, startTime, startDate, visibility = "Alle" }: GataEventForm) => {
      await expect(dialog).toBeVisible();
      await inputTitle.fill(title);
      await inputDescription.fill(description);
      if (startTime) {
         await inputTime.fill(startTime);
      }
      await selectVisibility(visibility);
      if (startDate) {
         await buttonOpenDatePicker.click();
         const dateDialog = page.getByRole("dialog", { name: "Velg dato" });
         await expect(dateDialog).toBeVisible();
         await selectDate(startDate, dateDialog);
      }
   };

   const selectVisibility = async (name: "Alle" | "Arrangører") => {
      await groupVisibility.getByRole("radio", { name }).check();
   };

   const verifyForm = async ({ title, description, startTime, startDate }: GataEventForm) => {
      await expect(inputTitle).toHaveValue(title);
      await expect(inputDescription).toHaveValue(description);
      await expect(inputTime).toHaveValue(startTime ?? "");
      await expect(inputDate).toHaveValue(startDate ? formatDate(startDate, "yyyy-MM-dd") : "");
   };

   const submit = async () => {
      await page.getByRole("button", { name: "Lagre" }).click();
   };

   const cancel = async () => {
      await page.getByRole("button", { name: "Avbryt" }).click();
   };

   const createEvent = async (event: GataEventForm) => {
      const homePage = HomePage(page);
      const eventFormPage = EventFormPage(page);
      await homePage.goto();
      await homePage.buttonCreateEvent.click();
      await eventFormPage.fillForm(event);
      await eventFormPage.submit();
      await expect(page.getByRole("heading", { name: event.title })).toBeVisible();
   };

   return { fillForm, submit, cancel, inputTitle, inputDescription, verifyForm, createEvent, selectVisibility };
};
