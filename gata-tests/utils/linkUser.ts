import { expect, Page } from "@playwright/test";
import { MemberPage } from "../pages/MemberPage";
import { MemberOverviewPage } from "../pages/MemberOverviewPage";
import { Environment } from "../pages/Environment";
const env = new Environment();
export const addLinkedUserWithAdmin = async (page: Page) => {
  const memberPage = new MemberPage(page);
  await goToMemberPageWithAdmin(page);
  await memberPage.linkUser(env.nonMemberUsername);
};

const goToMemberPageWithAdmin = async (page: Page) => {
  const memberOverviewPage = new MemberOverviewPage(page);
  const memberPage = new MemberPage(page);

  // Navigate
  await page.goto("/");
  await memberOverviewPage.goto();
  await memberOverviewPage.goToMember(env.memberUsername);

  await expect(memberPage.pageTitle).toBeVisible();
};

export const removeLinkedUserWithAdmin = async (page: Page) => {
  const memberPage = new MemberPage(page);
  await goToMemberPageWithAdmin(page);
  await memberPage.removeLinkedUser(env.nonMemberUsername);
};
