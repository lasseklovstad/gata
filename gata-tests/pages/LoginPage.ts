import { expect, Page } from "@playwright/test";
import { Environment } from "./Environment";

export class LoginPage {
  page: Page;
  environment: Environment;

  constructor(page: Page) {
    this.page = page;
    this.environment = new Environment();
  }

  async login(username: string, password: string) {
    await this.page.goto(this.environment.baseUrl);
    await this.page.locator("role=button[name=/logg inn/i]").click();
    await this.page
      .locator("role=textbox[name=/email address/i]")
      .fill(username);
    await this.page.locator("role=textbox[name=/password/i]").fill(password);
    await this.page.locator("role=button[name=/continue/i]").click();
    await expect(
      this.page.locator("role=heading[name=/(Velkommen|Nyheter)/i]")
    ).toBeVisible();
  }
}
