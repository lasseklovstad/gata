import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { DocumentPage } from "../../pages/DocumentPage";
import { Environment } from "../../pages/Environment";
import { GataHeader } from "../../pages/GataHeader";
import { HomePage } from "../../pages/HomePage";
import { MemberPage } from "../../pages/MemberPage";
import { testWithRoles as test } from "../../utils/fixtures";
import { addLinkedUserWithAdmin, changePrimaryUser, removeLinkedUserWithAdmin } from "../../utils/linkUser";

const env = new Environment();
test("link non member to member and unlink", async ({ adminPage, nonMemberPage }) => {
   await addLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);

   await assertThatNonMemberIsLinked(nonMemberPage, env.memberUsername);

   await removeLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);

   await assertThatNonMemberIsNotMember(nonMemberPage);
});

test("link non member to member and change primary user", async ({ adminPage, nonMemberPage }) => {
   await addLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);

   await assertThatNonMemberIsLinked(nonMemberPage, env.memberUsername);
   await changePrimaryUser(adminPage, env.memberUsername, env.nonMemberUsername);
   await assertThatNonMemberIsLinked(nonMemberPage, env.nonMemberUsername);
   // Change back
   await changePrimaryUser(adminPage, env.nonMemberUsername, env.memberUsername);

   await removeLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);

   await assertThatNonMemberIsNotMember(nonMemberPage);
});

test("linked member should be able to edit news", async ({ adminPage, memberPage, nonMemberPage }) => {
   await addLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);

   const title = "Members are awesome";
   const description = "This is made by a member";
   const editContent = "Nå kan medlemmer linkes med andre medlemmer";

   await addNewsAsMember(memberPage, title, description);

   await editNewsAsNonMember(nonMemberPage, title, editContent);
   await assertEditNewsAsMember(memberPage, title, editContent);
   await deleteNews(nonMemberPage);
   await removeLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);
});

const deleteNews = async (page: Page) => {
   await page.goto("/");
   const homePage = new HomePage(page);
   await homePage.deleteAllNews();
};

const assertEditNewsAsMember = async (page: Page, title: string, content: string) => {
   await page.goto("/");
   const homePage = new HomePage(page);
   await homePage.assertNewsHasContent(title, content);
};

const addNewsAsMember = async (page: Page, title: string, description: string) => {
   await page.goto("/");
   const homePage = new HomePage(page);
   await homePage.addNews(title, description);
};

const editNewsAsNonMember = async (page: Page, title: string, newContent: string) => {
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

const assertThatNonMemberIsLinked = async (page: Page, primaryUsername: string) => {
   const memberPage = new MemberPage(page);
   const header = new GataHeader(page);

   // Navigate
   await page.goto("/");
   await header.validateRoleInMenu("medlem");
   await header.myPageLink.click();
   await memberPage.assertPrimaryEmail(primaryUsername);
};
