// global-setup.ts
import { chromium, expect, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const adminPage = await browser.newPage();
  await adminPage.goto(process.env.PLAYWRIGHT_BASE_URL);
  await adminPage.locator("role=button[name=/logg inn/i]").click();
  await adminPage
    .locator("role=textbox[name=/email address/i]")
    .type(process.env.PLAYWRIGHT_ADMIN_USERNAME);
  await adminPage
    .locator("role=textbox[name=/password/i]")
    .type(process.env.PLAYWRIGHT_ADMIN_PASSWORD);
  await adminPage.locator("role=button[name=/continue/i]").click();
  await expect(adminPage.locator("role=heading[name=Velkommen]")).toBeVisible();
  await adminPage.context().storageState({ path: "adminStorageState.json" });
  await browser.close();
}

export default globalSetup;
