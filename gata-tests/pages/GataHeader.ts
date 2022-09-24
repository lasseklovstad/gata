import { Locator, Page } from "@playwright/test";

export class GataHeader {
  responsibilityLink: Locator;
  homeLink: Locator;
  myPageLink: Locator;
  memberLink: Locator;
  documentsLink: Locator;

  constructor(page: Page) {
    this.responsibilityLink = page.locator("role=link[name=/ansvarsposter/i]");
    this.homeLink = page.locator("role=link[name=/Hjem/i]");
    this.myPageLink = page.locator("role=link[name=/Min side/i]");
    this.memberLink = page.locator("role=link[name=/medlemmer/i]");
    this.documentsLink = page.locator("role=link[name=/aktuelle dokumenter/i]");
  }
}
