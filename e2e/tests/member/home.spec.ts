import { expect, test } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { GataHeader } from "../../pages/GataHeader";

test.use({ storageState: "memberStorageState.json" });

test("Should show the news", async ({ page }) => {
  await page.goto("/");
  const homePage = new HomePage(page);
  await expect(homePage.memberWelcomeTitle).toBeVisible();
});

test("Should add news", async ({ page }) => {
  await page.goto("/");
  const homePage = new HomePage(page);
  const header = new GataHeader(page);
  await homePage.addNews(
    "Automatisk test",
    "Playwright er brukt til å lage denne nyheten"
  );
  await header.homeLink.click();
  await expect(homePage.newsList).toBeVisible();
  await homePage.deleteAllNews();
});
