/// <reference types="vitest" />
import { vitePlugin as remix } from "@remix-run/dev";
import { remixDevTools } from "remix-development-tools";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
   interface Future {
      unstable_singleFetch: true;
   }
}

export default defineConfig({
   ssr: {
      noExternal: ["react-easy-crop", "tslib"],
   },
   server: {
      port: 3000,
   },
   plugins: [
      process.env.SHOW_REMIX_DEVTOOLS === "true" ? remixDevTools() : undefined,
      remix({
         future: {
            v3_fetcherPersist: true,
            v3_relativeSplatPath: true,
            v3_throwAbortReason: true,
            unstable_optimizeDeps: true,
            v3_lazyRouteDiscovery: true,
            v3_singleFetch: true,
         },
      }),
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
      minWorkers: 1,
      env: {
         APP_DATABASE_URL: "sqlite_test.db",
      },
   },
});
