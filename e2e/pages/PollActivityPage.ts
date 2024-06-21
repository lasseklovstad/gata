import { type Page } from "@playwright/test";

export const PollActivityPage = (page: Page) => {
   const gotoPoll = async (name: string) => {
      await page.getByRole("list", { name: "Aktive avstemninger" }).getByRole("link", { name }).click();
   };

   return {
      gotoPoll,
   };
};
