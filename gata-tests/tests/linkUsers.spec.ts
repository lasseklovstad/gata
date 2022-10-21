import { Browser, expect, Page, test } from "@playwright/test";
import { MemberOverviewPage } from "../pages/MemberOverviewPage";
import { Environment } from "../pages/Environment";
import { MemberPage } from "../pages/MemberPage";
import { GataHeader } from "../pages/GataHeader";
import { HomePage } from "../pages/HomePage";
import { DocumentPage } from "../pages/DocumentPage";
import { getAdminPage, getMemberPage, getNonMemberPage } from "../utils/page";
import {
  addLinkedUserWithAdmin,
  removeLinkedUserWithAdmin,
} from "../utils/linkUser";

const env = new Environment();
test("link non member to member and unlink", async ({ browser }) => {
  const adminPage = await getAdminPage(browser);
  await addLinkedUserWithAdmin(adminPage);
  const nonMemberPage = await getNonMemberPage(browser);
  await assertThatNonMemberIsLinked(nonMemberPage);

  await removeLinkedUserWithAdmin(adminPage);

  await assertThatNonMemberIsNotMember(nonMemberPage);
});

test("linked member should be able to edit news", async ({ browser }) => {
  const adminPage = await getAdminPage(browser);
  const nonMemberPage = await getNonMemberPage(browser);
  const memberPage = await getMemberPage(browser);

  await addLinkedUserWithAdmin(adminPage);

  const title = "Members are awesome";
  const description = "This is made by a member";
  const editContent = "Nå kan medlemmer linkes med andre medlemmer";

  await addNewsAsMember(memberPage, title, description);

  await editNewsAsNonMember(nonMemberPage, title, editContent);
  await assertEditNewsAsMember(memberPage, title, editContent);
  await deleteNews(nonMemberPage);
  await removeLinkedUserWithAdmin(adminPage);
});

const deleteNews = async (page: Page) => {
  await page.goto("/");
  const homePage = new HomePage(page);
  await homePage.deleteAllNews();
};

const assertEditNewsAsMember = async (
  page: Page,
  title: string,
  content: string
) => {
  await page.goto("/");
  const homePage = new HomePage(page);
  await homePage.assertNewsHasContent(title, content);
};

const addNewsAsMember = async (
  page: Page,
  title: string,
  description: string
) => {
  await page.goto("/");
  const homePage = new HomePage(page);
  await homePage.addNews(title, description);
};

const editNewsAsNonMember = async (
  page: Page,
  title: string,
  newContent: string
) => {
  await page.goto("/");
  const homePage = new HomePage(page);
  const documentPage = new DocumentPage(page);
  await homePage.clickEditNewsItem(title);
  await documentPage.editContent(newContent);
};

const assertThatNonMemberIsNotMember = async (page: Page) => {
  const homePage = new HomePage(page);

  await page.goto("/");
  await expect(homePage.nonMemberInformationText).toBeVisible();

  const header = new GataHeader(page);
  await header.validateRoleInMenu("ingen");
};

const assertThatNonMemberIsLinked = async (page: Page) => {
  const memberPage = new MemberPage(page);
  const header = new GataHeader(page);

  // Navigate
  await page.goto("/");
  await header.validateRoleInMenu("medlem");
  await header.myPageLink.click();
  await memberPage.assertPrimaryEmail(env.memberUsername);
};