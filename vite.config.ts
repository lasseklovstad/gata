import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter, type SentryReactRouterBuildOptions } from "@sentry/react-router";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const sentryConfig: SentryReactRouterBuildOptions = {
   org: "gata-kp",
   project: "javascript-react-router",
   // An auth token is required for uploading source maps;
   // store it in an environment variable to keep it secure.
   authToken: process.env.SENTRY_AUTH_TOKEN,
   release: { name: process.env.COMMIT_SHA },
   sourcemaps: {
      filesToDeleteAfterUpload: ["./build/**/*.map"],
   },
};

export default defineConfig((config) => ({
   ssr: {
      noExternal: ["react-easy-crop", "tslib"],
   },
   build: {
      sourcemap: true,
   },
   server: {
      port: 3000,
   },
   plugins: [
      reactRouter(),
      tsconfigPaths(),
      process.env.NODE_ENV === "development" ? checker({ typescript: true }) : undefined,
      process.env.SENTRY_AUTH_TOKEN ? sentryReactRouter(sentryConfig, config) : undefined,
   ],
   test: {
      environment: "node",
      dir: "./app",
      include: ["**/*.test.ts"],
      setupFiles: ["./tests/vitestSetup.ts"],
      clearMocks: true,
      maxWorkers: 1,
      env: {
         APP_DATABASE_URL: "sqlite_test.db",
      },
   },
}));
