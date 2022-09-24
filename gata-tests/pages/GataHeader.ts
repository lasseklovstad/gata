import { Page } from "@playwright/test";

export const GataHeader = (page: Page) => {
  const responsibilityLink = page.locator("role=link[name=/ansvarsposter/i]");
  const homeLink = page.locator("role=link[name=/Hjem/i]");
  const myPageLink = page.locator("role=link[name=/Min side/i]");
  const memberLink = page.locator("role=link[name=/medlemmer/i]");
  const documentsLink = page.locator("role=link[name=/aktuelle dokumenter/i]");

  return {
    responsibilityLink,
    homeLink,
    myPageLink,
    memberLink,
    documentsLink,
  };
};
