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
    await this.page.getByRole("button", { name: "Logg inn" }).click();
    await this.page
      .getByRole("textbox", { name: "Email address" })
      .fill(username);
    await this.page.getByRole("textbox", { name: "Password" }).fill(password);
    await this.page.getByRole("button", { name: "Continue" }).click();
    await expect(
      this.page.getByRole("heading", { name: /(Velkommen|Nyheter)/i })
    ).toBeVisible();
  }
}
