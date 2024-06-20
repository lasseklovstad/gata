import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";

export type GataEventForm = {
   title: string;
   description: string;
   startTime?: string;
   startDate?: Date;
};

export const EventFormPage = (page: Page) => {
   const dialog = page.getByRole("dialog", { name: /(Rediger|Nytt) arrangement/i });
   const inputTitle = dialog.getByLabel("Tittel");
   const inputDescription = dialog.getByLabel("Beskrivelse");
   const inputTime = dialog.getByLabel("Starttidspunkt");
   const inputDate = dialog.locator('input[type="date"]');
   const buttonOpenDatePicker = dialog.getByRole("button", { name: "Åpne kalender" });

   const fillForm = async ({ title, description, startTime, startDate }: GataEventForm) => {
      await expect(dialog).toBeVisible();
      await inputTitle.fill(title);
      await inputDescription.fill(description);
      if (startTime) {
         await inputTime.fill(startTime);
      }
      if (startDate) {
         await buttonOpenDatePicker.click();
         const dateDialog = page.getByRole("dialog", { name: "Velg dato" });
         await expect(dateDialog).toBeVisible();
         const year = formatDate(startDate, "yyyy", { locale: nb });
         const month = formatDate(startDate, "MMMM", { locale: nb });
         const day = formatDate(startDate, "d", { locale: nb });
         await dateDialog.getByLabel("Velg år").selectOption(year);
         await dateDialog.getByLabel("Velg måned").selectOption(month);
         await dateDialog.getByRole("grid").getByRole("gridcell", { name: day, exact: true }).click();
      }
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

   return { fillForm, submit, cancel, inputTitle, inputDescription, verifyForm };
};
