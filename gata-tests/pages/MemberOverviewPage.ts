import { expect, Locator, Page } from "@playwright/test";
import { GataHeader } from "./GataHeader";

export class MemberOverviewPage {
  header: GataHeader;
  pageTitle: Locator;
  memberList: Locator;

  constructor(page: Page) {
    this.header = new GataHeader(page);
    this.pageTitle = page.locator("role=heading[name=/brukere/i]");
    this.memberList = page.locator("role=list[name=/medlemmer/i]");
  }

  async goto() {
    await this.header.memberLink.click();
    await expect(this.pageTitle).toBeVisible();
  }

  async goToMember(name: string) {
    await this.memberList.locator("role=listitem", { hasText: name }).click();
  }
}
