import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class GataHeader {
   page: Page;
   responsibilityLink: Locator;
   homeLink: Locator;
   memberLink: Locator;
   documentsLink: Locator;
   menuButton: Locator;
   menu: Locator;

   constructor(page: Page) {
      this.responsibilityLink = page.getByRole("link", { name: "Ansvarsposter" });
      this.homeLink = page.getByRole("link", { name: "Hjem", exact: true });
      this.memberLink = page.getByRole("link", { name: "Medlemmer" });
      this.documentsLink = page.getByRole("link", {
         name: "Aktuelle dokumenter",
      });
      this.menuButton = page.getByRole("button", { name: "Åpne meny" });
      this.menu = page.getByRole("menu");
      this.page = page;
   }

   async validateRoleInMenu(role: "admin" | "medlem" | "admin og medlem" | "ingen") {
      await this.menuButton.click();
      await expect(this.menu).toBeVisible();
      const roleButton = this.menu.filter({ hasText: role });
      await expect(roleButton).toBeVisible();
      await this.page.keyboard.press("Escape");
      await expect(this.menu).toBeHidden();
   }

   async clickMenuItem(name: "Min side") {
      await this.menuButton.click();
      await this.page.getByRole("menuitem", { name }).click();
   }
}
