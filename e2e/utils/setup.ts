import type { Page } from "@playwright/test";

import { env } from "../pages/Environment";
import { MemberOverviewPage } from "../pages/MemberOverviewPage";
import { MemberPage } from "../pages/MemberPage";

export const setupUserRoles = async (page: Page, addMemberRoleToAdmin: boolean) => {
   const memberOverview = new MemberOverviewPage(page);
   const memberPage = new MemberPage(page);
   await memberOverview.goto();

   // Add member
   await memberOverview.addUser(env.memberUsername);
   await memberOverview.gotoUser(env.memberUsername, "notMember");
   await memberPage.addRole("Medlem");

   if (addMemberRoleToAdmin) {
      // Add member to admin as well
      await memberOverview.goto();
      await memberOverview.gotoUser(env.adminUsername, "admin");
      await memberPage.addRole("Medlem");
   }
   await memberOverview.goto();

   await memberOverview.verifyUsersInList(env.memberUsername, "member");
   await memberOverview.verifyUsersInList(env.nonMemberUsername, "loggedIn");
};
