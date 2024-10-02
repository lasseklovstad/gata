import { expect } from "@playwright/test";

import { env } from "e2e/pages/Environment";
import { EventActivityPage } from "e2e/pages/EventActivityPage";
import { EventFormPage } from "e2e/pages/EventFormPage";
import { EventPage } from "e2e/pages/EventPage";
import { HomePage } from "e2e/pages/HomePage";

import { testWithRoles as test } from "../../utils/fixtures";

const eventName = "Hyttetur";

test.describe("Events (Admin created)", () => {
   test.afterEach(async ({ adminPage }) => {
      const homePage = HomePage(adminPage);
      await homePage.goto();
      await expect(homePage.memberWelcomeTitle).toBeVisible();
      await homePage.deleteAllEvents();
   });
   test("Should create new post in event", async ({ memberPage, adminPage }) => {
      await EventFormPage(adminPage).createEvent({ title: eventName, description: "En liten tur med venner" });
      const homePage = HomePage(memberPage);
      await homePage.gotoEvent(eventName);
      const eventPage = EventPage(memberPage);
      await expect(eventPage.mainHeading).toBeVisible();

      const eventActivityPage = EventActivityPage(memberPage);
      const postMessage = "Når tenker folk å dra?";
      const postReply = "Jeg drar ca. 11";
      await eventActivityPage.createNewPost("Velkommen til hyttetur jeg gleder meg!!!");
      await eventActivityPage.createNewPost(postMessage);

      const postItem = eventActivityPage.getPostListItem(postMessage);
      await expect(postItem).toBeVisible();
      await expect(postItem).toContainText(env.memberUsername);

      await test.step("Like post as admin", async () => {
         await HomePage(adminPage).gotoEvent(eventName);
         const eventActivityAdminPage = EventActivityPage(adminPage);
         await eventActivityAdminPage.likePost(postMessage, "Tommel opp");
         await eventActivityAdminPage.verifyLikes(postMessage, [{ type: "Tommel opp", count: 1 }]);
         await eventActivityAdminPage.likePost(postMessage, "Tommel opp");
         await eventActivityAdminPage.verifyLikes(postMessage, []);
         await eventActivityAdminPage.likePost(postMessage, "Tommel opp");
         await eventActivityAdminPage.likePost(postMessage, "Hjerte");
         await eventActivityAdminPage.verifyLikes(postMessage, [{ type: "Hjerte", count: 1 }]);

         await eventActivityAdminPage.addReply(postMessage, postReply);
         await eventActivityAdminPage.verifyReply(postMessage, postReply);
      });

      // The page will update automatically with events.
      await eventActivityPage.verifyReply(postMessage, postReply);
      await eventActivityPage.verifyLikes(postMessage, [{ type: "Hjerte", count: 1 }]);
   });
   test("Should create new event only visible to organizers", async ({ memberPage, adminPage }) => {
      await EventFormPage(adminPage).createEvent({
         title: "Arr kunn for arrangører 1",
         description: "Denne skal ikke være synlig",
         visibility: "Arrangører",
      });
      await EventFormPage(adminPage).createEvent({
         title: "Arr for alle",
         description: "Denne skal ikke være synlig",
         visibility: "Alle",
      });
      await EventFormPage(adminPage).createEvent({
         title: "Arr kunn for arrangører 2",
         description: "Denne skal ikke være synlig før vi har endret på event",
         visibility: "Arrangører",
      });
      const homePage = HomePage(memberPage);

      await test.step("Verify event is hidden", async () => {
         await expect(homePage.welcomeTitle).toBeVisible();
         await expect(homePage.getEventLink("Arr for alle")).toBeVisible();
         await expect(homePage.getEventLink("Arr kunn for arrangører 1")).toBeHidden();
         await expect(homePage.getEventLink("Arr kunn for arrangører 2")).toBeHidden();
      });

      await test.step("Goto event as admin and add member as organizer", async () => {
         const homePage = HomePage(adminPage);
         const eventPage = EventPage(adminPage);
         await homePage.goto();
         await expect(homePage.getEventLink("Arr for alle")).toBeVisible();
         await expect(homePage.getEventLink("Arr kunn for arrangører 1")).toBeVisible();
         await expect(homePage.getEventLink("Arr kunn for arrangører 2")).toBeVisible();
         await homePage.gotoEvent("Arr kunn for arrangører 1");
         await eventPage.selectOrganizers(env.memberUsername);
      });

      await test.step("Member should now have access to hidden event", async () => {
         await homePage.goto();
         await expect(homePage.getEventLink("Arr for alle")).toBeVisible();
         await expect(homePage.getEventLink("Arr kunn for arrangører 1")).toBeVisible();
         await expect(homePage.getEventLink("Arr kunn for arrangører 2")).toBeHidden();
      });
   });
});
