import { Page } from "@playwright/test";
import {
  getAdminPage,
  getMemberPage,
  getNonMemberPage,
} from "../../utils/page";
import { ResponsibilityPage } from "../../pages/ResponsibilityPage";
import { MemberOverviewPage } from "../../pages/MemberOverviewPage";
import { MemberPage } from "../../pages/MemberPage";
import { Environment } from "../../pages/Environment";
import { GataHeader } from "../../pages/GataHeader";
import {
  addLinkedUserWithAdmin,
  removeLinkedUserWithAdmin,
} from "../../utils/linkUser";
import { testWithRoles as test } from "../../utils/fixtures";

const env = new Environment();

test("linked member should be able to edit responsibility", async ({
  adminPage,
  memberPage,
  nonMemberPage,
}) => {
  test.slow();
  const responsibilityName = "Aktivitetsansvarlig";
  await addResponsibilityToMember(adminPage, responsibilityName);
  await editResponsibility(memberPage, responsibilityName, "Jeg er medlem");
  await addLinkedUserWithAdmin(
    adminPage,
    env.memberUsername,
    env.nonMemberUsername
  );
  await editResponsibility(
    nonMemberPage,
    responsibilityName,
    "Jeg er ikke medlem"
  );

  await removeResponsibilityFromMember(adminPage, responsibilityName);
  await removeResponsibility(adminPage, responsibilityName);
  await removeLinkedUserWithAdmin(
    adminPage,
    env.memberUsername,
    env.nonMemberUsername
  );
});

const editResponsibility = async (
  page: Page,
  name: string,
  content: string
) => {
  const memberPage = new MemberPage(page);
  const header = new GataHeader(page);
  await page.goto("/");
  await header.myPageLink.click();
  await memberPage.goToResponsibilityTab();
  await memberPage.editResponsibiblity(name, content);
};

const removeResponsibility = async (page: Page, responsibilityName: string) => {
  const responsibilityPage = new ResponsibilityPage(page);

  await page.goto("/");
  await responsibilityPage.goto();
  await responsibilityPage.deleteResponsibility(responsibilityName);
};

const removeResponsibilityFromMember = async (
  page: Page,
  responsibilityName: string
) => {
  const memberOverviewPage = new MemberOverviewPage(page);
  const memberPage = new MemberPage(page);

  await page.goto("/");
  await memberOverviewPage.goto();
  await memberOverviewPage.gotoUser(env.memberUsername, "member");
  await memberPage.goToResponsibilityTab();
  await memberPage.deleteResponsibility(responsibilityName);
};

const addResponsibilityToMember = async (
  page: Page,
  responsibilitName: string
) => {
  const respPage = new ResponsibilityPage(page);
  await page.goto("/");
  await respPage.goto();
  await respPage.createNewResponsibility(responsibilitName, "Han er kul");
  await assignResponsibilityToMember(
    page,
    env.memberUsername,
    responsibilitName
  );
};

const assignResponsibilityToMember = async (
  page: Page,
  username: string,
  responsibilityName: string
) => {
  const memberOverviewPage = new MemberOverviewPage(page);
  const memberPage = new MemberPage(page);

  await page.goto("/");
  await memberOverviewPage.goto();
  await memberOverviewPage.gotoUser(username, "member");
  await memberPage.goToResponsibilityTab();
  await memberPage.addResponsibility(responsibilityName);
};
