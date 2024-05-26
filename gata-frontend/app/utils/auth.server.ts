import { createCookieSessionStorage, redirect, type AppLoadContext } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import type { Auth0Profile } from "remix-auth-auth0";
import { Auth0Strategy } from "remix-auth-auth0";

export type Auth0User = { profile: Auth0Profile; accessToken: string };

export const createAuthenticator = (context: AppLoadContext) => {
   const env = context.cloudflare.env;
   const sessionStorage = createCookieSessionStorage({
      cookie: {
         name: "_remix_session",
         sameSite: "lax",
         path: "/",
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         secrets: [env.AUTH0_COOKIE_SECRET!],
      },
   });

   const authenticator = new Authenticator<Auth0User>(sessionStorage);

   const auth0Strategy = new Auth0Strategy(
      {
         callbackURL: "/callback",
         clientID: env.AUTH0_CLIENT_ID!,
         audience: env.AUTH0_AUDIENCE!,
         clientSecret: env.AUTH0_CLIENT_SECRET!,
         domain: env.AUTH0_DOMAIN!,
      },
      ({ profile, accessToken }) => {
         // Get the user data from your DB or API using the tokens and profile
         return Promise.resolve({ profile, accessToken });
      }
   );

   authenticator.use(auth0Strategy);

   const { getSession, destroySession } = sessionStorage;

   const getRequiredAuthToken = async (request: Request) => {
      const auth = await authenticator.isAuthenticated(request);
      if (auth === null) {
         throw redirect("/home");
      }
      return auth.accessToken;
   };

   const getRequiredAuth = async (request: Request) => {
      const auth = await authenticator.isAuthenticated(request);
      if (!auth) {
         throw redirect("/home");
      }
      return auth;
   };

   return { getSession, destroySession, getRequiredAuthToken, authenticator, getRequiredAuth };
};
