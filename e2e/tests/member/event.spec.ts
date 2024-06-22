import { expect, test } from "@playwright/test";

import { EventFormPage } from "e2e/pages/EventFormPage";
import { EventPage } from "e2e/pages/EventPage";

import { HomePage } from "../../pages/HomePage";

test.use({ storageState: "memberStorageState.json" });

test.describe("Gata event", () => {
   test.afterEach(async ({ page }) => {
      const homePage = HomePage(page);
      await homePage.goto();
      await expect(homePage.memberWelcomeTitle).toBeVisible();
      await homePage.deleteAllEvents();
   });
   test("Should add new event", async ({ page }) => {
      const homePage = HomePage(page);
      const eventFormPage = EventFormPage(page);
      const eventPage = EventPage(page);
      const event = {
         title: "Gatapils 2024",
         description: "Vi skal på bar og drikke pils",
      };

      await homePage.goto();
      await homePage.buttonCreateEvent.click();

      // Check validation
      await eventFormPage.submit();
      await expect(eventFormPage.inputTitle).toHaveAccessibleDescription("Required");

      await eventFormPage.fillForm(event);
      await eventFormPage.submit();
      await eventPage.verifyDescription(event);

      // Edit event and cancel should reset form
      await eventPage.openMenu("Rediger");
      await eventFormPage.fillForm({ title: "Saft123", description: "Jallaballa" });
      await eventFormPage.cancel();
      await eventPage.openMenu("Rediger");
      await eventFormPage.verifyForm(event);
      const today = new Date();
      const nextYear = today.getFullYear() + 1;
      // Fill out form for real
      const startDate = new Date(nextYear, 5, 1);
      const newEvent = {
         title: `Sommerfest ${nextYear}`,
         description: "Vi skal grille i hagen til Ivar",
         startTime: "16:45",
         startDate,
      };
      await eventFormPage.fillForm(newEvent);
      await eventFormPage.verifyForm(newEvent);
      await eventFormPage.submit();
      await eventPage.verifyDescription(newEvent);
   });
});
