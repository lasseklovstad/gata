import { expect } from "@playwright/test";

import { env } from "e2e/pages/Environment";
import { EventFormPage } from "e2e/pages/EventFormPage";
import { EventPage } from "e2e/pages/EventPage";
import { EventPollPage } from "e2e/pages/EventPollPage";
import { HomePage } from "e2e/pages/HomePage";
import { PollActivityPage } from "e2e/pages/PollActivityPage";

import { testWithRoles as test } from "../../utils/fixtures";

const eventName = "Gata Pils";

test.describe.only("Event polls", () => {
   test.afterEach(async ({ adminPage }) => {
      const homePage = HomePage(adminPage);
      await homePage.goto();
      await expect(homePage.memberWelcomeTitle).toBeVisible();
      await homePage.deleteAllEvents();
   });
   test.beforeEach(async ({ memberPage }) => {
      await EventFormPage(memberPage).createEvent({ title: eventName, description: "" });
   });
   test("Should create poll and verify validations", async ({ memberPage }) => {
      const eventPage = EventPage(memberPage);
      const eventPollPage = EventPollPage(memberPage);
      await eventPage.linkPolls.click();
      await expect(eventPollPage.mainHeading).toBeVisible();
      await eventPollPage.buttonCreatePoll.click();

      // Check validations
      await eventPollPage.buttonSubmit.click();
      await expect(eventPollPage.inputName).toHaveAccessibleDescription("Required");
      await expect(eventPollPage.radioGroupType).toHaveAccessibleDescription("Required");

      // Fill out form and cancel then verify form is reset
      await eventPollPage.fillForm({ name: "Hva skal vi drikke?", type: "Tekst", options: ["Øl", "Saft", "Brus"] });
      await eventPollPage.buttonCancel.click();
      await eventPollPage.buttonCreatePoll.click();
      await expect(eventPollPage.inputName).toHaveValue("");
      await expect(eventPollPage.getRadioType("Dato")).not.toBeChecked();
      await expect(eventPollPage.getRadioType("Tekst")).not.toBeChecked();

      // Should hide rest of form after reset
      await expect(eventPollPage.getInputTextOption()).toBeHidden();
      await expect(eventPollPage.checkboxCanAddSuggestions).toBeHidden();
      await expect(eventPollPage.checkboxCanSelectMultiple).toBeHidden();
      await expect(eventPollPage.checkboxIsAnonymous).toBeHidden();
      await eventPollPage.fillForm({ name: "Hva skal vi drikke?", type: "Tekst", options: ["Øl", "Saft", "Brus"] });

      // Verify middle one to be deleted
      await eventPollPage.deleteInputTextOption(1);
      await expect(eventPollPage.getOptionListItems()).toHaveCount(2);
      await expect(eventPollPage.getInputTextOption(0)).toHaveValue("Øl");
      await expect(eventPollPage.getInputTextOption(1)).toHaveValue("Brus");

      // Verify at least one option
      await eventPollPage.deleteInputTextOption(1);
      await eventPollPage.getInputTextOption(0).fill("");
      await eventPollPage.buttonSubmit.click();
      await expect(eventPollPage.getInputTextOption(0)).toHaveAccessibleDescription(
         "Alternativ kan ikke være tomt, Det må være mer enn ett alternativ"
      );
      await eventPollPage.getInputTextOption(0).fill("Øl");
      await eventPollPage.buttonSubmit.click();
      await expect(eventPollPage.getInputTextOption(0)).toHaveAccessibleDescription(
         "Det må være mer enn ett alternativ"
      );
   });
   test("Should create poll and verify table", async ({ memberPage, adminPage }) => {
      const eventPage = EventPage(memberPage);
      const eventPollPage = EventPollPage(memberPage);
      await eventPage.linkPolls.click();
      await expect(eventPollPage.mainHeading).toBeVisible();

      const name = "Hva skal vi drikke?";
      const nameNotUsed = "Denne skal ikke brukes!";
      const options = ["Øl", "Saft", "Brus"];

      await test.step("Create poll and verify", async () => {
         await eventPollPage.buttonCreatePoll.click();
         await eventPollPage.fillForm({ name, type: "Tekst", options });
         await eventPollPage.buttonSubmit.click();
         await eventPollPage.verifyPollTableHeader(name, false, options, ["0/0", "0/0", "0/0"], {
            [env.memberUsername]: [false, false, false],
         });
         // Check that list variant is hidden
         await expect(memberPage.getByRole("list", { name })).toBeHidden();
      });

      await test.step("Create another poll that will not be used", async () => {
         await eventPollPage.buttonCreatePoll.click();
         await eventPollPage.fillForm({ name: nameNotUsed, type: "Tekst", options });
         await eventPollPage.buttonSubmit.click();
         await eventPollPage.verifyPollTableHeader(nameNotUsed, false, options, ["0/0", "0/0", "0/0"], {
            [env.memberUsername]: [false, false, false],
         });
      });

      await test.step("Select as member and verify result", async () => {
         await eventPollPage.checkTablePollOption(name, false, env.memberUsername, "Saft");
         await eventPollPage.verifyPollTableHeader(name, false, options, ["0/1", "1/1", "0/1"], {
            [env.memberUsername]: [false, true, false],
         });
         await eventPollPage.checkTablePollOption(name, false, env.memberUsername, "Brus");
         await eventPollPage.verifyPollTableHeader(name, false, options, ["0/1", "0/1", "1/1"], {
            [env.memberUsername]: [false, false, true],
         });
      });

      await test.step("Select as admin and verify result", async () => {
         const homePage = HomePage(adminPage);
         const pollActivityPage = PollActivityPage(adminPage);
         const eventPollPage = EventPollPage(adminPage);

         // Goto poll
         await homePage.gotoEvent(eventName);
         await pollActivityPage.gotoPoll(name);

         // When navigating to poll it should hide all other polls
         await expect(eventPollPage.getPollTableForm(nameNotUsed)).toBeHidden();

         // Verify member selections is disabled
         await eventPollPage.verifyPollTableRowDisabled(name, false, env.memberUsername);
         await eventPollPage.verifyPollTableHeader(name, false, options, ["0/1", "0/1", "1/1"], {
            [env.memberUsername]: [false, false, true],
            [env.adminUsername]: [false, false, false],
         });

         await eventPollPage.checkTablePollOption(name, false, env.adminUsername, "Brus");
         await eventPollPage.verifyPollTableHeader(name, false, options, ["0/2", "0/2", "2/2"], {
            [env.memberUsername]: [false, false, true],
            [env.adminUsername]: [false, false, true],
         });
      });

      await test.step("Disable poll as member", async () => {
         await eventPollPage.editPoll(name, { isActive: false });
         await expect(eventPollPage.getPollTableForm(name)).toHaveAccessibleDescription("Avstemningen er avsluttet");
         await eventPollPage.verifyPollTableRowDisabled(name, false, env.memberUsername);
         await eventPollPage.verifyPollTableRowDisabled(name, false, env.adminUsername);
      });

      // Verify the original poll is not touched
      await eventPollPage.verifyPollTableHeader(nameNotUsed, false, options, ["0/0", "0/0", "0/0"], {
         [env.memberUsername]: [false, false, false],
      });
   });
});
