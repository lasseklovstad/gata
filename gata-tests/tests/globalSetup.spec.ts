import { expect, Page, test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { Environment } from "../pages/Environment";
import { GataHeader } from "../pages/GataHeader";
import { MemberOverviewPage } from "../pages/MemberOverviewPage";
import { MemberPage } from "../pages/MemberPage";

const env = new Environment();

test.describe.serial("Global Setup", () => {
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

test.describe.serial("Configure roles", () => {
  test.use({ storageState: "adminStorageState.json" });
  test("Should give member the 'Medlem' role", async ({ page }) => {
    const memberOverview = new MemberOverviewPage(page);
    const memberPage = new MemberPage(page);
    await memberOverview.goto();
    await memberOverview.addUser(env.memberUsername);
    await memberOverview.goToNonMember(env.memberUsername);
    await memberPage.addRole("Medlem");
    await memberOverview.goto();
    await memberOverview.verifyMember(env.memberUsername);
  });
});
