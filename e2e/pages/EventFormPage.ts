import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const EventFormPage = (page: Page) => {
   const dialog = page.getByRole("dialog", { name: /(Rediger|Nytt) arrangement/i });
   const inputTitle = page.getByLabel("Tittel");
   const inputDescription = page.getByLabel("Beskrivelse");

   type GataEventForm = {
      title: string;
      description: string;
   };

   const fillForm = async ({ title, description }: GataEventForm) => {
      await expect(dialog).toBeVisible();
      await inputTitle.fill(title);
      await inputDescription.fill(description);
   };

   const submit = async () => {
      await page.getByRole("button", { name: "Lagre" }).click();
   };

   return { fillForm, submit };
};
