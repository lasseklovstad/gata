import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { MemberOverviewPage } from "../pages/MemberOverviewPage";
import { MemberPage } from "../pages/MemberPage";

export const addLinkedUserWithAdmin = async (page: Page, primaryUserName: string, linkUsername: string) => {
   const memberPage = new MemberPage(page);
   await goToMemberPageWithAdmin(page, primaryUserName);
   await memberPage.linkUser(linkUsername);
};

export const changePrimaryUser = async (page: Page, currentPrimaryUserName: string, newPrimaryUserName: string) => {
   const memberPage = new MemberPage(page);
   await goToMemberPageWithAdmin(page, currentPrimaryUserName);
   await memberPage.changePrimaryUser(newPrimaryUserName);
};

const goToMemberPageWithAdmin = async (page: Page, username: string) => {
   const memberOverviewPage = new MemberOverviewPage(page);
   const memberPage = new MemberPage(page);

   // Navigate
   await page.goto("/");
   await memberOverviewPage.goto();
   await memberOverviewPage.gotoUser(username, "member");

   await expect(memberPage.pageTitle).toBeVisible();
};

export const removeLinkedUserWithAdmin = async (page: Page, primaryUsername: string, linkedUsername: string) => {
   const memberPage = new MemberPage(page);
   await goToMemberPageWithAdmin(page, primaryUsername);
   await memberPage.removeLinkedUser(linkedUsername);
};
