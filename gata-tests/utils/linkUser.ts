import { expect, Page } from "@playwright/test";
import { MemberPage } from "../pages/MemberPage";
import { MemberOverviewPage } from "../pages/MemberOverviewPage";
import { Environment } from "../pages/Environment";
const env = new Environment();
export const addLinkedUserWithAdmin = async (
  page: Page,
  primaryUserName: string,
  linkUsername: string
) => {
  const memberPage = new MemberPage(page);
  await goToMemberPageWithAdmin(page, primaryUserName);
  await memberPage.linkUser(linkUsername);
};

export const changePrimaryUser = async (
  page: Page,
  currentPrimaryUserName: string,
  newPrimaryUserName: string
) => {
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
  await memberOverviewPage.goToMember(username);

  await expect(memberPage.pageTitle).toBeVisible();
};

export const removeLinkedUserWithAdmin = async (
  page: Page,
  primaryUsername: string,
  linkedUsername: string
) => {
  const memberPage = new MemberPage(page);
  await goToMemberPageWithAdmin(page, primaryUsername);
  await memberPage.removeLinkedUser(linkedUsername);
};
