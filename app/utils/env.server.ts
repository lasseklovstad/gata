import { z } from "zod";

const schema = z.object({
   NODE_ENV: z.enum(["production", "development", "test"] as const),
   APP_DATABASE_URL: z.string(),
   DEFAULT_CONTINGENT_SIZE: z.string(),
   CONTINGENT_BANK: z.string(),
   CLOUDINARY_API_SECRET: z.string(),
   CLOUDINARY_API_KEY: z.string(),
   CLOUDINARY_NAME: z.string(),
   MAKE_FIRST_USER_ADMIN: z.string().optional(),
   SENDGRID_API_KEY: z.string(),
   PWA_PUBLIC_KEY: z.string(),
   PWA_PRIVATE_KEY: z.string(),
   IMAGE_DIR: z.string(),
   SENTRY_DSN: z.string(),
   // Auth0 authentication
   AUTH0_DOMAIN: z.string(),
   AUTH0_CLIENT_ID: z.string(),
   AUTH0_AUDIENCE: z.string(),
   AUTH0_CLIENT_SECRET: z.string(),
   AUTH0_COOKIE_SECRET: z.string(),
   AUTH0_CALLBACK: z.string(),
   //Versioning
   COMMIT_SHA: z.string().optional(),
});

type EnvSchema = z.infer<typeof schema>;

declare global {
   // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace NodeJS {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      interface ProcessEnv extends EnvSchema {}
   }
}

export function init() {
   const parsed = schema.safeParse(process.env);

   if (parsed.success === false) {
      console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);

      throw new Error("Invalid environment variables");
   }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
   return {
      MODE: process.env.NODE_ENV,
      SENTRY_DSN: process.env.SENTRY_DSN,
      PWA_PUBLIC_KEY: process.env.PWA_PUBLIC_KEY,
      COMMIT_SHA: process.env.COMMIT_SHA,
   };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
   var ENV: ENV;
   interface Window {
      ENV: ENV;
   }
}
