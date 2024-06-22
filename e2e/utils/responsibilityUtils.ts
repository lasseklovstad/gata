import type { Page } from "@playwright/test";

import { GataHeader } from "e2e/pages/GataHeader";
import { MemberOverviewPage } from "e2e/pages/MemberOverviewPage";
import { MemberPage } from "e2e/pages/MemberPage";
import { ResponsibilityPage } from "e2e/pages/ResponsibilityPage";

export const editResponsibility = async (page: Page, name: string, content: string) => {
   const memberPage = new MemberPage(page);
   const header = new GataHeader(page);
   await page.goto("/");
   await header.myPageLink.click();
   await memberPage.goToResponsibilityTab();
   await memberPage.editResponsibiblity(name, content);
};

export const removeResponsibility = async (page: Page, responsibilityName: string) => {
   const responsibilityPage = new ResponsibilityPage(page);
   await responsibilityPage.goto();
   await responsibilityPage.deleteResponsibility(responsibilityName);
};

export const removeResponsibilityFromMember = async (
   page: Page,
   responsibilityName: string,
   username: string,
   type: "member" | "admin"
) => {
   const memberOverviewPage = new MemberOverviewPage(page);
   const memberPage = new MemberPage(page);

   await memberOverviewPage.goto();
   await memberOverviewPage.gotoUser(username, type);
   await memberPage.goToResponsibilityTab();
   await memberPage.deleteResponsibility(responsibilityName);
};

export const addResponsibilityToMember = async (
   page: Page,
   responsibility: { name: string; description: string },
   username: string,
   type: "member" | "admin"
) => {
   const respPage = new ResponsibilityPage(page);
   await respPage.goto();
   await respPage.createNewResponsibility(responsibility.name, responsibility.description);
   await assignResponsibilityToMember(page, username, responsibility.name, type);
};

export const assignResponsibilityToMember = async (
   page: Page,
   username: string,
   responsibilityName: string,
   type: "member" | "admin"
) => {
   const memberOverviewPage = new MemberOverviewPage(page);
   const memberPage = new MemberPage(page);

   await memberOverviewPage.goto();
   await memberOverviewPage.gotoUser(username, type);
   await memberPage.goToResponsibilityTab();
   await memberPage.addResponsibility(responsibilityName);
};
