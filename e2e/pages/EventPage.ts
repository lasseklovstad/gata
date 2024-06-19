import type { Page } from "@playwright/test";

import { ConfirmModal } from "./ConfirmModal";

export const EventPage = (page: Page) => {
   const mainHeading = page.getByRole("heading", { level: 1 });
   const regionDescription = page.getByRole("region", { name: "Beskrivelse" });
   const menuEvent = page.getByRole("button", { name: "Åpne meny for arrangement" });

   const deleteEvent = async () => {
      await menuEvent.click();
      await page.getByRole("menuitem", { name: "Slett" }).click();
      const confirmDialog = new ConfirmModal(page);
      await confirmDialog.confirm();
   };

   return { mainHeading, regionDescription, deleteEvent };
};
