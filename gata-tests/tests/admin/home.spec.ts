import { test, expect } from "@playwright/test";
import { GataHeader } from "../../pages/GataHeader";
import { HomePage } from "../../pages/HomePage";

test.use({ storageState: "adminStorageState.json" });

test("Should have welcome title", async ({ page }) => {
  await page.goto("/");
  const gataHeader = new GataHeader(page);
  const homePage = new HomePage(page);
  await expect(page).toHaveTitle(/Gata/);

  await expect(homePage.welcomeTitle).toBeVisible();
  await expect(gataHeader.homeLink).toBeVisible();
  await expect(gataHeader.responsibilityLink).toBeVisible();
  await expect(gataHeader.documentsLink).toBeVisible();
  await expect(gataHeader.memberLink).toBeVisible();
  await expect(gataHeader.myPageLink).toBeVisible();
});
