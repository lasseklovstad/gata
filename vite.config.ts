import { vitePlugin as remix } from "@remix-run/dev";
import { remixDevTools } from "remix-development-tools";
import { defineConfig } from "vite";
// eslint-disable-next-line import/no-named-as-default
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

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
            unstable_lazyRouteDiscovery: true,
            unstable_singleFetch: true,
         },
      }),
      tsconfigPaths(),
      process.env.NODE_ENV === "development" ? checker({ typescript: true }) : undefined,
   ],
});
