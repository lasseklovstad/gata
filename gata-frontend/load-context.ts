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
   DEFAULT_CONTINGENT_SIZE: string;
   CONTINGENT_BANK: string;
   CLOUDINARY_API_SECRET: string;
   CLOUDINARY_API_KEY: string;
   CLOUDINARY_NAME: string;
   MAKE_FIRST_USER_ADMIN: string;
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

// Function to get or create the database connection
const getDatabase = (cloudflare: Cloudflare & { db?: PostgresJsDatabase<typeof schema> }) => {
   if (!cloudflare.db) {
      const queryClient = postgres(cloudflare.env.APP_DATABASE_URL);
      cloudflare.db = drizzle(queryClient, { schema });
   }
   return cloudflare.db;
};

// Shared implementation compatible with Vite, Wrangler, and Cloudflare Pages
export const getLoadContext: GetLoadContext = ({ context }) => {
   const db = getDatabase(context.cloudflare);
   return {
      ...context,
      db,
   };
};
