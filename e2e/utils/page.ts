import type { Browser } from "@playwright/test";

const getPageFromStorageState = async (browser: Browser, storageState: string) => {
   const context = await browser.newContext({
      storageState,
   });
   return context.newPage();
};

export const getAdminPage = (browser: Browser) => {
   return getPageFromStorageState(browser, "adminStorageState.json");
};

export const getMemberPage = (browser: Browser) => {
   return getPageFromStorageState(browser, "memberStorageState.json");
};

export const getNonMemberPage = (browser: Browser) => {
   return getPageFromStorageState(browser, "nonMemberStorageState.json");
};
