import type { Page } from "@playwright/test";
import { test as base } from "@playwright/test";

import { getAdminPage, getNonMemberPage, getMemberPage } from "./page";

export const testWithRoles = base.extend<{
   adminPage: Page;
   memberPage: Page;
   nonMemberPage: Page;
}>({
   adminPage: async ({ browser }, use) => {
      const page = await getAdminPage(browser);
      await use(page);
      await page.context().close();
   },
   memberPage: async ({ browser }, use) => {
      const page = await getMemberPage(browser);
      await use(page);
      await page.context().close();
   },
   nonMemberPage: async ({ browser }, use) => {
      const page = await getNonMemberPage(browser);
      await use(page);
      await page.context().close();
   },
});
