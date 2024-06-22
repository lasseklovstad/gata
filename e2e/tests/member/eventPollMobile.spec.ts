import { devices, expect } from "@playwright/test";
import { addDays, formatDate } from "date-fns";
import { nb } from "date-fns/locale";

import { EventFormPage } from "e2e/pages/EventFormPage";
import { EventPage } from "e2e/pages/EventPage";
import { EventPollPage } from "e2e/pages/EventPollPage";
import { HomePage } from "e2e/pages/HomePage";
import { PollActivityPage } from "e2e/pages/PollActivityPage";

import { testWithRoles as test } from "../../utils/fixtures";

const eventName = "Gata Pils";

test.use(devices["Galaxy S5"]);

test.describe("Event polls", () => {
   test.afterEach(async ({ adminPage }) => {
      const homePage = HomePage(adminPage);
      await homePage.goto();
      await expect(homePage.memberWelcomeTitle).toBeVisible();
      await homePage.deleteAllEvents();
   });
   test.beforeEach(async ({ memberPage }) => {
      await EventFormPage(memberPage).createEvent({ title: eventName, description: "" });
   });
   test("Should create poll with multiselect and verify list on mobile", async ({ memberPage, adminPage }) => {
      const eventPage = EventPage(memberPage);
      const eventPollPage = EventPollPage(memberPage);
      await eventPage.linkPolls.click();
      await expect(eventPollPage.mainHeading).toBeVisible();

      const name = "Hva skal vi drikke?";
      const options = ["Øl", "Saft", "Brus"];

      await test.step("Create poll and verify", async () => {
         await eventPollPage.buttonCreatePoll.click();
         await eventPollPage.fillForm({ name, type: "Tekst", options, canSelectMultiple: true });
         await eventPollPage.buttonSubmit.click();
         await eventPollPage.verifyPollList(name, true, options, ["0", "0", "0"], [false, false, false]);
         // Should not show table variant
         await expect(eventPollPage.getPollTableForm(name)).toBeHidden();
      });

      await test.step("Select option", async () => {
         await eventPollPage.checkListPollOption(name, true, "Saft", true);
         await eventPollPage.verifyPollList(name, true, options, ["0", "1", "0"], [false, true, false]);
         await eventPollPage.checkListPollOption(name, true, "Brus", true);
         await eventPollPage.verifyPollList(name, true, options, ["0", "1", "1"], [false, true, true]);
      });

      await test.step("Select as admin and verify result", async () => {
         const homePage = HomePage(adminPage);
         const pollActivityPage = PollActivityPage(adminPage);
         const eventPollPage = EventPollPage(adminPage);

         // Goto poll
         await homePage.gotoEvent(eventName);
         await pollActivityPage.gotoPoll(name);

         await eventPollPage.checkListPollOption(name, true, "Saft", true);
         await eventPollPage.checkListPollOption(name, true, "Øl", true);
         await eventPollPage.verifyPollList(name, true, options, ["1", "2", "1"], [true, true, false]);
         // Test uncheck
         await eventPollPage.checkListPollOption(name, true, "Saft", false);
         await eventPollPage.verifyPollList(name, true, options, ["1", "1", "1"], [true, false, false]);
      });

      await test.step("Disable poll as member", async () => {
         await memberPage.reload();
         await eventPollPage.verifyPollList(name, true, options, ["1", "1", "1"], [false, true, true]);
         await eventPollPage.editPoll(name, { isActive: false });
         await expect(memberPage.getByRole("list", { name })).toHaveAccessibleDescription("Avstemningen er avsluttet");
         await eventPollPage.verifyPollListIsDisabled(name, true);
      });
   });
   test("Should create poll with multiselect date and verify list on mobile", async ({ memberPage }) => {
      const eventPage = EventPage(memberPage);
      const eventPollPage = EventPollPage(memberPage);
      await eventPage.linkPolls.click();
      await expect(eventPollPage.mainHeading).toBeVisible();

      const name = "Når skal det skje?";
      const options = [new Date(), addDays(new Date(), 1), addDays(new Date(), 2)];
      const optionTexts = options.map((date) => formatDate(date, "dd.MMMM yyyy", { locale: nb }));

      await test.step("Create poll and verify", async () => {
         await eventPollPage.buttonCreatePoll.click();
         await eventPollPage.fillForm({ name, type: "Dato", options, canSelectMultiple: true });
         await eventPollPage.buttonSubmit.click();
         await eventPollPage.verifyPollList(name, true, optionTexts, ["0", "0", "0"], [false, false, false]);
         // Should not show table variant
         await expect(eventPollPage.getPollTableForm(name)).toBeHidden();
      });

      await test.step("Select option", async () => {
         await eventPollPage.checkListPollOption(name, true, optionTexts[1], true);
         await eventPollPage.verifyPollList(name, true, optionTexts, ["0", "1", "0"], [false, true, false]);
         await eventPollPage.checkListPollOption(name, true, optionTexts[2], true);
         await eventPollPage.verifyPollList(name, true, optionTexts, ["0", "1", "1"], [false, true, true]);
      });

      await test.step("Edit poll name", async () => {
         const newName = "Når skal vi spise kake?";
         await eventPollPage.editPoll(name, { isActive: true, name: newName });
         await expect(memberPage.getByRole("list", { name: newName })).toBeVisible();
      });
   });
});
