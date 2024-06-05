import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { ConfirmModal } from "../../pages/ConfirmModal";
import { env } from "../../pages/Environment";
import { MemberOverviewPage } from "../../pages/MemberOverviewPage";
import { MemberPage } from "../../pages/MemberPage";
import { addLinkedUserWithAdmin, changePrimaryUser, removeLinkedUserWithAdmin } from "../../utils/linkUser";

test.use({ storageState: "adminStorageState.json" });

test.describe.serial("Contingent", () => {
   test("Should show that member and admin should pay contingent", async ({ page }) => {
      const memberOverviewPage = new MemberOverviewPage(page);

      await verifyUsersNotPaid(page, [env.adminUsername, env.memberUsername]);

      await memberOverviewPage.gotoUser(env.memberUsername, "member");
      const memberPage = new MemberPage(page);
      const today = new Date();
      await memberPage.markContingentAsPaid(today.getFullYear(), true);

      await verifyUsersNotPaid(page, [env.adminUsername]);
   });
   test("Should show correct username after linking and changing primary email", async ({ page }) => {
      const memberOverviewPage = new MemberOverviewPage(page);
      await verifyUsersNotPaid(page, [env.adminUsername]);
      await addLinkedUserWithAdmin(page, env.memberUsername, env.nonMemberUsername);
      // Just check that only admin should pay after linking
      await verifyUsersNotPaid(page, [env.adminUsername]);

      await memberOverviewPage.gotoUser(env.memberUsername, "member");
      const memberPage = new MemberPage(page);
      const today = new Date();
      await memberPage.markContingentAsPaid(today.getFullYear(), false);
      await memberPage.markContingentAsPaid(today.getFullYear() - 1, true);
      // Admin and primary user of linked member should receive mail
      await changePrimaryUser(page, env.memberUsername, env.nonMemberUsername);

      await verifyUsersNotPaid(page, [env.adminUsername, env.nonMemberUsername]);

      // Change back
      await changePrimaryUser(page, env.nonMemberUsername, env.memberUsername);
      await memberPage.markContingentAsPaid(today.getFullYear() - 1, false);
      await verifyUsersNotPaid(page, [env.adminUsername, env.memberUsername]);
      await removeLinkedUserWithAdmin(page, env.memberUsername, env.nonMemberUsername);
   });
});

const verifyUsersNotPaid = async (page: Page, users: string[]) => {
   const memberOverviewPage = new MemberOverviewPage(page);
   const confirmDialog = new ConfirmModal(page);
   await memberOverviewPage.goto();
   await memberOverviewPage.buttonContingent.click();
   const usersPayingList = confirmDialog.dialog.getByRole("listitem");
   await expect(usersPayingList).toHaveCount(users.length);
   for (const user of users) {
      await expect(usersPayingList.filter({ hasText: user })).toBeVisible();
   }
   await confirmDialog.cancel();
};
