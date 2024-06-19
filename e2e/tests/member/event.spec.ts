import { expect, test } from "@playwright/test";

import { EventFormPage } from "e2e/pages/EventFormPage";
import { EventPage } from "e2e/pages/EventPage";

import { HomePage } from "../../pages/HomePage";

test.use({ storageState: "memberStorageState.json" });

test.describe.only("Gata event", () => {
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
      const title = "Gatapils 2024";
      const description = "Vi skal på bar og drikke pils";
      await homePage.goto();
      await homePage.buttonCreateEvent.click();
      await eventFormPage.fillForm({ title, description });
      await eventFormPage.submit();
      await expect(eventPage.mainHeading).toHaveText(title);
      await expect(eventPage.regionDescription).toContainText(description);
   });
});
