import { expect, Page, test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { Environment } from "../pages/Environment";

test.describe("Global Setup", () => {
  test("Login admin", async ({ page }) => {
    const env = new Environment();
    const memberLogin = new LoginPage(page);
    await memberLogin.login(env.adminUsername, env.adminPassword);
    await page.context().storageState({ path: "adminStorageState.json" });
  });
  test("Login non member", async ({ page }) => {
    const env = new Environment();
    const memberLogin = new LoginPage(page);
    await memberLogin.login(env.nonMemberUsername, env.nonMemberPassword);
    await page.context().storageState({ path: "nonMemberStorageState.json" });
  });
  test("Login member", async ({ page }) => {
    const env = new Environment();
    const memberLogin = new LoginPage(page);
    await memberLogin.login(env.memberUsername, env.memberPassword);
    await page.context().storageState({ path: "memberStorageState.json" });
  });
});
