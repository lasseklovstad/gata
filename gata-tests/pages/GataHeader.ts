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
    this.responsibilityLink = page.getByRole("link", { name: "Ansvarsposter" });
    this.homeLink = page.getByRole("link", { name: "Hjem" });
    this.myPageLink = page.getByRole("link", { name: "Min side" });
    this.memberLink = page.getByRole("link", { name: "Medlemmer" });
    this.documentsLink = page.getByRole("link", {
      name: "Aktuelle dokumenter",
    });
    this.menuButton = page.getByRole("button", { name: "Åpne meny" });
    this.menu = page.getByRole("banner").getByRole("menu");
    this.page = page;
  }

  async validateRoleInMenu(
    role: "admin" | "medlem" | "admin og medlem" | "ingen"
  ) {
    await this.menuButton.click();
    await expect(this.menu).toBeVisible();
    const roleButton = this.menu
      .getByRole("menuitem")
      .filter({ hasText: role });
    await expect(roleButton).toBeVisible();
    await roleButton.click();
    await expect(this.menu).toBeHidden();
  }
}
