import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { DocumentPage } from "../../pages/DocumentPage";
import { env } from "../../pages/Environment";
import { HomePage } from "../../pages/HomePage";
import { MemberOverviewPage } from "../../pages/MemberOverviewPage";
import { MemberPage } from "../../pages/MemberPage";
import { testWithRoles as test } from "../../utils/fixtures";
import { addLinkedUserWithAdmin } from "../../utils/linkUser";
import { setupUserRoles } from "../../utils/setup";

test.describe("Delete user", () => {
   test.afterEach(async ({ adminPage }) => {
      await setupUserRoles(adminPage, false);
   });
   test("Should delete user", async ({ adminPage }) => {
      await deleteUser(adminPage);
   });
   test("Should delete member that has added news", async ({ adminPage, memberPage }) => {
      await test.step("Member should add news", async () => {
         const homePage = new HomePage(memberPage);
         const documentPage = new DocumentPage(memberPage);
         await homePage.goto();
         await homePage.addNews("Automatisk test", "Kake er godt");
         await documentPage.editContent("Jeg kommer til å bli slette");
      });

      await deleteUser(adminPage);

      await test.step("Check that news item is still there", async () => {
         const homePage = new HomePage(adminPage);
         await homePage.goto();
         await homePage.assertNewsHasContent("Automatisk test", "Jeg kommer til å bli slette");
         await homePage.deleteNews("Automatisk test");
      });
   });
   test("Should delete member has linked user", async ({ adminPage }) => {
      const memberOverviewPage = new MemberOverviewPage(adminPage);
      await addLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);

      await deleteUser(adminPage);

      await memberOverviewPage.goto();
      await memberOverviewPage.verifyUsersInList([env.nonMemberUsername, env.memberUsername], "loggedIn");
   });
});

test("Should not be able to delete your own user", async ({ adminPage }) => {
   const memberPage = new MemberPage(adminPage);
   const memberOverviewPage = new MemberOverviewPage(adminPage);
   await memberOverviewPage.goto();
   await memberOverviewPage.gotoUser(env.adminUsername, "admin");
   await memberPage.deleteUser();
   await expect(adminPage.getByText("Du kan ikke slette deg selv!")).toBeVisible();
});

const deleteUser = async (adminPage: Page) => {
   const memberPage = new MemberPage(adminPage);
   const memberOverviewPage = new MemberOverviewPage(adminPage);
   await memberOverviewPage.goto();
   await memberOverviewPage.gotoUser(env.memberUsername, "member");
   await memberPage.deleteUser();
   // Delete will navigate to overview
   await memberOverviewPage.verifyUsersInList([env.memberUsername, env.nonMemberUsername], "loggedIn");
};
