import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import "dotenv/config";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
   testDir: "./e2e/tests",
   /* Maximum time one test can run for. */
   timeout: 30 * 1000,
   expect: {
      /**
       * Maximum time expect() should wait for the condition to be met.
       * For example in `await expect(locator).toHaveText();`
       */
      timeout: 5000,
   },
   /* Run tests in files in parallel */
   fullyParallel: false,
   /* Fail the build on CI if you accidentally left test.only in the source code. */
   forbidOnly: !!process.env.CI,
   /* Retry on CI only */
   retries: 0,
   /* Opt out of parallel tests on CI. */
   workers: 1,
   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
   reporter: [["html"], ["line"]],
   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
   use: {
      /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
      actionTimeout: 0,
      /* Base URL to use in actions like `await page.goto('/')`. */
      // baseURL: 'http://localhost:3000',

      /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
      trace: process.env.CI ? "retain-on-failure" : "on",
      baseURL: process.env.PLAYWRIGHT_BASE_URL,
   },
   projects: [
      {
         name: "setup",
         use: {
            ...devices["Desktop Chrome"],
         },
         testMatch: ["globalSetup.spec.ts"],
      },
      {
         name: "main",
         dependencies: ["setup"],
         use: {
            ...devices["Desktop Chrome"],
         },
         testIgnore: ["globalSetup.spec.ts"],
      },
   ],
   webServer: [
      {
         timeout: 30 * 1000,
         command: "npm run start",
         url: process.env.PLAYWRIGHT_BASE_URL + "/health",
         reuseExistingServer: !process.env.CI,
      },
   ],
};

export default config;
