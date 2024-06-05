import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class LoginPage {
   page: Page;

   constructor(page: Page) {
      this.page = page;
   }

   async login(username: string, password: string) {
      await this.page.goto("");
      await this.page.getByRole("button", { name: "Logg inn" }).click();
      await this.page.getByRole("textbox", { name: "Email address" }).fill(username);
      await this.page.getByRole("textbox", { name: "Password" }).fill(password);
      await this.page.getByRole("button", { name: "Continue" }).click();
      await expect(this.page.getByRole("heading", { name: /(Velkommen|Nyheter)/i })).toBeVisible();
   }
}
