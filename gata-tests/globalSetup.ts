// global-setup.ts
import { Browser, chromium, expect, FullConfig } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { Environment } from "./pages/Environment";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch({
    headless: !!process.env.CI,
  });
  const env = new Environment();

  await login(
    browser,
    env.nonMemberUsername,
    env.nonMemberPassword,
    "nonMemberStorageState.json"
  );

  await login(
    browser,
    env.adminUsername,
    env.adminPassword,
    "adminStorageState.json"
  );
  await login(
    browser,
    env.memberUsername,
    env.memberPassword,
    "memberStorageState.json"
  );

  await browser.close();
}

const login = async (
  browser: Browser,
  username: string,
  password: string,
  path: string
) => {
  const memberPage = await browser.newPage();
  const memberLogin = new LoginPage(memberPage);
  await memberLogin.login(username, password);
  await memberPage.context().storageState({ path });
};

export default globalSetup;
