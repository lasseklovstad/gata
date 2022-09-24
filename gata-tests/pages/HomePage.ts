import { Page } from "@playwright/test";

export const HomePage = (page: Page) => {
  const welcomeTitle = page.locator("role=heading[name=Velkommen]");

  return {
    welcomeTitle,
  };
};
