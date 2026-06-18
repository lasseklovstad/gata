import type { Config } from "@react-router/dev/config";
import { sentryOnBuildEnd } from "@sentry/react-router";

export default {
   ssr: true,
   future: {
      v8_middleware: true,
      v8_passThroughRequests: true,
      v8_splitRouteModules: true,
      v8_trailingSlashAwareDataRequests: true,
      v8_viteEnvironmentApi: true,
   },
   buildEnd: async ({ viteConfig, reactRouterConfig, buildManifest }) => {
      if (process.env.SENTRY_AUTH_TOKEN && process.env.NODE_ENV === "production") {
         await sentryOnBuildEnd({
            viteConfig,
            reactRouterConfig,
            buildManifest,
         });
      }
   },
} satisfies Config;
