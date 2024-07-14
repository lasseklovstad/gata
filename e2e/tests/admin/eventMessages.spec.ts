import { expect } from "@playwright/test";

import { env } from "e2e/pages/Environment";
import { EventActivityPage } from "e2e/pages/EventActivityPage";
import { EventFormPage } from "e2e/pages/EventFormPage";
import { EventPage } from "e2e/pages/EventPage";
import { HomePage } from "e2e/pages/HomePage";

import { testWithRoles as test } from "../../utils/fixtures";

const eventName = "Hyttetur";

test.describe("Event messages (Admin created)", () => {
   test.afterEach(async ({ adminPage }) => {
      const homePage = HomePage(adminPage);
      await homePage.goto();
      await expect(homePage.memberWelcomeTitle).toBeVisible();
      await homePage.deleteAllEvents();
   });
   test.beforeEach(async ({ adminPage }) => {
      await EventFormPage(adminPage).createEvent({ title: eventName, description: "En liten tur med venner" });
   });
   test("Should create new post", async ({ memberPage, adminPage }) => {
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
      // Todo, can remove when socket is implemented
      await memberPage.reload();
      await eventActivityPage.verifyReply(postMessage, postReply);
      await eventActivityPage.verifyLikes(postMessage, [{ type: "Hjerte", count: 1 }]);
   });
});
