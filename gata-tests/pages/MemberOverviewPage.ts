import { expect, Locator, Page } from "@playwright/test";
import { GataHeader } from "./GataHeader";

export class MemberOverviewPage {
  header: GataHeader;
  pageTitle: Locator;
  memberList: Locator;

  constructor(page: Page) {
    this.header = new GataHeader(page);
    this.pageTitle = page.getByRole("heading", { name: "Brukere" });
    this.memberList = page.getByRole("list", { name: "Medlemmer" });
  }

  async goto() {
    await this.header.memberLink.click();
    await expect(this.pageTitle).toBeVisible();
  }

  async goToMember(name: string) {
    await this.memberList
      .getByRole("listitem")
      .filter({ hasText: name })
      .click();
  }
}
