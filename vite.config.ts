import { reactRouter } from "@react-router/dev/vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
   ssr: {
      noExternal: ["react-easy-crop", "tslib"],
   },
   server: {
      port: 3000,
   },
   plugins: [
      reactRouter(),
      tsconfigPaths(),
      process.env.NODE_ENV === "development" ? checker({ typescript: true }) : undefined,
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
});
