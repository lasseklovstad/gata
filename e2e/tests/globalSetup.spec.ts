import { test } from "@playwright/test";

import { env } from "../pages/Environment";
import { LoginPage } from "../pages/LoginPage";
import { setupUserRoles } from "../utils/setup";

test.skip(env.skipSetup);

test.describe.serial("Global Setup", () => {
   test("Login admin", async ({ page }) => {
      const memberLogin = new LoginPage(page);
      await memberLogin.login(env.adminUsername, env.adminPassword);
      await page.context().storageState({ path: "adminStorageState.json" });
   });
   test("Login non member", async ({ page }) => {
      const memberLogin = new LoginPage(page);
      await memberLogin.login(env.nonMemberUsername, env.nonMemberPassword);
      await page.context().storageState({ path: "nonMemberStorageState.json" });
   });
   test("Login member", async ({ page }) => {
      const memberLogin = new LoginPage(page);
      await memberLogin.login(env.memberUsername, env.memberPassword);
      await page.context().storageState({ path: "memberStorageState.json" });
   });
});

test.describe("Configure roles", () => {
   test.use({ storageState: "adminStorageState.json" });
   test("Should give member the 'Medlem' role", async ({ page }) => {
      await setupUserRoles(page, true);
   });
});
