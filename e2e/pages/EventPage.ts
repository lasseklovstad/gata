import { expect, type Page } from "@playwright/test";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";

import { ConfirmModal } from "./ConfirmModal";
import type { GataEventForm } from "./EventFormPage";

export const EventPage = (page: Page) => {
   const mainHeading = page.getByRole("heading", { level: 1 });
   const regionDescription = page.getByRole("region", { name: "Beskrivelse" });
   const menuEvent = page.getByRole("button", { name: "Åpne meny for arrangement" });
   const linkPolls = page.getByRole("link", { name: "Avstemninger" });

   const deleteEvent = async () => {
      await openMenu("Slett");
      const confirmDialog = new ConfirmModal(page);
      await confirmDialog.confirm();
   };

   const openMenu = async (menuItemName: "Slett" | "Rediger") => {
      await menuEvent.click();
      await page.getByRole("menuitem", { name: menuItemName }).click();
   };

   const verifyDescription = async ({ title, description, startDate, startTime }: GataEventForm) => {
      await expect(mainHeading).toHaveText(title);
      await expect(regionDescription).toContainText(description);
      if (startDate) {
         const startDateFormated = formatDate(startDate, "PPPP", { locale: nb });
         await expect(regionDescription).toContainText(`Startdato: ${startDateFormated}`);
      }
      if (startTime) {
         await expect(regionDescription).toContainText(`Tidspunkt: ${startTime}`);
      }
   };

   return { mainHeading, regionDescription, deleteEvent, openMenu, verifyDescription, linkPolls };
};
