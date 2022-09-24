import { expect, Locator, Page } from "@playwright/test";

export class GataHeader {
  page: Page;
  responsibilityLink: Locator;
  homeLink: Locator;
  myPageLink: Locator;
  memberLink: Locator;
  documentsLink: Locator;
  menuButton: Locator;
  menu: Locator;

  constructor(page: Page) {
    this.responsibilityLink = page.locator("role=link[name=/ansvarsposter/i]");
    this.homeLink = page.locator("role=link[name=/Hjem/i]");
    this.myPageLink = page.locator("role=link[name=/Min side/i]");
    this.memberLink = page.locator("role=link[name=/medlemmer/i]");
    this.documentsLink = page.locator("role=link[name=/aktuelle dokumenter/i]");
    this.menuButton = page.locator("role=button[name=/åpne meny/i]");
    this.menu = page.locator("role=banner").locator("role=menu");
    this.page = page;
  }

  async validateRoleInMenu(
    role: "admin" | "medlem" | "admin og medlem" | "ingen"
  ) {
    await this.menuButton.click();
    await expect(this.menu).toBeVisible();
    const roleButton = this.menu.locator("role=menuitem", { hasText: role });
    await expect(roleButton).toBeVisible();
    await roleButton.click();
    await expect(this.menu).toBeHidden();
  }
}
