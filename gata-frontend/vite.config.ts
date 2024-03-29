import { cloudflareDevProxyVitePlugin, vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
   server: {
      port: 3000,
   },
   plugins: [
      cloudflareDevProxyVitePlugin(),
      remix({
         future: {
            v3_fetcherPersist: true,
            v3_relativeSplatPath: true,
            v3_throwAbortReason: true,
         },
      }),
      tsconfigPaths(),
      process.env.NODE_ENV === "development" ? checker({ typescript: true }) : undefined,
   ],
});
