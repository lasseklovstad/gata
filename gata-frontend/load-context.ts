import type { AppLoadContext } from "@remix-run/cloudflare";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { type PlatformProxy } from "wrangler";

import * as schema from "./db/schema";

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
   APP_DATABASE_URL: string;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
   interface AppLoadContext {
      cloudflare: Cloudflare;
      db: PostgresJsDatabase<typeof schema>;
   }
}

type GetLoadContext = (args: {
   request: Request;
   context: { cloudflare: Cloudflare }; // load context _before_ augmentation
}) => AppLoadContext;

// Shared implementation compatible with Vite, Wrangler, and Cloudflare Pages
export const getLoadContext: GetLoadContext = ({ context }) => {
   const queryClient = postgres(context.cloudflare.env.APP_DATABASE_URL);
   const db = drizzle(queryClient, { schema });
   return {
      ...context,
      db,
   };
};
