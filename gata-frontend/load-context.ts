import { type PlatformProxy } from "wrangler";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Env {
   AUTH0_DOMAIN: string;
   AUTH0_CLIENT_ID: string;
   AUTH0_AUDIENCE: string;
   AUTH0_CLIENT_SECRET: string;
   AUTH0_COOKIE_SECRET: string;
   BACKEND_BASE_URL: string;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
   interface AppLoadContext {
      cloudflare: Cloudflare;
   }
}
